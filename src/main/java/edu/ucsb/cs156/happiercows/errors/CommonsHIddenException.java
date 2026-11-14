package edu.ucsb.cs156.happiercows.errors;

public class CommonsHIddenException extends RuntimeException {
    public CommonsHIddenException(Long id) {
        super("Commons with id %d is hidden".formatted(id));
    }
}

