import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const { Database } = sqlite3;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make sure the db directory exists
const dbDir = join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const dbPath = join(__dirname, 'db/fluxfinance.db');
const db = new Database(dbPath);

// Create tables
const createTables = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Purchase invoices table
  CREATE TABLE IF NOT EXISTS purchase_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    payment_method TEXT NOT NULL,
    currency TEXT NOT NULL,
    vat_percentage REAL NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Execute the SQL to create tables
db.exec(createTables, (err) => {
  if (err) {
    console.error('Error creating tables:', err);
    return;
  }

  // Insert sample data
  const insertUserSQL = `
    INSERT OR IGNORE INTO users (email, password_hash, name)
    VALUES (?, ?, ?)
  `;

  // Generate salt and hash for password "password123"
  const salt = "fluxsalt";
  const passwordToHash = "password123" + salt;
  const hash = crypto.createHash('sha256').update(passwordToHash).digest('hex');
  const passwordHash = hash + ":" + salt;

  // Sample user with password "password123"
  db.run(insertUserSQL, [
    'admin@fluxfinance.com',
    passwordHash,
    'Admin User'
  ], (err) => {
    if (err) {
      console.error('Error inserting sample user:', err);
      return;
    }

    console.log('Database initialized successfully!');

    // Close the database connection
    db.close();
  });
});
