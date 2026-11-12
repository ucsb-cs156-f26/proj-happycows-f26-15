package edu.ucsb.cs156.happiercows.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Herd;
import edu.ucsb.cs156.happiercows.entities.User;

/**
 * Verifies Herd persistence and its derived queries against a real database,
 * since a mocked repository can't catch a bad Spring Data method name or a
 * wrong mapping of the composite (user_id, game_id) Farmer key.
 */
@DataJpaTest
public class HerdRepositoryTests {

    @Autowired
    private HerdRepository herdRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    private Game game;
    private Farmer farmer;
    private Farmer otherFarmer;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(User.builder().email("a@ucsb.edu").build());
        User otherUser = userRepository.save(User.builder().email("b@ucsb.edu").build());
        game = gameRepository.save(Game.builder().name("test game").lastDate(LocalDateTime.now()).build());
        farmer = farmerRepository.save(Farmer.builder().user(user).game(game).username("a").build());
        otherFarmer = farmerRepository.save(Farmer.builder().user(otherUser).game(game).username("b").build());
    }

    private Herd save(Farmer owner, int numCows, double cowHealth) {
        return herdRepository.save(Herd.builder().farmer(owner).numCows(numCows).cowHealth(cowHealth).build());
    }

    @Test
    void saves_and_reloads_a_herd() {
        Herd saved = save(farmer, 5, 80.5);

        Herd found = herdRepository.findById(saved.getId()).orElseThrow();

        assertEquals(5, found.getNumCows());
        assertEquals(80.5, found.getCowHealth());
        assertEquals(farmer.getId(), found.getFarmer().getId());
    }

    @Test
    void a_farmer_can_own_multiple_herds_with_distinct_health() {
        save(farmer, 3, 100.0);
        save(farmer, 7, 40.0);

        List<Herd> herds = herdRepository.findByFarmer(farmer);

        assertEquals(2, herds.size());
        assertTrue(herds.stream().anyMatch(h -> h.getNumCows() == 3 && h.getCowHealth() == 100.0));
        assertTrue(herds.stream().anyMatch(h -> h.getNumCows() == 7 && h.getCowHealth() == 40.0));
    }

    @Test
    void findByFarmer_excludes_other_farmers_herds() {
        save(farmer, 3, 100.0);
        save(otherFarmer, 9, 10.0);

        List<Herd> herds = herdRepository.findByFarmer(farmer);

        assertEquals(1, herds.size());
        assertEquals(3, herds.get(0).getNumCows());
    }

    @Test
    void findByFarmer_Game_returns_herds_of_every_farmer_in_the_game() {
        Game otherGame = gameRepository.save(Game.builder().name("other").lastDate(LocalDateTime.now()).build());
        Farmer inOtherGame = farmerRepository
                .save(Farmer.builder().user(farmer.getUser()).game(otherGame).username("a2").build());
        save(farmer, 1, 1.0);
        save(otherFarmer, 2, 2.0);
        save(inOtherGame, 3, 3.0);

        List<Herd> herds = herdRepository.findByFarmer_Game(game);

        assertEquals(2, herds.size());
        assertFalse(herds.stream().anyMatch(h -> h.getNumCows() == 3));
    }

    @Test
    void deleting_a_herd_removes_it() {
        Herd saved = save(farmer, 4, 50.0);

        herdRepository.deleteById(saved.getId());

        assertTrue(herdRepository.findById(saved.getId()).isEmpty());
    }
}
