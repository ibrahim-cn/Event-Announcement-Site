-- Auto-generated snapshot (categories, app_users, events, event_registrations).
-- Overwritten after each INSERT/UPDATE/DELETE; commit to share with teammates.

SET REFERENTIAL_INTEGRITY FALSE;
DELETE FROM "EVENTS";
DELETE FROM "APP_USERS";
SET REFERENTIAL_INTEGRITY TRUE;

INSERT INTO "APP_USERS" ("ID", "CREATED_DATE", "STATUS", "EMAIL", "PASSWORD", "USERNAME") VALUES (1, TIMESTAMP '2026-04-09T00:14:25.608784', TRUE, 'test@testmail.com', 'test123', 'ibrahim can');
INSERT INTO "APP_USERS" ("ID", "CREATED_DATE", "STATUS", "EMAIL", "PASSWORD", "USERNAME") VALUES (2, TIMESTAMP '2026-04-09T00:22:45.424410', TRUE, 'test1@testmail.com', '123456', 'ibrahim can');
INSERT INTO "APP_USERS" ("ID", "CREATED_DATE", "STATUS", "EMAIL", "PASSWORD", "USERNAME") VALUES (3, TIMESTAMP '2026-04-09T00:25:35.632983', TRUE, 'test2@testmail.com', '1234556', 'ibrahim can');
