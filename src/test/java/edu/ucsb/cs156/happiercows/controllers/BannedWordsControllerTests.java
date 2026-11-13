package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.BannedWord;
import edu.ucsb.cs156.happiercows.repositories.BannedWordRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = BannedWordsController.class)
public class BannedWordsControllerTests extends ControllerTestCase {

    @MockBean
    BannedWordRepository bannedWordRepository;

    @MockBean
    UserRepository userRepository;

    // --- Authorization ---

    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/admin/bannedwords/all"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regular_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/admin/bannedwords/all"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regular_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/admin/bannedwords/post?word=darn").with(csrf()))
                .andExpect(status().is(403));
        verify(bannedWordRepository, never()).save(any());
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void regular_users_cannot_delete() throws Exception {
        mockMvc.perform(delete("/api/admin/bannedwords?id=1").with(csrf()))
                .andExpect(status().is(403));
        verify(bannedWordRepository, never()).delete(any());
    }

    // --- GET /all ---

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_get_all_banned_words() throws Exception {
        BannedWord w1 = BannedWord.builder().id(1L).word("darn").build();
        BannedWord w2 = BannedWord.builder().id(2L).word("heck").build();
        List<BannedWord> expected = List.of(w1, w2);
        when(bannedWordRepository.findAll()).thenReturn(expected);

        MvcResult response = mockMvc.perform(get("/api/admin/bannedwords/all"))
                .andExpect(status().isOk()).andReturn();

        verify(bannedWordRepository, times(1)).findAll();
        assertEquals(mapper.writeValueAsString(expected), response.getResponse().getContentAsString());
    }

    // --- POST /post ---

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_post_word_and_it_is_trimmed_and_lowercased() throws Exception {
        BannedWord toSave = BannedWord.builder().word("darn").build();
        BannedWord saved = BannedWord.builder().id(1L).word("darn").build();
        when(bannedWordRepository.findByWord("darn")).thenReturn(Optional.empty());
        when(bannedWordRepository.save(toSave)).thenReturn(saved);

        MvcResult response = mockMvc.perform(
                post("/api/admin/bannedwords/post").param("word", "  DaRn  ").with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(bannedWordRepository, times(1)).findByWord("darn");
        verify(bannedWordRepository, times(1)).save(toSave);
        assertEquals(mapper.writeValueAsString(saved), response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_cannot_post_blank_word() throws Exception {
        MvcResult response = mockMvc.perform(
                post("/api/admin/bannedwords/post").param("word", "   ").with(csrf()))
                .andExpect(status().isBadRequest()).andReturn();

        verify(bannedWordRepository, never()).save(any());
        assertEquals(Map.of("message", "Word must not be blank"), responseToJson(response));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_cannot_post_duplicate_word() throws Exception {
        BannedWord existing = BannedWord.builder().id(1L).word("darn").build();
        when(bannedWordRepository.findByWord("darn")).thenReturn(Optional.of(existing));

        MvcResult response = mockMvc.perform(
                post("/api/admin/bannedwords/post").param("word", "Darn").with(csrf()))
                .andExpect(status().isBadRequest()).andReturn();

        verify(bannedWordRepository, never()).save(any());
        assertEquals(Map.of("message", "Word 'darn' is already banned"), responseToJson(response));
    }

    // --- DELETE ---

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_delete_existing_word() throws Exception {
        BannedWord existing = BannedWord.builder().id(7L).word("darn").build();
        when(bannedWordRepository.findById(7L)).thenReturn(Optional.of(existing));

        MvcResult response = mockMvc.perform(delete("/api/admin/bannedwords?id=7").with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(bannedWordRepository, times(1)).delete(existing);
        assertEquals(Map.of("message", "BannedWord with id 7 deleted"), responseToJson(response));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_gets_404_deleting_missing_word() throws Exception {
        when(bannedWordRepository.findById(99L)).thenReturn(Optional.empty());

        MvcResult response = mockMvc.perform(delete("/api/admin/bannedwords?id=99").with(csrf()))
                .andExpect(status().isNotFound()).andReturn();

        verify(bannedWordRepository, never()).delete(any());
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("BannedWord with id 99 not found", json.get("message"));
    }
}