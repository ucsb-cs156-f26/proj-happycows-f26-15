package edu.ucsb.cs156.happiercows.migrations;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

/**
 * Verifies the schema Liquibase actually built for the herd table (see issue
 * #12): the table, its columns, the foreign key to farmer, and the index on
 * the owning farmer. The persistence tests in HerdRepositoryTests prove the
 * entity mapping works, but not that the migration itself created these.
 */
@DataJpaTest
public class HerdTableMigrationTests {

    @Autowired
    private DataSource dataSource;

    private List<String> columnNames(DatabaseMetaData meta, String table) throws Exception {
        List<String> names = new ArrayList<>();
        try (ResultSet rs = meta.getColumns(null, null, table, null)) {
            while (rs.next()) {
                names.add(rs.getString("COLUMN_NAME").toLowerCase(Locale.ROOT));
            }
        }
        return names;
    }

    private String findTable(DatabaseMetaData meta, String table) throws Exception {
        try (ResultSet rs = meta.getTables(null, null, "%", new String[] { "TABLE" })) {
            while (rs.next()) {
                if (rs.getString("TABLE_NAME").equalsIgnoreCase(table)) {
                    return rs.getString("TABLE_NAME");
                }
            }
        }
        throw new AssertionError("table not found: " + table);
    }

    @Test
    void herd_table_has_the_expected_columns() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            List<String> columns = columnNames(meta, findTable(meta, "herd"));

            assertEquals(5, columns.size());
            assertTrue(columns.containsAll(List.of("id", "user_id", "game_id", "num_cows", "cow_health")));
        }
    }

    @Test
    void herd_references_its_farmer_by_game_and_user() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            List<String> fkColumns = new ArrayList<>();
            try (ResultSet rs = meta.getImportedKeys(null, null, findTable(meta, "herd"))) {
                while (rs.next()) {
                    assertEquals("farmer", rs.getString("PKTABLE_NAME").toLowerCase(Locale.ROOT));
                    assertEquals("FK_HERD_FARMER", rs.getString("FK_NAME"));
                    fkColumns.add(rs.getString("FKCOLUMN_NAME").toLowerCase(Locale.ROOT));
                }
            }

            assertEquals(2, fkColumns.size());
            assertTrue(fkColumns.containsAll(List.of("game_id", "user_id")));
        }
    }

    @Test
    void herd_is_indexed_by_owning_farmer() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            List<String> indexed = new ArrayList<>();
            try (ResultSet rs = meta.getIndexInfo(null, null, findTable(meta, "herd"), false, false)) {
                while (rs.next()) {
                    if ("IDX_HERD_FARMER".equalsIgnoreCase(rs.getString("INDEX_NAME"))) {
                        indexed.add(rs.getString("COLUMN_NAME").toLowerCase(Locale.ROOT));
                    }
                }
            }

            assertEquals(List.of("game_id", "user_id"), indexed);
        }
    }
}
