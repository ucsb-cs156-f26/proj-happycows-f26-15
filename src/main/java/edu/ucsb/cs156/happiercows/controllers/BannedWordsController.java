package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.BannedWord;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.repositories.BannedWordRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.dao.DataIntegrityViolationException;
import edu.ucsb.cs156.happiercows.services.ChatFilterService;

/** Admin-only API for maintaining the list of words censored in chat. */
@Slf4j
@Tag(name = "Banned Words")
@RequestMapping("/api/admin/bannedwords")
@RestController
public class BannedWordsController extends ApiController {

    @Autowired
    private BannedWordRepository bannedWordRepository;

    @Operation(summary = "List all banned words")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<BannedWord> allBannedWords() {
        return bannedWordRepository.findAll();
    }

    @Operation(summary = "Add a banned word (stored trimmed and lowercase)")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public ResponseEntity<Object> postBannedWord(
            @Parameter(name = "word") @RequestParam String word) {
        String normalized = ChatFilterService.normalize(word);

        if (normalized.isEmpty()) {
            return ResponseEntity.badRequest().body(genericMessage("Word must not be blank"));
        }
        if (bannedWordRepository.findByWord(normalized).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(genericMessage("Word '%s' is already banned".formatted(normalized)));
        }

        try {
            BannedWord saved = bannedWordRepository.save(BannedWord.builder().word(normalized).build());
            return ResponseEntity.ok(saved);
        } catch (DataIntegrityViolationException e) {
            // Another request inserted the same word between findByWord() and save()
            return ResponseEntity.badRequest()
                    .body(genericMessage("Word '%s' is already banned".formatted(normalized)));
        }
    }

    @Operation(summary = "Remove a banned word")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteBannedWord(
            @Parameter(name = "id") @RequestParam Long id) {
        BannedWord bannedWord = bannedWordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(BannedWord.class, id));

        bannedWordRepository.delete(bannedWord);
        return genericMessage("BannedWord with id %s deleted".formatted(id));
    }
}