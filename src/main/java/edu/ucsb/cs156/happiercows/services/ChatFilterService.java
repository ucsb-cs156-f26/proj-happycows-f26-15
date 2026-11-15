package edu.ucsb.cs156.happiercows.services;

import edu.ucsb.cs156.happiercows.entities.BannedWord;
import edu.ucsb.cs156.happiercows.models.CensorResult;
import edu.ucsb.cs156.happiercows.repositories.BannedWordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/** Replaces banned words in chat messages with asterisks. */
@Service
public class ChatFilterService {

    // A match must not have a letter, digit, or underscore directly before or after it,
    // so banning "cow" does not censor "cowboy".
    private static final String NOT_WORD_CHAR_BEFORE = "(?<![\\p{L}\\p{N}_])";
    private static final String NOT_WORD_CHAR_AFTER = "(?![\\p{L}\\p{N}_])";

    @Autowired
    private BannedWordRepository bannedWordRepository;

    public CensorResult censor(String message) {
        List<String> words = StreamSupport
                .stream(bannedWordRepository.findAll().spliterator(), false)
                .map(BannedWord::getWord)
                .collect(Collectors.toList());

        if (words.isEmpty()) {
            return new CensorResult(message, false);
        }

        String alternatives = words.stream()
                .map(Pattern::quote)
                .collect(Collectors.joining("|"));

        Pattern pattern = Pattern.compile(
                NOT_WORD_CHAR_BEFORE + "(?:" + alternatives + ")" + NOT_WORD_CHAR_AFTER,
                Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

        if (!pattern.matcher(message).find()) {
            return new CensorResult(message, false);
        }

        String censoredText = pattern.matcher(message)
                .replaceAll(match -> "*".repeat(match.group().length()));
        return new CensorResult(censoredText, true);
    }
}