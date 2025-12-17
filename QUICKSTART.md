# MoneyMinder - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Prerequisites
Make sure you have:
- ✅ MySQL 8.0+ installed and running
- ✅ Python 3.8+ installed
- ✅ Terminal/Command Prompt access

### Step 2: Clone & Setup
```bash
cd /home/sg/Database_Project
chmod +x setup.sh run.sh
./setup.sh
```

When prompted, enter your MySQL root password.

### Step 3: Configure (Optional)
```bash
# Edit if needed
nano backend/.env
```

### Step 4: Run
```bash
./run.sh
```

### Step 5: Access
Open your browser:
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:5000

### Step 6: Login
Use demo account:
- **Email:** john.doe@example.com
- **Password:** Demo@2024

---

## 🎯 What to Try First

1. **Dashboard** - See your financial overview
2. **Add Transaction** - Click "+ Add Transaction"
3. **View Accounts** - Check all your accounts
4. **Analytics** - See budget tracking

---

## 🆘 Quick Troubleshooting

**Backend won't start?**
```bash
cd backend
source venv/bin/activate
python app.py
```

**Frontend not loading?**
```bash
cd frontend
python3 -m http.server 8080
```

**Database error?**
```bash
mysql -u root -p < Physical_Schema_Definition.sql
mysql -u root -p < Sample_Data.sql
```

---

## 📚 Full Documentation

- **Installation:** See `INSTALLATION.md`
- **Demo Guide:** See `DEMO_SCRIPT.md`
- **Testing:** See `TESTING_GUIDE.md`
- **Project Details:** See `README.md`

---

## ⭐ Key Features to Explore

- ✨ Multi-currency transactions
- ✨ Unusual spending alerts
- ✨ Budget tracking
- ✨ Recurring payments
- ✨ Analytics dashboard

---

**Need Help?** Check `INSTALLATION.md` for detailed troubleshooting.

**Ready to Present?** See `DEMO_SCRIPT.md` for demo flow.
