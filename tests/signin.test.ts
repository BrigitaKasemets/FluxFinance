import { test, expect } from "bun:test";
import { JSDOM } from "jsdom";

/**
 * Test for the sign-in functionality
 *
 * Acceptance criteria:
 * - Unauthenticated visitor who lands on any protected URL (e.g., /invoices/3) is shown a sign-in form
 * - The browser address bar stays on the same URL
 * - Entering an email + password allows to submit the form (using AJAX)
 * - Entering an invalid email or password shows a generic "Email or password is incorrect" message
 * - If an already-authenticated user hits a protected URL, the page loads directly with no sign-in overlay
 * - The sign-in form is fully keyboard-navigable and its labels are announced by screen readers
 * - If the credentials are right the page is refreshed, revealing the page the user initially wanted to visit
 */
test("unauthenticated visitor is shown sign-in form when accessing protected URL", async () => {
  // This test will fail until we implement the authentication feature

  // Make a request to a protected URL as an unauthenticated user
  const response = await fetch("http://localhost:3000/invoices/3", {
    redirect: "manual" // Don't follow redirects automatically
  });

  // Check if we're being redirected to the sign-in page
  expect(response.status).toBe(302); // 302 Found (redirect)
  expect(response.headers.get("Location")).toBe("/auth/sign-in");

  // Now follow the redirect manually
  const signInResponse = await fetch("http://localhost:3000/auth/sign-in");
  const html = await signInResponse.text();

  // Parse the HTML
  const dom = new JSDOM(html);
  const { document } = dom.window;

  // Check if there's a sign-in form
  const signInForm = document.querySelector("form#sign-in-form");
  expect(signInForm).not.toBeNull();

  // Check if the form has email and password fields
  const emailInput = signInForm?.querySelector('input[type="email"]');
  const passwordInput = signInForm?.querySelector('input[type="password"]');
  expect(emailInput).not.toBeNull();
  expect(passwordInput).not.toBeNull();

  // Check if the form has an action attribute
  const formAction = signInForm?.getAttribute("action");
  expect(formAction).toBe("/auth/sign-in");

  // Check if the form has JavaScript that prevents default form submission (AJAX)
  const scripts = document.querySelectorAll("script");
  let hasPreventDefault = false;

  for (const script of scripts) {
    if (script.textContent && script.textContent.includes("preventDefault")) {
      hasPreventDefault = true;
      break;
    }
  }

  expect(hasPreventDefault).toBe(true);

  // Check if the form is accessible
  const emailLabel = document.querySelector('label[for="email"]');
  const passwordLabel = document.querySelector('label[for="password"]');
  expect(emailLabel).not.toBeNull();
  expect(passwordLabel).not.toBeNull();

  // Check that inputs have proper attributes for accessibility
  expect(emailInput?.getAttribute("aria-required")).toBe("true");
  expect(passwordInput?.getAttribute("aria-required")).toBe("true");
});

test("entering invalid credentials shows error message", async () => {
  // Prepare invalid login data
  const invalidCredentials = {
    email: "nonexistent@example.com",
    password: "wrongpassword"
  };

  // Submit the login form with invalid credentials
  const response = await fetch("http://localhost:3000/auth/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(invalidCredentials)
  });

  // Check that the response is not successful (401 Unauthorized)
  expect(response.ok).toBe(false);
  expect(response.status).toBe(401);

  // Check the error message in the JSON response
  const data = await response.json();
  expect(data.error).toBe("Email or password is incorrect");
});

test("authenticated user can directly access protected URL", async () => {
  // Create a fetch with authentication cookie
  const response = await fetch("http://localhost:3000/purchase-invoices", {
    headers: {
      Cookie: "authenticated=true" 
    }
  });

  // Verify the response is successful (200 OK, not a redirect)
  expect(response.status).toBe(200);
  
  // Check that the response contains the expected page content
  const html = await response.text();
  expect(html).toContain("Purchase Invoices"); // The page should contain some invoice-related content
  
  // Make sure we don't have a sign-in form on the page
  const dom = new JSDOM(html);
  const signInForm = dom.window.document.querySelector("form#sign-in-form");
  expect(signInForm).toBeNull();
});

test("successful login redirects to originally requested page", async () => {
  // The URL we want to access after login
  const originalUrl = "/purchase-invoices";
  
  // First, try accessing a protected URL to trigger the redirect and set originalUrl
  await fetch(`http://localhost:3000${originalUrl}`, {
    redirect: "manual" // Don't follow redirects automatically
  });
  
  // Now log in with valid credentials
  const validCredentials = {
    email: "admin@fluxfinance.com",
    password: "password123"
  };
  
  const response = await fetch("http://localhost:3000/auth/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(validCredentials)
  });
  
  // Check that the response is successful
  expect(response.ok).toBe(true);
  
  // Check that we get redirected to the original URL
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.redirectUrl).toBe(originalUrl);
  
  // In a real browser, the JavaScript would trigger window.location.href = redirectUrl
  // To simulate this, we would check that the browser's URL changes to the original URL
  // But in a test environment, we can only check that the correct redirectUrl is returned
});

test("sign-in form is keyboard navigable (WCAG compliance)", async () => {
  const response = await fetch("http://localhost:3000/auth/sign-in");
  const html = await response.text();
  
  const dom = new JSDOM(html);
  const { document } = dom.window;
  
  // Get all focusable elements in the form
  const form = document.querySelector("form#sign-in-form");
  const focusableElements = form?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  // Check that we have focusable elements
  expect(focusableElements?.length).toBeGreaterThan(0);
  
  // Check that inputs have proper attributes for screen readers
  const inputs = form?.querySelectorAll("input:not([type='hidden'])");
  
  for (const input of inputs || []) {
    // Every input should have a corresponding label or aria-label
    const inputId = input.getAttribute("id");
    if (inputId) {
      const label = document.querySelector(`label[for="${inputId}"]`);
      expect(label).not.toBeNull();
    } else {
      // If no id, should have aria-label or aria-labelledby
      const hasAriaLabel = input.hasAttribute("aria-label") || input.hasAttribute("aria-labelledby");
      // We'll exempt hidden fields from the check
      expect(hasAriaLabel).toBe(true);
    }
  }
});
