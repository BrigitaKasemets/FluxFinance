import express from 'express';
import { engine } from 'express-handlebars';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Set up Handlebars view engine
app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    // Custom helpers can be added here
    formatCurrency: (value, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(value);
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

// Middleware
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
app.use((req, res, next) => {
  try {
    // Check if user is authenticated by checking for the authentication cookie
    // This is a simplified authentication check for demonstration purposes
    // In a real application, you would use a more secure method like JWT or sessions
    const isAuthenticated = req.headers.cookie?.includes('authenticated=true');

    // Protected routes prefixes
    const protectedRoutePrefixes = ['/invoices', '/purchase-invoices'];

    // Check if the requested path is protected
    const isProtectedRoute = protectedRoutePrefixes.some(prefix =>
      req.path.startsWith(prefix)
    );

    if (isProtectedRoute && !isAuthenticated) {
      // Store the original URL for redirection after authentication
      req.app.locals.redirectUrl = req.originalUrl;

      // For API requests, return 401
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // For HTML requests, redirect to the sign-in page but store the original URL
      console.log('Redirecting to sign-in page for unauthenticated user at', req.originalUrl);
      req.app.locals.redirectUrl = req.originalUrl;
      return res.redirect('/auth/sign-in');
    }

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    next(error);
  }
});

// Initialize database connection
let db = null;

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    // If database is not initialized yet, initialize it
    if (!db) {
      console.log('Initializing database connection...');
      try {
        db = await open({
          filename: join(__dirname, 'db/fluxfinance.db'),
          driver: sqlite3.Database
        });
        console.log('Database connection established successfully');
      } catch (dbError) {
        console.error('Failed to open database:', dbError);
        throw dbError;
      }
    }

    // Make the database available to all routes
    req.db = db;
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).render('error', {
      message: 'Database connection error',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Routes
// Home route
app.get('/', (req, res) => {
  res.render('home', {
    title: 'FluxFinance - Dashboard',
    isAuthenticated: req.headers.cookie?.includes('authenticated=true')
  });
});

// Auth routes
app.get('/auth/sign-in', (req, res) => {
  res.render('sign-in', {
    layout: false,
    originalUrl: req.app.locals.redirectUrl || '/'
  });
});

app.post('/auth/sign-in', async (req, res) => {
  const { email } = req.body; // We're not using the password in this demo
  const db = req.db;

  try {
    // Find user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Email or password is incorrect' });
    }

    // In a real app, we would verify the password hash here
    // For demonstration purposes, we're skipping password verification
    // This is not secure and should not be used in production

    // Set authentication cookie
    res.setHeader('Set-Cookie', 'authenticated=true; Path=/; HttpOnly');

    // Redirect to the original URL or home page
    const redirectUrl = req.app.locals.redirectUrl || '/';
    req.app.locals.redirectUrl = null;

    res.json({ success: true, redirectUrl });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'An error occurred during authentication' });
  }
});

app.post('/auth/sign-out', (_, res) => {
  // Use underscore for unused parameters
  res.setHeader('Set-Cookie', 'authenticated=false; Path=/; HttpOnly; Max-Age=0');
  res.redirect('/');
});

// Purchase invoices routes
app.get('/purchase-invoices', async (req, res) => {
  const db = req.db;

  try {
    const invoices = await db.all('SELECT * FROM purchase_invoices ORDER BY date DESC');

    res.render('purchase-invoices', {
      title: 'Purchase Invoices - FluxFinance',
      invoices,
      isAuthenticated: true
    });
  } catch (error) {
    console.error('Error fetching purchase invoices:', error);
    res.status(500).render('error', {
      message: 'Error fetching purchase invoices',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

app.post('/purchase-invoices', async (req, res) => {
  const db = req.db;
  const {
    invoice_number,
    date,
    description,
    quantity,
    payment_method,
    currency,
    vat_percentage,
    price
  } = req.body;

  try {
    // Calculate total
    const vatAmount = (parseFloat(price) * parseFloat(quantity) * parseFloat(vat_percentage)) / 100;
    const total = parseFloat(price) * parseFloat(quantity) + vatAmount;

    // Insert into database
    const result = await db.run(`
      INSERT INTO purchase_invoices (
        invoice_number, date, description, quantity,
        payment_method, currency, vat_percentage, price, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      invoice_number,
      date,
      description,
      quantity,
      payment_method,
      currency,
      vat_percentage,
      price,
      total
    ]);

    res.json({
      success: true,
      message: 'Purchase invoice created successfully',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error creating purchase invoice:', error);
    res.status(500).json({
      error: 'An error occurred while creating the purchase invoice'
    });
  }
});

// Error handling
app.use((err, _, res, __) => {
  // Use underscores for unused parameters
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).render('error', {
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start the server
app.listen(port, () => {
  console.log(`FluxFinance app listening at http://localhost:${port}`);
});

export default app;
