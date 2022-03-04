const sqlite3 = require('better-sqlite3');

function createDatabase(filename, options = {}) {
  const db = sqlite3(filename, options);

  createTables(db);
  createIndexes(db);
  createTriggers(db);
  migrate(db);

  return db;
}

function createTables(db) {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS comic (
      id TEXT NOT NULL PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      synopsis TEXT,
      created INTEGER DEFAULT (strftime('%s', CURRENT_TIMESTAMP)),
      accessed INTEGER DEFAULT NULL,
      updated INTEGER DEFAULT NULL,
      bookmark INTEGER NOT NULL DEFAULT -1,
      cover_type TEXT NOT NULL,
      cover_width INTEGER NOT NULL,
      cover_height INTEGER NOT NULL,
      cover_data BLOB NOT NULL,
      brightness REAL NOT NULL DEFAULT 1.0,
      page_fit TEXT NOT NULL DEFAULT 'contain',
      page_position TEXT NOT NULL DEFAULT 'center center',
      page_zoom REAL NOT NULL DEFAULT 1.0,
      updates_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      -- Time between automatic updates in seconds
      update_interval INTEGER NOT NULL DEFAULT 86400,
      -- Maximum number of new pages to automatically fetch
      update_limit INTEGER NOT NULL DEFAULT 3,
      CONSTRAINT comic_ck_bookmark_is_valid CHECK (bookmark >= -1),
      CONSTRAINT comic_ck_brightness_is_valid CHECK (brightness BETWEEN 0.25 AND 1.25),
      CONSTRAINT comic_ck_page_fit_is_valid CHECK (page_fit IN (
        'contain', 'cover', 'fill', 'none', 'scale-down'
      )),
      CONSTRAINT comic_ck_page_position_is_valid CHECK (page_position IN (
        'left top', 'center top', 'right top',
        'left center', 'center center', 'right center',
        'left bottom', 'center bottom', 'right bottom'
      )),
      CONSTRAINT comic_ck_page_zoom_is_valid CHECK (page_zoom BETWEEN 0.5 AND 2.0),
      CONSTRAINT comic_ck_cover_width_is_positive CHECK (cover_width > 0),
      CONSTRAINT comic_ck_cover_height_is_positive CHECK (cover_height > 0),
      CONSTRAINT comic_ck_updates_enabled_is_bool CHECK (updates_enabled IN (FALSE, TRUE))
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS tag (
      comic_id TEXT NOT NULL REFERENCES comic (id) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      CONSTRAINT tag_pkey PRIMARY KEY (comic_id, tag)
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS page (
      id TEXT NOT NULL PRIMARY KEY,
      number INTEGER NOT NULL,
      url TEXT NOT NULL,
      accessed INTEGER DEFAULT NULL,
      modified INTEGER DEFAULT (strftime('%s', CURRENT_TIMESTAMP)),
      image_src TEXT NOT NULL,
      image_type TEXT NOT NULL,
      image_sha256 TEXT NOT NULL,
      image_width INTEGER NOT NULL,
      image_height INTEGER NOT NULL,
      image_data BLOB NOT NULL,
      comic_id TEXT NOT NULL REFERENCES comic (id) ON DELETE CASCADE,
      CONSTRAINT page_ck_number_is_non_negative CHECK (number >= 0),
      CONSTRAINT page_ck_image_width_is_positive CHECK (image_width > 0),
      CONSTRAINT page_ck_image_height_is_positive CHECK (image_height > 0),
      CONSTRAINT page_ck_image_sha256_has_valid_length CHECK (length(image_sha256) == 64)
    )
  `).run();
}

function createIndexes(db) {
  db.prepare(`
    CREATE INDEX IF NOT EXISTS page_ix_image_sha256 ON page (image_sha256)
  `).run();
}

function createTriggers(db) {
  // Increment page numbers of subsequent pages before new page is inserted
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS page_trg_insert
    BEFORE INSERT ON page
    BEGIN
      UPDATE page SET number = number + 1
      WHERE comic_id = NEW.comic_id AND number >= NEW.number;
    END
  `).run();

  // Set bookmark to previous page if smaller or equal to deleted page,
  // or to -1 if no pages are left
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS page_trg_delete
    BEFORE DELETE ON page
    WHEN (
      (SELECT bookmark FROM comic WHERE id = OLD.comic_id) > 0 AND
      OLD.number <= (SELECT bookmark FROM comic WHERE id = OLD.comic_id)
    ) OR (
      (SELECT bookmark FROM comic WHERE id = OLD.comic_id) == 0 AND
      (SELECT COUNT(*) FROM page WHERE comic_id = OLD.comic_id) == 1
    )
    BEGIN
      UPDATE comic SET bookmark = bookmark - 1 WHERE id = OLD.comic_id;
    END
  `).run();

  // Set bookmark after first page was inserted
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS page_trg_inserted
    AFTER INSERT ON page
    WHEN NEW.number = 0
    BEGIN
      UPDATE comic SET bookmark = NEW.number WHERE id = NEW.comic_id;
    END
  `).run();

  // Decrement page numbers of subsequent pages
  db.prepare(`
    CREATE TRIGGER IF NOT EXISTS page_trg_deleted
    AFTER DELETE ON page
    BEGIN
      UPDATE page SET number = number - 1
      WHERE comic_id = OLD.comic_id AND number > OLD.number;
    END
  `).run();
}

function migrate(db) {
  const userVersion = db.pragma('user_version', { simple: true });

  if (userVersion === 1) {
    db.transaction(() => {
      db.prepare('DROP TRIGGER page_trg_delete').run();

      db.prepare(`
        CREATE TRIGGER IF NOT EXISTS page_trg_delete
        BEFORE DELETE ON page
        WHEN (
          (SELECT bookmark FROM comic WHERE id = OLD.comic_id) > 0 AND
          OLD.number <= (SELECT bookmark FROM comic WHERE id = OLD.comic_id)
        ) OR (
          (SELECT bookmark FROM comic WHERE id = OLD.comic_id) == 0 AND
          (SELECT COUNT(*) FROM page WHERE comic_id = OLD.comic_id) == 1
        )
        BEGIN
          UPDATE comic SET bookmark = bookmark - 1 WHERE id = OLD.comic_id;
        END
      `).run();

      db.pragma('user_version = 2');
    })();
  }
}

module.exports = { createDatabase };
