-- Auto-generated snapshot (categories, app_users, events, event_registrations).
-- Overwritten after each INSERT/UPDATE/DELETE; commit to share with teammates.

SET REFERENTIAL_INTEGRITY FALSE;
DELETE FROM "EVENTS";
DELETE FROM "APP_USERS";
SET REFERENTIAL_INTEGRITY TRUE;

INSERT INTO "APP_USERS" ("ID", "CREATED_DATE", "STATUS", "EMAIL", "PASSWORD", "USERNAME") VALUES (1, TIMESTAMP '2026-04-20T02:04:21.216790', TRUE, '123@gmail.com', '123456', 'Hatice');
