# MoneyMinder Project - Installation & Troubleshooting

## System Requirements

- **Operating System:** Linux, macOS, or Windows (with WSL)
- **MySQL:** Version 8.0 or higher
- **Python:** Version 3.8 or higher
- **pip:** Python package installer
- **Web Browser:** Chrome, Firefox, Safari, or Edge (latest version)
- **Disk Space:** At least 500 MB free

---

## Installation Guide

### Step 1: Install Prerequisites

#### On Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install MySQL
sudo apt install mysql-server

# Install Python 3 and pip
sudo apt install python3 python3-pip python3-venv

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### On macOS:
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MySQL
brew install mysql
brew services start mysql

# Python 3 usually pre-installed, check version
python3 --version
```

#### On Windows:
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Download Python from https://www.python.org/downloads/
3. Run installers and follow setup wizards

### Step 2: Configure MySQL

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Login to MySQL
sudo mysql -u root -p

# Create database and users (or run the setup script)
```

### Step 3: Clone and Setup Project

```bash
# Clone repository
git clone https://github.com/Mancupfire/VinUni-database-project-MoneyMinder.git
cd Database_Project

# Make scripts executable
chmod +x setup.sh run.sh

# Run setup script
./setup.sh
```

### Step 4: Configure Environment

```bash
# Edit backend configuration
nano backend/.env

# Update these values:
DB_HOST=localhost
DB_USER=moneyminder_app
DB_PASSWORD=App@2024Secure!
DB_NAME=MoneyMinder_DB
DB_PORT=3306
```

### Step 5: Run the Application

```bash
# Start all services
./run.sh

# Access the application
# Frontend: http://localhost:8080
# Backend:  http://localhost:5000
```

---

## Common Issues & Solutions

### Issue 1: MySQL Connection Error

**Error:** `Can't connect to MySQL server`

**Solutions:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Check MySQL port
sudo netstat -tlnp | grep mysql

# Test connection
mysql -u root -p
```

### Issue 2: Python Module Not Found

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solutions:**
```bash
# Activate virtual environment
cd backend
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep -i flask
```

### Issue 3: Port Already in Use

**Error:** `Address already in use: Port 5000`

**Solutions:**
```bash
# Find process using port
sudo lsof -i :5000

# Kill process (replace PID)
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Issue 4: Permission Denied

**Error:** `Permission denied: './setup.sh'`

**Solutions:**
```bash
# Make scripts executable
chmod +x setup.sh run.sh

# Or run with bash
bash setup.sh
```

### Issue 5: Database Already Exists

**Error:** `Database 'MoneyMinder_DB' already exists`

**Solutions:**
```bash
# Drop and recreate database
mysql -u root -p
DROP DATABASE IF EXISTS MoneyMinder_DB;

# Then run setup again
./setup.sh
```

### Issue 6: Frontend Not Loading

**Error:** Blank page or 404 errors

**Solutions:**
```bash
# Check if Python server is running
ps aux | grep "python3 -m http.server"

# Manually start frontend server
cd frontend
python3 -m http.server 8080

# Or use alternative:
php -S localhost:8080  # If PHP is installed
```

### Issue 7: CORS Error

**Error:** `Access-Control-Allow-Origin header`

**Solutions:**
```bash
# Check backend/app.py has CORS enabled
# Should see: CORS(app, resources={...})

# Restart backend
cd backend
source venv/bin/activate
python app.py
```

### Issue 8: JWT Token Invalid

**Error:** `Invalid or expired token`

**Solutions:**
1. Clear browser localStorage
2. Logout and login again
3. Check JWT_SECRET_KEY in backend/.env
4. Ensure system time is correct

### Issue 9: Trigger/Procedure Not Found

**Error:** `PROCEDURE MoneyMinder_DB.SP_Create_Recurring_Transaction does not exist`

**Solutions:**
```bash
# Reload database schema
mysql -u root -p < Physical_Schema_Definition.sql

# Verify procedures exist
mysql -u root -p MoneyMinder_DB
SHOW PROCEDURE STATUS WHERE Db = 'MoneyMinder_DB';
```

### Issue 10: Balance Not Updating

**Issue:** Trigger not firing

**Solutions:**
```sql
-- Check if triggers exist
USE MoneyMinder_DB;
SHOW TRIGGERS;

-- Manually drop and recreate
DROP TRIGGER IF EXISTS TRG_Update_Account_Balance_Insert;
-- Then re-run Physical_Schema_Definition.sql
```

---

## Manual Installation (Alternative)

If scripts fail, follow these manual steps:

### 1. Create Database
```sql
mysql -u root -p
```

```sql
CREATE DATABASE MoneyMinder_DB;
USE MoneyMinder_DB;
source /path/to/Physical_Schema_Definition.sql;
source /path/to/Sample_Data.sql;
exit;
```

### 2. Setup Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install Flask Flask-CORS PyMySQL python-dotenv bcrypt PyJWT cryptography
cp .env.example .env
# Edit .env with your settings
python app.py
```

### 3. Setup Frontend
```bash
cd frontend
python3 -m http.server 8080
```

---

## Verification Steps

### Test Database Connection
```bash
cd backend
source venv/bin/activate
python database.py

# Expected output: "✓ Database connection successful!"
```

### Test Backend API
```bash
curl http://localhost:5000/api/health

# Expected: {"status":"healthy","database":"connected"}
```

### Test Frontend
Open browser: http://localhost:8080

Expected: Login page loads

---

## Uninstallation

```bash
# Stop all services
# Press Ctrl+C in terminal running ./run.sh

# Remove database
mysql -u root -p
DROP DATABASE IF EXISTS MoneyMinder_DB;
DROP USER IF EXISTS 'moneyminder_admin'@'localhost';
DROP USER IF EXISTS 'moneyminder_app'@'localhost';
DROP USER IF EXISTS 'moneyminder_readonly'@'localhost';
FLUSH PRIVILEGES;
exit;

# Remove project files
cd ..
rm -rf Database_Project
```

---

## Getting Help

### Check Logs
```bash
# Backend errors
cd backend
tail -f app.log  # If logging enabled

# MySQL errors
sudo tail -f /var/log/mysql/error.log
```

### Debug Mode
```bash
# Enable Flask debug mode
cd backend
nano .env

# Set:
FLASK_DEBUG=True

# Restart backend
python app.py
```

### Community Support
- GitHub Issues: https://github.com/Mancupfire/VinUni-database-project-MoneyMinder/issues
- Email: Your team email
- Documentation: README.md, DEMO_SCRIPT.md, TESTING_GUIDE.md

---

## Performance Tuning

### For Large Datasets
```sql
-- Add partitioning to Transactions table
ALTER TABLE Transactions
PARTITION BY RANGE (YEAR(transaction_date)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### For Faster Queries
```sql
-- Analyze tables
ANALYZE TABLE Transactions, Accounts, Categories;

-- Optimize tables
OPTIMIZE TABLE Transactions;
```

### Backend Optimization
```python
# In backend/database.py, use connection pooling
# Install: pip install PyMySQL[pool]
```

---

## Security Hardening (Production)

1. **Change default passwords** in backend/.env
2. **Enable HTTPS** with SSL certificate
3. **Set strong JWT_SECRET_KEY**
4. **Implement rate limiting**
5. **Enable MySQL query logs** for auditing
6. **Regular backups:**
   ```bash
   mysqldump -u root -p MoneyMinder_DB > backup_$(date +%Y%m%d).sql
   ```

---

## Development Tips

### Run in Development Mode
```bash
# Backend with auto-reload
cd backend
source venv/bin/activate
FLASK_ENV=development python app.py

# Frontend with live-reload (using browser-sync)
npm install -g browser-sync
browser-sync start --server frontend --files "frontend/**/*"
```

### Database Migrations
```sql
-- Create migration SQL file
-- migrations/001_add_column.sql
ALTER TABLE Users ADD COLUMN phone VARCHAR(20);

-- Apply migration
mysql -u root -p MoneyMinder_DB < migrations/001_add_column.sql
```

---

## Useful Commands

```bash
# Check Python version
python3 --version

# Check MySQL version
mysql --version

# Check running processes
ps aux | grep python
ps aux | grep mysql

# Check port usage
sudo lsof -i :5000
sudo lsof -i :8080
sudo lsof -i :3306

# Test network connectivity
curl http://localhost:5000/api/health
wget http://localhost:8080

# View system resources
htop  # or: top
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0
