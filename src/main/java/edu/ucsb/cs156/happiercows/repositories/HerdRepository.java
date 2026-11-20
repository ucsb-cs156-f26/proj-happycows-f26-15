package edu.ucsb.cs156.happiercows.repositories;

import java.util.List;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.Herd;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HerdRepository extends CrudRepository<Herd, Long> {
    List<Herd> findByFarmer(Farmer farmer);

    List<Herd> findByFarmer_Game(Game game);
}
