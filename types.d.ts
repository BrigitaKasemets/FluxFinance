// Type definitions for custom project types

// Invoice types
interface InvoiceItem {
  id: string;
  date: Date | string;
  description: string;
  quantity: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card';
  currency: string;
  invoiceNumber: string;
  vatPercentage: number;
  price: number;
  total: number;
}

// User types
interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'user' | 'accountant';
}

// Database types
interface DatabaseConnection {
  prepare: (sql: string) => DatabaseStatement;
  exec: (sql: string) => void;
  close: () => void;
}

interface DatabaseStatement {
  run: (...args: any[]) => void;
  all: <T = any>(...args: any[]) => T[];
  get: <T = any>(...args: any[]) => T | undefined;
}
