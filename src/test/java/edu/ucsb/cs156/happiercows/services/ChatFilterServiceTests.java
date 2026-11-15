package edu.ucsb.cs156.happiercows.services;

import edu.ucsb.cs156.happiercows.entities.BannedWord;
import edu.ucsb.cs156.happiercows.models.CensorResult;
import edu.ucsb.cs156.happiercows.repositories.BannedWordRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@Import(ChatFilterService.class)
@ContextConfiguration
public class ChatFilterServiceTests {

    @MockBean
    BannedWordRepository bannedWordRepository;

    @Autowired
    ChatFilterService chatFilterService;

    private void banned(String... words) {
        List<BannedWord> list = Arrays.stream(words)
                .map(w -> BannedWord.builder().word(w).build())
                .toList();
        when(bannedWordRepository.findAll()).thenReturn(list);
    }

    @Test
    public void no_banned_words_leaves_message_unchanged() {
        banned();
        CensorResult result = chatFilterService.censor("darn it");
        assertEquals("darn it", result.getText());
        assertFalse(result.isCensored());
    }

    @Test
    public void message_without_matches_is_unchanged() {
        banned("darn");
        CensorResult result = chatFilterService.censor("hello there");
        assertEquals("hello there", result.getText());
        assertFalse(result.isCensored());
    }

    @Test
    public void single_banned_word_is_censored() {
        banned("darn");
        CensorResult result = chatFilterService.censor("darn it");
        assertEquals("**** it", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void multiple_banned_words_are_censored() {
        banned("darn", "heck");
        CensorResult result = chatFilterService.censor("darn and heck");
        assertEquals("**** and ****", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void matching_is_case_insensitive() {
        banned("darn");
        CensorResult result = chatFilterService.censor("DaRn it");
        assertEquals("**** it", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void banned_word_inside_longer_word_is_not_censored() {
        banned("cow");
        CensorResult result = chatFilterService.censor("cowboy cow");
        assertEquals("cowboy ***", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void banned_word_next_to_letters_digits_or_underscore_is_not_censored() {
        banned("darn");
        CensorResult result = chatFilterService.censor("darn_it darn1 adarn");
        assertEquals("darn_it darn1 adarn", result.getText());
        assertFalse(result.isCensored());
    }

    @Test
    public void banned_word_next_to_punctuation_is_censored() {
        banned("darn");
        CensorResult result = chatFilterService.censor("darn! (darn)");
        assertEquals("****! (****)", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void banned_word_with_special_characters_is_matched_literally() {
        banned("c++", "a.b");
        CensorResult result = chatFilterService.censor("c++ axb a.b");
        assertEquals("*** axb ***", result.getText());
        assertTrue(result.isCensored());
    }
}