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
