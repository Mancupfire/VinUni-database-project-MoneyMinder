-- Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    base_currency VARCHAR(3) DEFAULT 'VND', -- VND, USD
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups Table
CREATE TABLE Groups (
    group_id INT PRIMARY KEY AUTO_INCREMENT,
    group_name VARCHAR(100) NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- User_Groups (Junction Table for M:N relationship)
CREATE TABLE User_Groups (
    user_id INT,
    group_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES Groups(group_id) ON DELETE CASCADE
);

-- Accounts Table
CREATE TABLE Accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_name VARCHAR(50) NOT NULL, -- e.g., "Vietcombank", "Cash Wallet"
    account_type VARCHAR(20), -- e.g., 'Bank', 'Cash', 'Credit'
    balance DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE Categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL, -- e.g., "Food", "Rent"
    type ENUM('Income', 'Expense') NOT NULL
);

-- Transactions Table (Central Fact Table)
CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    category_id INT NOT NULL,
    group_id INT, 
    amount DECIMAL(15, 2) NOT NULL, 
    
    original_amount DECIMAL(15, 2), -- The amount paid in foreign currency
    currency_code VARCHAR(3) DEFAULT 'VND', -- The foreign currency code
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0, -- Rate used at moment of transaction
    
    transaction_date DATETIME NOT NULL,
    description TEXT,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    FOREIGN KEY (group_id) REFERENCES Groups(group_id) ON DELETE SET NULL
);

CREATE TABLE Recurring_Payments (
    recurring_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    frequency ENUM('Daily', 'Weekly', 'Monthly', 'Yearly') NOT NULL,
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);
