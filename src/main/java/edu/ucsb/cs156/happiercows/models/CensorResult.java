package edu.ucsb.cs156.happiercows.models;

import lombok.AllArgsConstructor;
import lombok.Data;

/** The result of censoring a chat message. */
@Data
@AllArgsConstructor
public class CensorResult {
    /** The message with banned words replaced by asterisks. */
    private String text;

    /** True if at least one banned word was replaced. */
    private boolean censored;
}