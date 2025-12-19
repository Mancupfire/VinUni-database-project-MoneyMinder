# Performance & Tuning Notes

## Key indexes (already in schema)
- Transactions: `(user_id, transaction_date)`, `(category_id)`, `(account_id)`
- Accounts: `(user_id)`
- Budgets/Recurring: FKs on user/category/account for join efficiency

## Quick checks to run
1) Verify transaction listing query plan:
```sql
EXPLAIN ANALYZE
SELECT t.transaction_id, t.amount
FROM Transactions t
JOIN Accounts a ON t.account_id = a.account_id
JOIN Categories c ON t.category_id = c.category_id
WHERE t.user_id = 1
ORDER BY t.transaction_date DESC
LIMIT 50;
```
- Expect index on `Transactions(user_id, transaction_date)` to be used.

2) Dashboard monthly aggregates:
```sql
EXPLAIN ANALYZE
SELECT c.type, SUM(t.amount)
FROM Transactions t
JOIN Categories c ON t.category_id = c.category_id
WHERE t.user_id = 1 AND t.transaction_date >= DATE_FORMAT(NOW(), '%Y-%m-01')
GROUP BY c.type;
```
- Ensure index on `transaction_date` is picked; if not, consider composite `(user_id, transaction_date)`.

3) Rolling 3-month view performance:
```sql
EXPLAIN ANALYZE
SELECT * FROM View_Category_Rolling_3mo WHERE user_id = 1;
```
- Backed by aggregated subquery; add index on `(user_id, category_id, transaction_date)` if needed.

## Optional partitioning (for large data)
- Partition `Transactions` by RANGE on `YEAR(transaction_date)` or `TO_DAYS(transaction_date)`.
- Example:
```sql
ALTER TABLE Transactions
PARTITION BY RANGE (YEAR(transaction_date)) (
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

## Workload simulation (manual)
- Use `mysqlslap` to simulate reads on `/api/transactions` query:
```bash
mysqlslap --user=<user> --password --host=localhost \
  --create-schema=MoneyMinder_DB \
  --query="SELECT transaction_id FROM Transactions WHERE user_id=1 ORDER BY transaction_date DESC LIMIT 50;" \
  --concurrency=10 --iterations=5
```

Document any findings and adjustments in this file when tuning further.***
