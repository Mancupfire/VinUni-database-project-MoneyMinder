-- Incremental patch: windowed analytics view + validation/audit triggers
-- Run after Physical_Schema_Definition.sql and Sample_Data.sql
USE MoneyMinder_DB;

-- =============================================
-- 1) Window-function view: 3-month rolling expense by category
-- =============================================
DROP VIEW IF EXISTS View_Category_Rolling_3mo;
CREATE VIEW View_Category_Rolling_3mo AS
SELECT
    sub.user_id,
    sub.category_id,
    sub.category_name,
    sub.type,
    sub.month_year,
    sub.total_amount,
    SUM(sub.total_amount) OVER (
        PARTITION BY sub.user_id, sub.category_id
        ORDER BY sub.month_year
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS rolling_3_month_total
FROM (
    SELECT
        t.user_id,
        c.category_id,
        c.category_name,
        c.type,
        DATE_FORMAT(t.transaction_date, '%Y-%m') AS month_year,
        SUM(t.amount) AS total_amount
    FROM Transactions t
    JOIN Categories c ON t.category_id = c.category_id
    WHERE c.type = 'Expense'
    GROUP BY t.user_id, c.category_id, month_year, c.category_name, c.type
) AS sub;

-- =============================================
-- 2) Validation trigger: block negative amounts
-- =============================================
DROP TRIGGER IF EXISTS trg_transactions_validate_amount;
DELIMITER //
CREATE TRIGGER trg_transactions_validate_amount
BEFORE INSERT ON Transactions
FOR EACH ROW
BEGIN
    IF NEW.amount < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amount cannot be negative';
    END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_transactions_validate_amount_upd;
DELIMITER //
CREATE TRIGGER trg_transactions_validate_amount_upd
BEFORE UPDATE ON Transactions
FOR EACH ROW
BEGIN
    IF NEW.amount < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amount cannot be negative';
    END IF;
END//
DELIMITER ;

-- =============================================
-- 3) Audit log for deletes/updates
-- =============================================
CREATE TABLE IF NOT EXISTS Transaction_Audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    user_id INT,
    action ENUM('UPDATE','DELETE'),
    old_amount DECIMAL(15,2),
    new_amount DECIMAL(15,2),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS trg_transactions_audit_update;
DELIMITER //
CREATE TRIGGER trg_transactions_audit_update
AFTER UPDATE ON Transactions
FOR EACH ROW
BEGIN
    INSERT INTO Transaction_Audit (transaction_id, user_id, action, old_amount, new_amount)
    VALUES (NEW.transaction_id, NEW.user_id, 'UPDATE', OLD.amount, NEW.amount);
END//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_transactions_audit_delete;
DELIMITER //
CREATE TRIGGER trg_transactions_audit_delete
AFTER DELETE ON Transactions
FOR EACH ROW
BEGIN
    INSERT INTO Transaction_Audit (transaction_id, user_id, action, old_amount, new_amount)
    VALUES (OLD.transaction_id, OLD.user_id, 'DELETE', OLD.amount, NULL);
END//
DELIMITER ;
