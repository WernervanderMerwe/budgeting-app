-- Budgeting App Database Schema

-- Months table: Each record represents a budget period
CREATE TABLE IF NOT EXISTS months (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  income INTEGER NOT NULL DEFAULT 0, -- stored in cents to avoid float precision issues
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(month_name, year)
);

-- Fixed Payments table: Recurring monthly expenses
CREATE TABLE IF NOT EXISTS fixed_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL, -- stored in cents (can be negative for adjustments)
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
);

-- Budget Categories table: Budget allocations per category
CREATE TABLE IF NOT EXISTS budget_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  allocated_amount INTEGER NOT NULL DEFAULT 0, -- stored in cents
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
);

-- Transactions table: Individual expenses within categories
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- stored in cents
  description TEXT,
  transaction_date TEXT, -- ISO 8601 format
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fixed_payments_month ON fixed_payments(month_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_month ON budget_categories(month_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
