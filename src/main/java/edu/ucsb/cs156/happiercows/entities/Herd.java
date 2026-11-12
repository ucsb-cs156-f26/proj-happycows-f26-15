package edu.ucsb.cs156.happiercows.entities;

import jakarta.persistence.*;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * A group of cows owned by one farmer in one game that share a single health
 * value. A farmer may own many herds, each with its own size and health.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "herd")
public class Herd {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    // See Profit.farmer for why this is a @ManyToOne over Farmer's composite
    // (user_id, game_id) key rather than a single farmerId column.
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "user_id", referencedColumnName = "user_id"),
        @JoinColumn(name = "game_id", referencedColumnName = "game_id")
    })
    private Farmer farmer;

    private int numCows;

    private double cowHealth;
}
