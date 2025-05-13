import { test, expect } from "bun:test";
import { serve } from "bun";

// This test verifies that when an unauthenticated user tries to access
// a protected route like /invoices/3, they are shown a sign-in form
test("unauthenticated visitor is shown sign-in form when accessing protected URL", async () => {


  const { JSDOM } = require("jsdom");

  const protectedUrl = "/invoices/3";
  const response = await fetch(`http://localhost:3000${protectedUrl}`);
  const html = await response.text();


  const dom = new JSDOM(html);
  const document = dom.window.document;


  const form = document.querySelector('#sign-in-form');
  expect(form).not.toBeNull();

  const emailInput = form.querySelector('input[type="email"]');
  expect(emailInput).not.toBeNull();

  const passwordInput = form.querySelector('input[type="password"]');
  expect(passwordInput).not.toBeNull();

  expect(form.getAttribute('method')).toBe('post');

  expect(document.querySelector('label[for="email"]')).not.toBeNull();
  expect(document.querySelector('label[for="password"]')).not.toBeNull();

});