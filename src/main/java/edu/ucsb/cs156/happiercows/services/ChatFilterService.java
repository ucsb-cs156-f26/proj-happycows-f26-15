package edu.ucsb.cs156.happiercows.services;

import edu.ucsb.cs156.happiercows.entities.BannedWord;
import edu.ucsb.cs156.happiercows.models.CensorResult;
import edu.ucsb.cs156.happiercows.repositories.BannedWordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/** Replaces banned words in chat messages with asterisks. */
@Service
public class ChatFilterService {

    // A match must not have a letter, combining mark, digit, or underscore directly
    // before or after it, so banning "cow" does not censor "cowboy".
    private static final String NOT_WORD_CHAR_BEFORE = "(?<![\\p{L}\\p{M}\\p{N}_])";
    private static final String NOT_WORD_CHAR_AFTER = "(?![\\p{L}\\p{M}\\p{N}_])";

    @Autowired
    private BannedWordRepository bannedWordRepository;

    /**
     * Lowercases each character on its own with Locale.ROOT. Used both when storing a
     * banned word and when matching a message, so the two always agree. Some characters
     * expand when lowercased (e.g. "İ" becomes "i" plus a combining dot).
     */
    public static String fold(String text) {
        StringBuilder sb = new StringBuilder();
        text.codePoints().forEach(cp -> sb.append(lowerCodePoint(cp)));
        return sb.toString();
    }

    /** How a banned word is stored: trimmed, then folded. */
    public static String normalize(String word) {
        return fold(word.trim());
    }

    private static String lowerCodePoint(int cp) {
        return new String(Character.toChars(cp)).toLowerCase(Locale.ROOT);
    }

    public CensorResult censor(String message) {
        // Longest first, so "c++" is matched before "c" when both are banned
        List<String> words = StreamSupport
                .stream(bannedWordRepository.findAll().spliterator(), false)
                .map(BannedWord::getWord)
                .map(ChatFilterService::normalize)
                .filter(w -> !w.isEmpty())
                .distinct()
                .sorted(Comparator.comparingInt(String::length).reversed())
                .collect(Collectors.toList());

        if (words.isEmpty()) {
            return new CensorResult(message, false);
        }

        // Fold the message, remembering which original characters each folded char came from
        StringBuilder folded = new StringBuilder();
        List<Integer> originalStart = new ArrayList<>();
        List<Integer> originalEnd = new ArrayList<>();
        int i = 0;
        while (i < message.length()) {
            int cp = message.codePointAt(i);
            int next = i + Character.charCount(cp);
            String lower = lowerCodePoint(cp);
            for (int k = 0; k < lower.length(); k++) {
                originalStart.add(i);
                originalEnd.add(next);
            }
            folded.append(lower);
            i = next;
        }

        String alternatives = words.stream()
                .map(Pattern::quote)
                .collect(Collectors.joining("|"));
        Pattern pattern = Pattern.compile(
                NOT_WORD_CHAR_BEFORE + "(?:" + alternatives + ")" + NOT_WORD_CHAR_AFTER);

        Matcher matcher = pattern.matcher(folded);
        StringBuilder result = new StringBuilder();
        int last = 0;
        boolean censored = false;
        while (matcher.find()) {
            int start = originalStart.get(matcher.start());
            int end = originalEnd.get(matcher.end() - 1);
            result.append(message, last, start)
                    .append("*".repeat(message.codePointCount(start, end)));
            last = end;
            censored = true;
        }

        if (!censored) {
            return new CensorResult(message, false);
        }
        result.append(message.substring(last));
        return new CensorResult(result.toString(), true);
    }
}