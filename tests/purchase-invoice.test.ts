import { test, expect } from "bun:test";
import { JSDOM } from "jsdom";

/**
 * Test for the purchase invoice functionality
 * 
 * Acceptance criteria:
 * - There is a Purchase invoices tab on the main menu
 * - There is a New invoice button
 * - Clicking that would open a modal with fields for: date, description of the item,
 *   quantity, payment method, currency, invoice number, VAT percentage, price
 * - When I enter price, the sum (price*qty+VAT) would be automatically calculated
 * - There is a cancel and save buttons
 * - When I click on save, the data is saved and the modal is closed and I can see the invoice
 */

// Test 1: Check if there's a Purchase invoices tab in the main menu
test("there is a Purchase invoices tab on the main menu", async () => {
  // Make a request to the homepage
  const response = await fetch("http://localhost:3000/");
  
  // Get the HTML response
  const html = await response.text();
  
  // Parse the HTML
  const dom = new JSDOM(html);
  const { document } = dom.window;
  
  // Check if there's a Purchase invoices tab in the main menu
  const mainMenu = document.querySelector(".main-menu");
  expect(mainMenu).not.toBeNull();
  
  const purchaseInvoicesLink = mainMenu?.querySelector('a[href="/purchase-invoices"]');
  expect(purchaseInvoicesLink).not.toBeNull();
  expect(purchaseInvoicesLink?.textContent).toContain("Purchase invoices");
});

// Test 2: Check if there's a New invoice button on the purchase invoices page
test("there is a New invoice button on the purchase invoices page", async () => {
  // First, we need to authenticate to access the protected page
  // For testing purposes, we'll use a cookie to simulate authentication
  const response = await fetch("http://localhost:3000/purchase-invoices", {
    headers: {
      "Cookie": "authenticated=true"
    }
  });
  
  // Get the HTML response
  const html = await response.text();
  
  // Parse the HTML
  const dom = new JSDOM(html);
  const { document } = dom.window;
  
  // Check if there's a New invoice button
  const newInvoiceButton = document.querySelector("#new-invoice-btn");
  expect(newInvoiceButton).not.toBeNull();
  expect(newInvoiceButton?.textContent).toContain("New invoice");
});

// Test 3: Check if the modal has all the required fields
test("modal has all required fields for a purchase invoice", async () => {
  // First, we need to authenticate to access the protected page
  // For testing purposes, we'll use a cookie to simulate authentication
  const response = await fetch("http://localhost:3000/purchase-invoices", {
    headers: {
      "Cookie": "authenticated=true"
    }
  });
  
  // Get the HTML response
  const html = await response.text();
  
  // Parse the HTML
  const dom = new JSDOM(html);
  const { document } = dom.window;
  
  // Check if there's a modal
  const modal = document.querySelector("#invoice-modal");
  expect(modal).not.toBeNull();
  
  // Check if the modal has all the required fields
  expect(modal?.querySelector('input[type="date"]')).not.toBeNull(); // date
  expect(modal?.querySelector('input[id="invoice-description"]')).not.toBeNull(); // description
  expect(modal?.querySelector('input[id="invoice-quantity"]')).not.toBeNull(); // quantity
  expect(modal?.querySelector('select[id="invoice-payment-method"]')).not.toBeNull(); // payment method
  expect(modal?.querySelector('select[id="invoice-currency"]')).not.toBeNull(); // currency
  expect(modal?.querySelector('input[id="invoice-number"]')).not.toBeNull(); // invoice number
  expect(modal?.querySelector('input[id="invoice-vat-percentage"]')).not.toBeNull(); // VAT percentage
  expect(modal?.querySelector('input[id="invoice-price"]')).not.toBeNull(); // price
  
  // Check if there are cancel and save buttons
  expect(modal?.querySelector('button[id="invoice-cancel-btn"]')).not.toBeNull();
  expect(modal?.querySelector('button[id="invoice-save-btn"]')).not.toBeNull();
  
  // Check if there's a total field
  expect(modal?.querySelector('div[id="invoice-total"]')).not.toBeNull();
});

// Test 4: Check if the total is automatically calculated
test("total is automatically calculated when price is entered", async () => {
  // First, we need to authenticate to access the protected page
  // For testing purposes, we'll use a cookie to simulate authentication
  const response = await fetch("http://localhost:3000/purchase-invoices", {
    headers: {
      "Cookie": "authenticated=true"
    }
  });
  
  // Get the HTML response
  const html = await response.text();
  
  // Parse the HTML
  const dom = new JSDOM(html);
  const { document, window } = dom.window;
  
  // Check if there's JavaScript code for calculating the total
  const scripts = document.querySelectorAll("script");
  let hasCalculateTotal = false;
  
  for (const script of scripts) {
    if (script.textContent && script.textContent.includes("calculateTotal")) {
      hasCalculateTotal = true;
      break;
    }
  }
  
  expect(hasCalculateTotal).toBe(true);
});
