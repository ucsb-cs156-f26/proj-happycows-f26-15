package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.BannedWord;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BannedWordRepository extends CrudRepository<BannedWord, Long> {
    Optional<BannedWord> findByWord(String word);
}