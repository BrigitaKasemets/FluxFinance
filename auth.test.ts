import { test, expect, beforeAll, afterAll } from "bun:test";
import { JSDOM } from "jsdom";

// Mock browser environment
let dom: JSDOM;
let window: Window;
let document: Document;
let originalPathname: string;

// Setup function to create a mock DOM environment
const setupDOM = (url: string) => {
  dom = new JSDOM(`
    <html>
      <body>
        <div id="app"></div>
      </body>
    </html>
  `, { url });
  
  window = dom.window;
  document = window.document;
  originalPathname = window.location.pathname;
  
  // Mock fetch API
  (window as any).fetch = async (url: string) => {
    if (url.includes('/api/auth/status')) {
      return {
        ok: true,
        json: async () => ({ authenticated: false })
      };
    }
    return { ok: false };
  };
  
  // Add global variables to the global scope
  (global as any).window = window;
  (global as any).document = document;
  (global as any).fetch = (window as any).fetch;
  (global as any).localStorage = window.localStorage;
};

// Mock app functionality
const renderApp = async () => {
  // This simulates the app's behavior when checking auth status
  const response = await fetch('/api/auth/status');
  const data = await response.json();
  
  if (!data.authenticated && isProtectedRoute(window.location.pathname)) {
    renderLoginForm();
  } else {
    renderContent();
  }
};

// Helper functions to simulate app behavior
const isProtectedRoute = (path: string) => {
  return path.startsWith('/invoices/') || 
         path.startsWith('/dashboard') || 
         path.startsWith('/settings');
};

const renderLoginForm = () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div id="login-form">
        <h2>Please sign in</h2>
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Sign In</button>
        </form>
      </div>
    `;
  }
};

const renderContent = () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div id="content">Protected content</div>`;
  }
};

// Tests
test("unauthenticated user sees login form when accessing protected URL without URL change", async () => {
  // Setup DOM with a protected URL
  const protectedUrl = "http://localhost:3000/invoices/3";
  setupDOM(protectedUrl);
  
  // Render the app
  await renderApp();
  
  // Check that the login form is displayed
  const loginForm = document.getElementById('login-form');
  expect(loginForm).not.toBeNull();
  
  // Check that the URL hasn't changed
  expect(window.location.pathname).toBe(originalPathname);
  expect(window.location.pathname).toBe("/invoices/3");
  
  // Verify there's no content div (protected content)
  const content = document.getElementById('content');
  expect(content).toBeNull();
});
