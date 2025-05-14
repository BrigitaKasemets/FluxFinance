# FluxFinance

FluxFinance is a lightweight web-based financial management application built with Node.js, Express, SQLite, and Handlebars. It features a simple frontend with JavaScript enhancements and aims to provide efficient financial management for small businesses.

## ✅ Features

* User authentication system
* Purchase invoice management
* Automatic VAT and total calculation
* Responsive and accessible UI
* Persistent data using SQLite database

## 🛠 Tech Stack

* **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/) (v5.x), [SQLite](https://www.sqlite.org/)
* **Templating**: [Handlebars](https://handlebarsjs.com/) with Express-Handlebars
* **Frontend**: Vanilla JavaScript with minimal dependencies
* **TypeScript**: Used for type definitions and test files
* **Testing**: [Playwright](https://playwright.dev/) (v1.52.0) for end-to-end testing and Test-Driven Development (TDD)
* **Development**: Nodemon for automatic server reloading



## ⚙️ Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize the Database

```bash
npm run init:db
```

This will create a new SQLite database with the required schema and add a sample user:
- Email: admin@fluxfinance.com
- Password: password123

### 3. Run the Application

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Development Mode

To run the application in development mode with automatic reloading:

```bash
npm run dev
```


## 📁 Project Structure

```
fluxfinance/
├── views/              # Handlebars templates
│   ├── layouts/        # Layout templates
│   ├── error.handlebars
│   ├── home.handlebars
│   ├── purchase-invoices.handlebars
│   ├── purchase-invoice-details.handlebars
│   ├── sales.handlebars
│   └── sign-in.handlebars
├── public/             # Static assets
│   └── css/            # CSS stylesheets
├── tests/              # Test files
│   ├── signin.spec.ts  # Authentication tests
│   └── purchase-invoice.spec.ts # Purchase invoice tests
├── db/                 # SQLite database
├── app.js              # Main application file
├── init-db.ts          # Database initialization script
├── types.d.ts          # TypeScript type definitions
├── tsconfig.json       # TypeScript configuration
├── playwright.config.ts # Playwright test configuration
└── package.json        # Project configuration
```

## 🧪 Testing

The project follows Test-Driven Development (TDD) principles. Tests are written using Playwright test framework for end-to-end testing.

To run the tests:

```bash
npm test
```

To run tests with additional options:

```bash
# Run tests with debugging enabled
npm run test:debug

# Run tests with UI mode
npm run test:ui
```

To view the test report:

```bash
npm run test:report
```

The tests are designed to fail initially, as per TDD methodology. As you implement the features, the tests will start passing.

## 🔒 Authentication

The application includes a simple authentication system:
- Unauthenticated users are redirected to the sign-in page when accessing protected routes
- Protected routes include `/purchase-invoices`
- Authentication state is maintained using cookies

## 📊 Purchase Invoices

The purchase invoice feature allows users to:
- View a list of purchase invoices
- Create new purchase invoices with details like date, description, quantity, etc.
- Automatic calculation of totals based on price, quantity, and VAT percentage

## 📃 License

MIT License © 2025 FluxFinance Team

_Last updated: 14. mai 2025_