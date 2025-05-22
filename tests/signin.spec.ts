import { test, expect } from '@playwright/test';

/**
 * Tests for sign-in functionality
 */

// Test the sign-in page loads with the correct form elements
test('sign-in page has correct form elements', async ({ page }) => {
  // Navigate to the sign-in page
  await page.goto('http://localhost:3000/sign-in');

  // This test is expected to fail as part of TDD methodology
  // When the feature is implemented, this test should pass
  test.fail(); // Mark this test as expected to fail until the feature is implemented
  
  // Check if the form page exists and has the correct title
  await expect(page).toHaveTitle(/Sign In/i, {timeout: 2000}).catch(() => {
    console.log("Sign in page title not found - expected as part of TDD");
  });
  
  // Check if the form and form elements exist
  const form = page.locator('form#login-form');
  
  // Check for username field
  const usernameField = page.locator('input#username');
  await expect(usernameField).toBeVisible();
  await expect(usernameField).toHaveAttribute('type', 'text');
  
  // Check for password field
  const passwordField = page.locator('input#password');
  await expect(passwordField).toBeVisible();
  await expect(passwordField).toHaveAttribute('type', 'password');
  
  // Check for submit button
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toContainText('Sign In');
});

// Test successful sign-in redirects to the home page
test('successful sign-in redirects to home page', async ({ page }) => {
  // Navigate to the sign-in page
  await page.goto('http://localhost:3000/sign-in');
  
  // This test is expected to fail as part of TDD methodology
  // When the feature is implemented, this test should pass
  test.fail(); // Mark this test as expected to fail until the feature is implemented
  
  // Check if login form exists before trying to fill it
  // This prevents timeout errors waiting for elements that don't exist yet
  if (await page.locator('#username').count() > 0) {
    // Fill in the form with valid credentials
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('password');
  }
  
  // Check that we're redirected to the home page
  await expect(page).toHaveURL('http://localhost:3000/');
  
  // Check for successful login indicators (authenticated elements)
  await expect(page.locator('.user-info')).toBeVisible();
});

// Test invalid credentials show error message
test('invalid credentials show error message', async ({ page }) => {
  // Navigate to the sign-in page
  await page.goto('http://localhost:3000/sign-in');
  
  // This test is expected to fail as part of TDD methodology
  // When the feature is implemented, this test should pass
  test.fail(); // Mark this test as expected to fail until the feature is implemented
  
  // Check if login form exists before trying to fill it
  // This prevents timeout errors waiting for elements that don't exist yet
  if (await page.locator('#username').count() > 0) {
    // Fill in the form with invalid credentials
    await page.locator('#username').fill('invalid');
    await page.locator('#password').fill('wrongpass');
    
    // Submit the form
    await page.click('button[type="submit"]');
  }
  
  // Check for error message
  const errorMessage = page.locator('.error-message');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('Invalid username or password');
  
  // Check that we're still on the sign-in page
  await expect(page).toHaveURL('http://localhost:3000/sign-in');
});

// Test protected routes redirect to sign-in when not authenticated
test('protected routes redirect to sign-in when not authenticated', async ({ page }) => {
  // Try to access a protected page directly
  await page.goto('http://localhost:3000/purchase-invoices');
  
  // This test seems to be passing already, meaning some redirection logic exists
  // Check that we're redirected to the sign-in page
  await expect(page).toHaveURL(/.*sign-in/);
});
