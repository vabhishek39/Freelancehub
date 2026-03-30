import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'marketplace.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'freelancer', 'client')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    bio TEXT,
    portfolio_url TEXT,
    phone TEXT,
    contact_email TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    freelancer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    features TEXT NOT NULL, -- JSON string array
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    client_id TEXT UNIQUE NOT NULL,
    plan INTEGER NOT NULL CHECK(plan IN (299, 699)),
    unlocked_count INTEGER DEFAULT 0,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS unlocked_contacts (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE(client_id, service_id)
  );
`);

// Seed Admin User
const adminEmail = 'admin@freelancehub.com';
const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

if (!existingAdmin) {
  const adminId = crypto.randomUUID();
  const hashedPassword = bcrypt.hashSync('AdminPassword123!', 10);
  db.prepare(
    'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)'
  ).run(adminId, 'System Admin', adminEmail, hashedPassword, 'admin');
}

export default db;
