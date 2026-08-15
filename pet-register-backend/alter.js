import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const db = new DatabaseSync(path.resolve('database.sqlite'));

try {
  db.exec('PRAGMA foreign_keys = OFF;');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE NULL,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NULL,
      avatar TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Copy data
  db.exec(`
    INSERT INTO users_new (id, google_id, email, nome, avatar, created_at)
    SELECT id, google_id, email, name, picture, created_at FROM users;
  `);

  // Drop old table
  db.exec('DROP TABLE users;');

  // Rename new table
  db.exec('ALTER TABLE users_new RENAME TO users;');

  db.exec('PRAGMA foreign_keys = ON;');
  console.log('Successfully recreated users table');
} catch (e) {
  console.error('Error recreating table:', e.message);
}
