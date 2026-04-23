package com.eventannouncement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Date;
import java.sql.*;
import java.time.LocalDateTime;

@Service
@ConditionalOnProperty(name = "app.data-sql.auto-export", havingValue = "true", matchIfMissing = true)
public class DataSqlExportService {

    private static final Logger log = LoggerFactory.getLogger(DataSqlExportService.class);

    private static final String EXPORT_KEY = DataSqlExportService.class.getName() + ".scheduled";

    /**
     * FK-safe delete order then insert order.
     */
    private static final String[] DELETE_ORDER = {"event_registrations", "events", "app_users", "categories"};
    private static final String[] INSERT_ORDER = {"categories", "app_users", "events", "event_registrations"};

    private final JdbcTemplate jdbcTemplate;
    private final Path exportPath;
    private final Object exportLock = new Object();

    public DataSqlExportService(DataSource dataSource, @Value("${app.data-sql.path:}") String configuredPath) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
        this.exportPath = resolveExportPath(configuredPath);
    }

    private static Path resolveExportPath(String configuredPath) {
        if (configuredPath != null && !configuredPath.isBlank()) {
            return Path.of(configuredPath).toAbsolutePath().normalize();
        }
        Path cwd = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        if (Files.exists(cwd.resolve("backend/pom.xml")) || Files.exists(cwd.resolve("backend/build.gradle"))) {
            return cwd.resolve("backend/src/main/resources/data.sql").normalize();
        }
        return cwd.resolve("src/main/resources/data.sql").normalize();
    }

    public void scheduleExportAfterCommit() {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            exportNow();
            return;
        }
        if (TransactionSynchronizationManager.hasResource(EXPORT_KEY)) {
            return;
        }
        TransactionSynchronizationManager.bindResource(EXPORT_KEY, Boolean.TRUE);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                exportNow();
            }

            @Override
            public void afterCompletion(int status) {
                TransactionSynchronizationManager.unbindResourceIfPossible(EXPORT_KEY);
            }
        });
    }

    public void exportNow() {
        try {
            doExportNow();
        } catch (Exception e) {
            // Never break user requests or expose SQL tooling errors to clients
            log.warn("data.sql auto-export failed (skipped): {}", e.getMessage());
            log.debug("data.sql export detail", e);
        }
    }

    private void doExportNow() {
        synchronized (exportLock) {
            Path parent = exportPath.getParent();
            if (parent != null) {
                try {
                    Files.createDirectories(parent);
                } catch (IOException e) {
                    throw new IllegalStateException("Cannot create directory for data.sql: " + parent, e);
                }
            }

            StringBuilder sb = new StringBuilder();
            sb.append("-- Auto-generated snapshot (categories, app_users, events, event_registrations).\n");
            sb.append("-- Overwritten after each INSERT/UPDATE/DELETE; commit to share with teammates.\n\n");

            sb.append("SET REFERENTIAL_INTEGRITY FALSE;\n");
            for (String table : DELETE_ORDER) {
                String qualified = resolveQuotedTableName(table);
                if (qualified != null) {
                    sb.append("DELETE FROM ").append(qualified).append(";\n");
                }
            }
            sb.append("SET REFERENTIAL_INTEGRITY TRUE;\n\n");

            for (String table : INSERT_ORDER) {
                if (resolveQuotedTableName(table) != null) {
                    appendInsertsForTable(sb, table);
                }
            }

            try {
                Files.writeString(exportPath, sb.toString(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new IllegalStateException("Failed writing data.sql to " + exportPath, e);
            }
        }
    }

    /**
     * H2 table name as stored (quoted for SQL). Uses PUBLIC schema first, then any schema — avoids
     * SCHEMA() differences between H2 versions.
     */
    private String resolveQuotedTableName(String logicalTable) {
        String name = jdbcTemplate.query(
                """
                        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
                        WHERE UPPER(TABLE_SCHEMA) = 'PUBLIC' AND UPPER(TABLE_NAME) = UPPER(?)
                        FETCH FIRST 1 ROW ONLY
                        """,
                ps -> ps.setString(1, logicalTable),
                rs -> rs.next() ? rs.getString(1) : null);
        if (name == null) {
            name = jdbcTemplate.query(
                    """
                            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
                            WHERE UPPER(TABLE_NAME) = UPPER(?)
                            FETCH FIRST 1 ROW ONLY
                            """,
                    ps -> ps.setString(1, logicalTable),
                    rs -> rs.next() ? rs.getString(1) : null);
        }
        return name != null ? quoteIdent(name) : null;
    }

    private String resolveQuotedPrimaryKeyColumn(String logicalTable) {
        String col = jdbcTemplate.query(
                """
                        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE UPPER(TABLE_SCHEMA) = 'PUBLIC' AND UPPER(TABLE_NAME) = UPPER(?)
                        AND UPPER(COLUMN_NAME) = 'ID'
                        FETCH FIRST 1 ROW ONLY
                        """,
                ps -> ps.setString(1, logicalTable),
                rs -> rs.next() ? rs.getString(1) : null);
        if (col == null) {
            col = jdbcTemplate.query(
                    """
                            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE UPPER(TABLE_NAME) = UPPER(?) AND UPPER(COLUMN_NAME) = 'ID'
                            FETCH FIRST 1 ROW ONLY
                            """,
                    ps -> ps.setString(1, logicalTable),
                    rs -> rs.next() ? rs.getString(1) : null);
        }
        return col != null ? quoteIdent(col) : quoteIdent("ID");
    }

    private void appendInsertsForTable(StringBuilder sb, String table) {
        String tableRef = resolveQuotedTableName(table);
        if (tableRef == null) {
            return;
        }
        String orderCol = resolveQuotedPrimaryKeyColumn(table);
        String sql = "SELECT * FROM " + tableRef + " ORDER BY " + orderCol;
        jdbcTemplate.query(sql, rs -> {
            ResultSetMetaData md = rs.getMetaData();
            int colCount = md.getColumnCount();
            while (rs.next()) {
                sb.append("INSERT INTO ").append(tableRef).append(" (");
                for (int i = 1; i <= colCount; i++) {
                    if (i > 1) {
                        sb.append(", ");
                    }
                    sb.append(quoteIdent(md.getColumnName(i)));
                }
                sb.append(") VALUES (");
                for (int i = 1; i <= colCount; i++) {
                    if (i > 1) {
                        sb.append(", ");
                    }
                    sb.append(sqlLiteral(rs, i, md.getColumnType(i)));
                }
                sb.append(");\n");
            }
            return null;
        });
    }

    private static String quoteIdent(String name) {
        return "\"" + name.replace("\"", "\"\"") + "\"";
    }

    private static String sqlLiteral(ResultSet rs, int col, int sqlType) throws SQLException {
        Object v = rs.getObject(col);
        if (v == null || rs.wasNull()) {
            return "NULL";
        }
        if (v instanceof String s) {
            return "'" + s.replace("'", "''") + "'";
        }
        if (v instanceof Boolean b) {
            return b ? "TRUE" : "FALSE";
        }
        if (v instanceof Number) {
            return v.toString();
        }
        if (v instanceof byte[] bytes) {
            return "X'" + bytesToHex(bytes) + "'";
        }
        if (v instanceof Timestamp ts) {
            return "TIMESTAMP '" + ts.toLocalDateTime() + "'";
        }
        if (v instanceof Time t) {
            return "TIME '" + t.toLocalTime() + "'";
        }
        if (v instanceof Date d) {
            return "DATE '" + d.toLocalDate() + "'";
        }
        if (v instanceof LocalDateTime ldt) {
            return "TIMESTAMP '" + ldt + "'";
        }
        return "'" + v.toString().replace("'", "''") + "'";
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
