-- ==========================================================
-- 1. DATABASE INITIALIZATION
-- ==========================================================
DROP DATABASE IF EXISTS MoneyMinder_DB;
CREATE DATABASE MoneyMinder_DB;
USE MoneyMinder_DB;

-- ==========================================================
-- 2. TABLE DEFINITIONS
-- ==========================================================

-- 1. Users: Stores credentials and global settings
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    base_currency VARCHAR(3) DEFAULT 'VND', -- e.g., VND, USD
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Groups: For shared expenses (Family, Trip, Roommates)
CREATE TABLE `Groups` (
    group_id INT PRIMARY KEY AUTO_INCREMENT,
    group_name VARCHAR(100) NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- 3. User_Groups: Many-to-Many link (Who is in which group)
CREATE TABLE User_Groups (
    user_id INT,
    group_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `Groups`(group_id) ON DELETE CASCADE
);

-- 4. Accounts: Wallets, Banks, etc.
CREATE TABLE Accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_name VARCHAR(50) NOT NULL, 
    -- FIXED: Changed to ENUM for consistency and safety
    account_type ENUM('Cash', 'Bank Account', 'Credit Card', 'E-Wallet', 'Investment') NOT NULL, 
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 5. Categories: Spending types (System default or User custom)
CREATE TABLE Categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT NULL, -- NULL = System Default (Global), NOT NULL = Custom User Category
    category_name VARCHAR(50) NOT NULL, 
    type ENUM('Income', 'Expense') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 6. Budgets: Spending limits (REQUIRED by your proposal)
CREATE TABLE Budgets (
    budget_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount_limit DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
);

-- 7. Recurring_Payments: Subscription definitions
CREATE TABLE Recurring_Payments (
    recurring_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_id INT NOT NULL,   
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    frequency ENUM('Daily', 'Weekly', 'Monthly', 'Yearly') NOT NULL,
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- 8. Transactions: The central financial history
CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    category_id INT NOT NULL,
    group_id INT DEFAULT NULL, -- Nullable (only for shared expenses)
    recurring_id INT DEFAULT NULL, -- FIXED: Link to Recurring_Payments
    
    -- Financials
    amount DECIMAL(15, 2) NOT NULL, 
    original_amount DECIMAL(15, 2),            -- For Multi-Currency support
    currency_code VARCHAR(3) DEFAULT 'VND',    
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0,  
    
    transaction_date DATETIME NOT NULL,
    description TEXT,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    FOREIGN KEY (group_id) REFERENCES `Groups`(group_id) ON DELETE SET NULL,
    FOREIGN KEY (recurring_id) REFERENCES Recurring_Payments(recurring_id) ON DELETE SET NULL
);

-- ==========================================================
-- 3. INDEX DEFINITIONS (Performance Optimization)
-- ==========================================================

-- Speed up login
CREATE INDEX idx_users_email ON Users(email);

-- Speed up filtering transactions by date
CREATE INDEX idx_transactions_date ON Transactions(transaction_date);

-- Speed up "Show my history" queries
CREATE INDEX idx_transactions_user_date ON Transactions(user_id, transaction_date);

-- Speed up "Alert" calculation (Finding average for a specific category)
CREATE INDEX idx_transactions_alert ON Transactions(user_id, category_id, amount);

-- ==========================================================
-- 4. VIEW DEFINITIONS (Logic Layer)
-- ==========================================================

-- VIEW 1: Unusual Spending Alert Logic
-- Calculates the average spending per category for the last 6 months.
-- Your Backend can query this to decide if a new bill is "Unusual".
CREATE OR REPLACE VIEW View_Category_Alert_Stats AS
SELECT 
    user_id,
    category_id,
    AVG(amount) as average_spent,
    MAX(amount) as max_spent
FROM Transactions
WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY user_id, category_id;

-- VIEW 2: Monthly Report
-- Simple aggregation for charts and graphs.
CREATE OR REPLACE VIEW View_Monthly_Report AS
SELECT 
    t.user_id,
    DATE_FORMAT(t.transaction_date, '%Y-%m') AS month_year,
    c.category_name,
    c.type,
    SUM(t.amount) AS total_amount
FROM Transactions t
JOIN Categories c ON t.category_id = c.category_id
GROUP BY t.user_id, month_year, c.category_name, c.type;

-- ==========================================================
-- 5. SEED DATA (System Defaults)
-- ==========================================================

-- Insert Default Categories (So the app isn't empty on first load)
-- INSERT INTO Categories (user_id, category_name, type) VALUES 
-- (NULL, 'Food & Beverage', 'Expense'),
-- (NULL, 'Transportation', 'Expense'),
-- (NULL, 'Rent', 'Expense'),
-- (NULL, 'Utilities', 'Expense'),
-- (NULL, 'Salary', 'Income'),
-- (NULL, 'Freelance', 'Income');