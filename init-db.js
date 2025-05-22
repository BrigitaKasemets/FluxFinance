import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Open database connection
    const db = await open({
      filename: join(__dirname, 'db/fluxfinance.db'),
      driver: sqlite3.Database
    });

    console.log('Database connection established');

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create purchase_invoices table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS purchase_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL,
        date DATE NOT NULL,
        description TEXT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        currency TEXT NOT NULL,
        vat_percentage DECIMAL(5,2) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully');

    // Check if admin user exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@fluxfinance.com']);
    
    if (!existingUser) {
      // Create a simple hash for the admin user
      const password = 'password123';
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
      const passwordHash = `${hash}:${salt}`;

      await db.run(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['admin@fluxfinance.com', passwordHash]
      );

      console.log('Admin user created successfully');
      console.log('Email: admin@fluxfinance.com');
      console.log('Password: password123');
    } else {
      console.log('Admin user already exists');
    }

    await db.close();
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
