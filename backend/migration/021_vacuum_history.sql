-- migrate:no-transaction
-- DELETE only marks rows dead; VACUUM FULL rewrites the tables so the freed space
-- counts against the Neon storage limit again. It cannot run inside a transaction.
VACUUM FULL character_highscores_snapshots;
VACUUM FULL character_highscores_latest;
VACUUM FULL character_lookups;
