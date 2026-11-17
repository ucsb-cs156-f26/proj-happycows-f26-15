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

        @Test
    public void longer_banned_word_wins_over_shorter_prefix_regardless_of_order() {
        banned("c", "c++");
        CensorResult result = chatFilterService.censor("c++ and c");
        assertEquals("*** and *", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void longer_banned_word_wins_when_stored_after_shorter() {
        banned("c++", "c");
        CensorResult result = chatFilterService.censor("c++ and c");
        assertEquals("*** and *", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void unicode_word_that_expands_when_lowercased_is_censored() {
        // "İ" lowercases to "i" + U+0307, so the stored word is 5 chars long
        banned(ChatFilterService.normalize("İNEK"));
        CensorResult result = chatFilterService.censor("İNEK geldi");
        assertEquals("**** geldi", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void stored_word_is_matched_even_if_not_already_normalized() {
        banned("  DaRn ");
        CensorResult result = chatFilterService.censor("darn");
        assertEquals("****", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void blank_stored_words_are_ignored() {
        banned("   ", "darn");
        CensorResult result = chatFilterService.censor("a darn day");
        assertEquals("a **** day", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void duplicate_stored_words_still_censor_once() {
        banned("darn", "darn");
        CensorResult result = chatFilterService.censor("darn");
        assertEquals("****", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void shorter_word_does_not_match_inside_expanded_character() {
        // Banning "i" must not censor the "i" that "İ" lowercases into
        banned("i");
        CensorResult result = chatFilterService.censor("İNEK");
        assertEquals("İNEK", result.getText());
        assertFalse(result.isCensored());
    }

    @Test
    public void emoji_around_a_banned_word_are_kept() {
        banned("darn");
        CensorResult result = chatFilterService.censor("😀 darn 😀");
        assertEquals("😀 **** 😀", result.getText());
        assertTrue(result.isCensored());
    }

    @Test
    public void normalize_trims_and_lowercases_with_expansion() {
        assertEquals("darn", ChatFilterService.normalize("  DaRn  "));
        assertEquals("i\u0307nek", ChatFilterService.normalize("İNEK"));
    }

    @Test
    public void only_blank_stored_words_censor_nothing() {
        // If blank words weren't filtered out, the empty pattern would match
        // between the space and "!" and mark the message as censored
        banned("   ");
        CensorResult result = chatFilterService.censor("hello !");
        assertEquals("hello !", result.getText());
        assertFalse(result.isCensored());
    }
}