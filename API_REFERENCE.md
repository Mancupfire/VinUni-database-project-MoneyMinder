# MoneyMinder API Reference

**Base URL:** `http://localhost:5000/api`

**Authentication:** Bearer Token (JWT) required for most endpoints

---

## 🔐 Authentication

### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "base_currency": "VND" | "USD" | "EUR"
}
```

**Response:** 201 Created
```json
{
  "message": "Registration successful",
  "token": "jwt_token_here",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "base_currency": "VND"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:** 200 OK
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "base_currency": "VND",
    "created_at": "2024-01-15T10:00:00"
  }
}
```

---

## 💰 Accounts

### List All Accounts
```http
GET /accounts
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "accounts": [
    {
      "account_id": 1,
      "account_name": "Cash Wallet",
      "account_type": "Cash",
      "balance": 2500000.00,
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

### Get Single Account
```http
GET /accounts/{account_id}
Authorization: Bearer {token}
```

### Create Account
```http
POST /accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "account_name": "string",
  "account_type": "Cash" | "Bank Account" | "Credit Card" | "E-Wallet" | "Investment",
  "balance": 0.00
}
```

**Response:** 201 Created
```json
{
  "message": "Account created successfully",
  "account_id": 5
}
```

### Update Account
```http
PUT /accounts/{account_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "account_name": "string",
  "account_type": "string"
}
```

### Delete Account
```http
DELETE /accounts/{account_id}
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "message": "Account deleted successfully"
}
```

### Get Accounts Summary
```http
GET /accounts/summary
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "summary": {
    "total_accounts": 4,
    "total_balance": 54500000.00,
    "by_type": [
      {
        "account_type": "Cash",
        "type_balance": 2500000.00,
        "total_accounts": 1
      }
    ]
  }
}
```

---

## 💳 Transactions

### List Transactions
```http
GET /transactions?start_date=2024-01-01&end_date=2024-12-31&account_id=1&category_id=1&limit=50&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `account_id` (optional): integer
- `category_id` (optional): integer
- `limit` (optional): integer (default 50)
- `offset` (optional): integer (default 0)

**Response:** 200 OK
```json
{
  "transactions": [
    {
      "transaction_id": 1,
      "amount": 250000.00,
      "original_amount": null,
      "currency_code": "VND",
      "exchange_rate": 1.0,
      "transaction_date": "2024-03-15T12:30:00",
      "description": "Lunch at restaurant",
      "account_id": 1,
      "account_name": "Cash Wallet",
      "account_type": "Cash",
      "category_id": 1,
      "category_name": "Food & Beverage",
      "category_type": "Expense",
      "group_id": null,
      "recurring_id": null
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

### Get Single Transaction
```http
GET /transactions/{transaction_id}
Authorization: Bearer {token}
```

### Create Transaction
```http
POST /transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "account_id": 1,
  "category_id": 1,
  "amount": 150000.00,
  "transaction_date": "2024-03-15T12:00:00",
  "description": "string",
  "original_amount": 10.00,
  "currency_code": "USD",
  "exchange_rate": 23000.00,
  "group_id": null,
  "recurring_id": null
}
```

**Response:** 201 Created
```json
{
  "message": "Transaction created successfully",
  "transaction_id": 46,
  "alert": {
    "unusual": true,
    "message": "This transaction is 45.2% higher than your average",
    "average": 465000.00,
    "current": 850000.00
  }
}
```

### Update Transaction
```http
PUT /transactions/{transaction_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 200000.00,
  "description": "Updated description"
}
```

### Delete Transaction
```http
DELETE /transactions/{transaction_id}
Authorization: Bearer {token}
```

---

## 📊 Categories

### List All Categories
```http
GET /categories
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "categories": [
    {
      "category_id": 1,
      "category_name": "Food & Beverage",
      "type": "Expense",
      "source": "System"
    },
    {
      "category_id": 13,
      "category_name": "Freelance Projects",
      "type": "Income",
      "source": "Custom"
    }
  ]
}
```

### Get Single Category
```http
GET /categories/{category_id}
Authorization: Bearer {token}
```

### Create Custom Category
```http
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "category_name": "string",
  "type": "Income" | "Expense"
}
```

### Update Category
```http
PUT /categories/{category_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "category_name": "string",
  "type": "Income" | "Expense"
}
```

**Note:** Only custom categories can be updated/deleted

### Delete Category
```http
DELETE /categories/{category_id}
Authorization: Bearer {token}
```

---

## 📈 Analytics

### Get Dashboard Data
```http
GET /analytics/dashboard
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "accounts": {
    "total": 4,
    "balance": 54500000.00
  },
  "current_month": {
    "income": 25000000.00,
    "expense": 12500000.00,
    "net": 12500000.00
  },
  "recent_transactions": [ ... ]
}
```

### Get Monthly Report
```http
GET /analytics/monthly-report?month=2024-03
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "report": [
    {
      "month_year": "2024-03",
      "category_name": "Food & Beverage",
      "type": "Expense",
      "total_amount": 3250000.00
    }
  ]
}
```

### Get Spending by Category
```http
GET /analytics/spending-by-category?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "categories": [
    {
      "category_name": "Food & Beverage",
      "type": "Expense",
      "transaction_count": 45,
      "total_amount": 8500000.00,
      "avg_amount": 188888.89,
      "min_amount": 45000.00,
      "max_amount": 550000.00
    }
  ]
}
```

### Get Trends
```http
GET /analytics/trends?months=6
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "trends": [
    {
      "month": "2024-03",
      "type": "Income",
      "total": 25000000.00
    },
    {
      "month": "2024-03",
      "type": "Expense",
      "total": 12500000.00
    }
  ]
}
```

### Get Budget Status
```http
GET /analytics/budget-status
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "budgets": [
    {
      "budget_id": 1,
      "category_id": 1,
      "category_name": "Food & Beverage",
      "amount_limit": 3000000.00,
      "spent": 2450000.00,
      "percentage": 81.67,
      "remaining": 550000.00,
      "status": "WARNING",
      "start_date": "2024-03-01",
      "end_date": "2024-03-31"
    }
  ]
}
```

### Get Unusual Spending Alerts
```http
GET /analytics/unusual-spending
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "alerts": [
    {
      "category_id": 4,
      "category_name": "Utilities",
      "average_spent": 465000.00,
      "max_spent": 850000.00,
      "alert_threshold": 581250.00
    }
  ]
}
```

### Get 3-Month Rolling Expense by Category
```http
GET /analytics/rolling-expense
Authorization: Bearer {token}
```

**Response:** 200 OK
```json
{
  "rolling_expense": [
    {
      "user_id": 1,
      "category_id": 4,
      "category_name": "Utilities",
      "type": "Expense",
      "month_year": "2024-03",
      "total_amount": 1500000.00,
      "rolling_3_month_total": 4200000.00
    }
  ]
}
```

---

## 🏥 Health Check

### Check API Health
```http
GET /health
```

**Response:** 200 OK
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

```json
{
  "error": "Invalid or expired token",
  "code": "INVALID_TOKEN"
}
```

### 404 Not Found
```json
{
  "error": "Account not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notes

### Date Format
All dates should be in ISO 8601 format:
- Date only: `YYYY-MM-DD` (e.g., "2024-03-15")
- DateTime: `YYYY-MM-DDTHH:MM:SS` (e.g., "2024-03-15T12:30:00")

### Currency Format
- Amounts are stored as DECIMAL(15, 2)
- Always use 2 decimal places
- Example: 1500000.00 (one million five hundred thousand)

### Authentication
All endpoints except `/auth/register`, `/auth/login`, and `/health` require authentication.

Include JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Pagination
For large result sets, use `limit` and `offset`:
- limit: Number of records per page (default: 50)
- offset: Starting position (default: 0)

Example: Get page 2 with 20 items per page
```
GET /transactions?limit=20&offset=20
```

---

## 🧪 Testing with cURL

### Example: Complete Flow
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"Demo@2024"}' \
  | jq -r '.token')

# 2. Get accounts
curl http://localhost:5000/api/accounts \
  -H "Authorization: Bearer $TOKEN"

# 3. Create transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "account_id": 1,
    "category_id": 1,
    "amount": 150000,
    "transaction_date": "2024-03-15T12:00:00",
    "description": "Test transaction"
  }'

# 4. Get dashboard
curl http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

**API Version:** 1.0.0  
**Last Updated:** December 2024  
**Base URL:** http://localhost:5000/api
