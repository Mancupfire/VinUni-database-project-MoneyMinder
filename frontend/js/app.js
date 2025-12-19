// MoneyMinder Frontend Application
const API_URL = 'http://localhost:5000/api';

// State Management
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  sortBy: 'date',
  sortOrder: 'desc',
  budgetSortBy: 'status',
  budgetSortOrder: 'desc',
  budgetFilter: 'all'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  if (state.token && state.user) {
    showMainApp();
    loadDashboard();
  } else {
    showLoginPage();
  }

  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');

  sidebarToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent?.classList.toggle('expanded');
  });  // Auth Forms
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
  document.getElementById('showRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterPage();
  });
  document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPage();
  });

  // Navigation
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.target.closest('[data-page]').getAttribute('data-page');
      navigateToPage(page);

      // Update active link
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.target.closest('.nav-link')?.classList.add('active');
    });
  });

  // Forms
  document.getElementById('addTransactionForm')?.addEventListener('submit', handleAddTransaction);
  document.getElementById('editTransactionForm')?.addEventListener('submit', handleEditTransaction);
  document.getElementById('addAccountForm')?.addEventListener('submit', handleAddAccount);
  document.getElementById('addBudgetForm')?.addEventListener('submit', handleAddBudget);
  document.getElementById('editBudgetForm')?.addEventListener('submit', handleEditBudget);
  document.getElementById('addGroupForm')?.addEventListener('submit', handleAddGroup);
  document.getElementById('addMemberForm')?.addEventListener('submit', handleAddMember);
  document.getElementById('addRecurringForm')?.addEventListener('submit', handleAddRecurring);
  document.getElementById('editRecurringForm')?.addEventListener('submit', handleEditRecurring);
  document.getElementById('applyFilters')?.addEventListener('click', loadTransactions);
  
  // Load groups when transaction modal opens
  const txnModal = document.getElementById('addTransactionModal');
  if (txnModal) {
    txnModal.addEventListener('show.bs.modal', loadGroupsForTransaction);
  }
  
  // Load categories when budget modal opens
  const budgetModal = document.getElementById('addBudgetModal');
  if (budgetModal) {
    budgetModal.addEventListener('show.bs.modal', loadCategoriesForBudget);
  }
  
  // Toggle currency fields
  document.getElementById('txnForeignCurrency')?.addEventListener('change', function(e) {
    document.getElementById('currencyFields').style.display = e.target.checked ? 'block' : 'none';
  });
  
  // Toggle custom category field
  document.getElementById('txnCategory')?.addEventListener('change', function(e) {
    const customField = document.getElementById('customCategoryField');
    if (customField) {
      customField.style.display = e.target.value === 'other' ? 'block' : 'none';
      document.getElementById('txnCustomCategory').required = e.target.value === 'other';
    }
  });
  
  document.getElementById('editTxnCategory')?.addEventListener('change', function(e) {
    const customField = document.getElementById('editCustomCategoryField');
    if (customField) {
      customField.style.display = e.target.value === 'other' ? 'block' : 'none';
      document.getElementById('editTxnCustomCategory').required = e.target.value === 'other';
    }
  });
  
  // Fetch exchange rate
  document.getElementById('fetchExchangeRate')?.addEventListener('click', fetchExchangeRate);
}

// Authentication Functions
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showMainApp();
      loadDashboard();
      showToast('Login successful!', 'success');
    } else {
      showToast(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    showToast('Connection error. Please check if backend is running.', 'error');
    console.error('Login error:', error);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const base_currency = document.getElementById('regCurrency').value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, base_currency })
    });

    const data = await response.json();

    if (response.ok) {
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showMainApp();
      loadDashboard();
      showToast('Registration successful!', 'success');
    } else {
      showToast(data.error || 'Registration failed', 'error');
    }
  } catch (error) {
    showToast('Connection error', 'error');
    console.error('Register error:', error);
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showLoginPage();
  showToast('Logged out successfully', 'success');
}

// Navigation Functions
function showLoginPage() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('registerPage').style.display = 'none';
  document.getElementById('mainApp').style.display = 'none';
}

function showRegisterPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('registerPage').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('registerPage').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  document.getElementById('userDisplay').textContent = state.user.username;
}

function navigateToPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.content-page').forEach(page => {
    page.style.display = 'none';
  });

  // Show selected page
  document.getElementById(`${pageName}Page`).style.display = 'block';

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

  // Load page data
  switch (pageName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'transactions':
      loadTransactions();
      break;
    case 'accounts':
      loadAccounts();
      break;
    case 'budgets':
      loadBudgets();
      loadCategoriesForBudget();
      break;
    case 'groups':
      loadGroups();
      break;
    case 'recurring':
      loadRecurringPayments();
      loadAccountsForRecurring();
      loadCategoriesForRecurring();
      break;
    case 'analytics':
      loadAnalytics();
      break;
  }
}

// API Helper
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  return response;
}

// Dashboard Functions
async function loadDashboard() {
  try {
    const response = await apiRequest('/analytics/dashboard');
    const data = await response.json();

    if (response.ok) {
      // Update summary cards
      const currency = state.user.base_currency === 'VND' ? '₫' : '$';
      document.getElementById('totalBalance').textContent = formatCurrency(data.accounts.balance, currency);
      document.getElementById('monthIncome').textContent = formatCurrency(data.current_month.income, currency);
      document.getElementById('monthExpense').textContent = formatCurrency(data.current_month.expense, currency);
      document.getElementById('netBalance').textContent = formatCurrency(data.current_month.net, currency);

      // Update recent transactions
      const tbody = document.querySelector('#recentTransactionsTable tbody');
      tbody.innerHTML = '';

      data.recent_transactions.forEach(txn => {
        const row = tbody.insertRow();
        row.innerHTML = `
                    <td>${formatDate(txn.transaction_date)}</td>
                    <td>${txn.description || '-'}</td>
                    <td><span class="badge bg-${txn.category_type === 'Income' ? 'success' : 'danger'}">${txn.category_name}</span></td>
                    <td>${txn.account_name}</td>
                    <td class="txn-${txn.category_type.toLowerCase()}">${txn.category_type === 'Income' ? '+' : '-'}${formatCurrency(txn.amount, currency)}</td>
                `;
      });
    }
  } catch (error) {
    showToast('Error loading dashboard', 'error');
    console.error('Dashboard error:', error);
  }
}

// Transaction Functions
function sortTransactions(sortBy) {
  if (state.sortBy === sortBy) {
    // Toggle sort order if clicking same column
    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to descending
    state.sortBy = sortBy;
    state.sortOrder = 'desc';
  }
  
  // Update sort indicators
  document.querySelectorAll('#transactionsTable th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
  });
  
  const activeHeader = document.querySelector(`#transactionsTable th[data-sort="${sortBy}"]`);
  if (activeHeader) {
    activeHeader.classList.add(state.sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
  }
  
  // Re-display with new sorting
  displayTransactions(state.transactions);
}

async function loadTransactions() {
  try {
    // Build query params
    const params = new URLSearchParams();
    const startDate = document.getElementById('filterStartDate')?.value;
    const endDate = document.getElementById('filterEndDate')?.value;
    const accountId = document.getElementById('filterAccount')?.value;

    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (accountId) params.append('account_id', accountId);

    const response = await apiRequest(`/transactions?${params.toString()}`);
    const data = await response.json();

    if (response.ok) {
      state.transactions = data.transactions || [];
      displayTransactions(data.transactions || []);

      // Load accounts for filter
      if (!state.accounts.length) {
        await loadAccountsForFilter();
      }
    } else {
      console.error('API Error:', data);
      showToast(data.error || 'Failed to load transactions', 'error');
    }
  } catch (error) {
    showToast('Error loading transactions', 'error');
    console.error('Transactions error:', error);
  }
}

function displayTransactions(transactions) {
  const tbody = document.querySelector('#transactionsTable tbody');
  tbody.innerHTML = '';
  const currency = state.user.base_currency === 'VND' ? '₫' : '$';

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    let compareValue = 0;
    
    if (state.sortBy === 'date') {
      compareValue = new Date(a.transaction_date) - new Date(b.transaction_date);
    } else if (state.sortBy === 'amount') {
      compareValue = parseFloat(a.amount) - parseFloat(b.amount);
    }
    
    return state.sortOrder === 'asc' ? compareValue : -compareValue;
  });

  sortedTransactions.forEach(txn => {
    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${formatDate(txn.transaction_date)}</td>
            <td>${txn.description || '-'}</td>
            <td><span class="badge bg-${txn.category_type === 'Income' ? 'success' : 'danger'}">${txn.category_name}</span></td>
            <td>${txn.account_name}</td>
            <td class="txn-${txn.category_type.toLowerCase()}">${txn.category_type === 'Income' ? '+' : '-'}${formatCurrency(txn.amount, currency)}</td>
            <td>
                <button class="btn btn-sm btn-secondary me-1" onclick="editTransaction(${txn.transaction_id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${txn.transaction_id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
  });
}

async function handleAddTransaction(e) {
  e.preventDefault();

  // Validate amount
  const amount = parseFloat(document.getElementById('txnAmount').value);
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid positive amount', 'error');
    return;
  }

  let categoryId = document.getElementById('txnCategory').value;
  
  // Handle custom category
  if (categoryId === 'other') {
    const customCategoryName = document.getElementById('txnCustomCategory').value.trim();
    if (!customCategoryName) {
      showToast('Please enter a custom category name', 'error');
      return;
    }
    
    // Create new category first
    try {
      const catResponse = await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({
          category_name: customCategoryName,
          type: 'Expense'
        })
      });
      
      if (catResponse.ok) {
        const catData = await catResponse.json();
        categoryId = catData.category_id;
      } else {
        showToast('Failed to create custom category', 'error');
        return;
      }
    } catch (error) {
      showToast('Error creating custom category', 'error');
      return;
    }
  }

  const transactionData = {
    account_id: parseInt(document.getElementById('txnAccount').value),
    category_id: parseInt(categoryId),
    amount: amount,
    transaction_date: document.getElementById('txnDate').value,
    description: document.getElementById('txnDescription').value
  };

  // Add group if selected
  const groupId = document.getElementById('txnGroup').value;
  if (groupId) {
    transactionData.group_id = parseInt(groupId);
  }

  // Add multi-currency fields if foreign currency is enabled
  const isForeign = document.getElementById('txnForeignCurrency').checked;
  if (isForeign) {
    const originalAmount = parseFloat(document.getElementById('txnOriginalAmount').value);
    const currencyCode = document.getElementById('txnCurrencyCode').value;
    const exchangeRate = parseFloat(document.getElementById('txnExchangeRate').value);
    
    if (!originalAmount || isNaN(originalAmount) || originalAmount <= 0) {
      showToast('Please enter a valid original amount', 'error');
      return;
    }
    if (!exchangeRate || isNaN(exchangeRate) || exchangeRate <= 0) {
      showToast('Please enter a valid exchange rate', 'error');
      return;
    }
    
    transactionData.original_amount = originalAmount;
    transactionData.currency_code = currencyCode;
    transactionData.exchange_rate = exchangeRate;
    // Recalculate amount based on exchange rate
    transactionData.amount = originalAmount * exchangeRate;
  }

  try {
    const response = await apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });

    const data = await response.json();

    if (response.ok) {
      showToast('Transaction added successfully!', 'success');

      // Show unusual spending alert if present
      if (data.alert && data.alert.unusual) {
        showToast(`⚠️ ${data.alert.message}`, 'warning');
      }

      // Close modal and reset form
      bootstrap.Modal.getInstance(document.getElementById('addTransactionModal')).hide();
      document.getElementById('addTransactionForm').reset();
      document.getElementById('currencyFields').style.display = 'none';

      // Reload data
      loadTransactions();
      loadDashboard();
    } else {
      showToast(data.error || 'Failed to add transaction', 'error');
    }
  } catch (error) {
    showToast('Error adding transaction', 'error');
    console.error('Add transaction error:', error);
  }
}

async function deleteTransaction(id) {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    const response = await apiRequest(`/transactions/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('Transaction deleted successfully!', 'success');
      loadTransactions();
      loadDashboard();
    } else {
      const data = await response.json();
      showToast(data.error || 'Failed to delete transaction', 'error');
    }
  } catch (error) {
    showToast('Error deleting transaction', 'error');
    console.error('Delete transaction error:', error);
  }
}

async function editTransaction(transactionId) {
  try {
    const response = await apiRequest(`/transactions/${transactionId}`);
    const data = await response.json();
    
    if (!response.ok) {
      showToast(data.error || 'Transaction not found', 'error');
      return;
    }
    
    const transaction = data.transaction; // Backend returns {transaction: {...}}

    // Load accounts and categories
    const accountsResponse = await apiRequest('/accounts');
    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || accountsData; // Handle both formats
    
    const categoriesResponse = await apiRequest('/categories');
    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.categories || categoriesData; // Handle both formats

    // Populate account dropdown
    const accountSelect = document.getElementById('editTxnAccount');
    accountSelect.innerHTML = accounts
      .map(a => `<option value="${a.account_id}" ${a.account_id === transaction.account_id ? 'selected' : ''}>${a.account_name} (${a.account_type})</option>`)
      .join('');

    // Populate category dropdown
    const categorySelect = document.getElementById('editTxnCategory');
    categorySelect.innerHTML = categories
      .map(c => `<option value="${c.category_id}" ${c.category_id === transaction.category_id ? 'selected' : ''}>${c.category_name} (${c.type})</option>`)
      .join('');
    
    // Add "Other" option
    categorySelect.innerHTML += '<option value="other">Other (Custom)</option>';

    // Populate other fields
    document.getElementById('editTxnId').value = transaction.transaction_id;
    document.getElementById('editTxnAmount').value = transaction.amount;
    document.getElementById('editTxnDate').value = transaction.transaction_date.substring(0, 16); // Format for datetime-local
    document.getElementById('editTxnDescription').value = transaction.description || '';

    // Show modal
    new bootstrap.Modal(document.getElementById('editTransactionModal')).show();
  } catch (error) {
    showToast('Error loading transaction', 'error');
    console.error('Edit transaction error:', error);
  }
}

async function handleEditTransaction(e) {
  e.preventDefault();

  const transactionId = document.getElementById('editTxnId').value;
  const amount = parseFloat(document.getElementById('editTxnAmount').value);
  
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid positive amount', 'error');
    return;
  }

  let categoryId = document.getElementById('editTxnCategory').value;
  
  // Handle custom category
  if (categoryId === 'other') {
    const customCategoryName = document.getElementById('editTxnCustomCategory').value.trim();
    if (!customCategoryName) {
      showToast('Please enter a custom category name', 'error');
      return;
    }
    
    // Create new category first
    try {
      const catResponse = await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({
          category_name: customCategoryName,
          type: 'Expense'
        })
      });
      
      if (catResponse.ok) {
        const catData = await catResponse.json();
        categoryId = catData.category_id;
      } else {
        showToast('Failed to create custom category', 'error');
        return;
      }
    } catch (error) {
      showToast('Error creating custom category', 'error');
      return;
    }
  }

  const transactionData = {
    account_id: parseInt(document.getElementById('editTxnAccount').value),
    category_id: parseInt(categoryId),
    amount: amount,
    transaction_date: document.getElementById('editTxnDate').value,
    description: document.getElementById('editTxnDescription').value
  };

  try {
    const response = await apiRequest(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });

    if (response.ok) {
      showToast('Transaction updated successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('editTransactionModal')).hide();
      loadTransactions();
      loadDashboard();
    } else {
      const data = await response.json();
      showToast(data.error || 'Failed to update transaction', 'error');
    }
  } catch (error) {
    showToast('Error updating transaction', 'error');
    console.error('Update transaction error:', error);
  }
}


// Account Functions
async function loadAccounts() {
  try {
    const response = await apiRequest('/accounts');
    const data = await response.json();

    if (response.ok) {
      state.accounts = data.accounts;
      displayAccounts(data.accounts);
    }
  } catch (error) {
    showToast('Error loading accounts', 'error');
    console.error('Accounts error:', error);
  }
}

function displayAccounts(accounts) {
  const container = document.getElementById('accountsContainer');
  container.innerHTML = '';
  const currency = state.user.base_currency === 'VND' ? '₫' : '$';

  accounts.forEach(acc => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-3';

    const typeClass = acc.account_type.toLowerCase().replace(' ', '');
    const icon = getAccountIcon(acc.account_type);

    col.innerHTML = `
            <div class="card account-card ${typeClass}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="card-title mb-1">${acc.account_name}</h5>
                            <p class="card-text text-muted mb-0"><i class="bi ${icon}"></i> ${acc.account_type}</p>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAccount(${acc.account_id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <h3 class="mb-0">${formatCurrency(acc.balance, currency)}</h3>
                </div>
            </div>
        `;

    container.appendChild(col);
  });
}

async function handleAddAccount(e) {
  e.preventDefault();

  const balance = parseFloat(document.getElementById('accBalance').value);
  if (isNaN(balance)) {
    showToast('Please enter a valid balance', 'error');
    return;
  }

  const accountName = document.getElementById('accName').value.trim();
  if (!accountName) {
    showToast('Please enter an account name', 'error');
    return;
  }

  const accountData = {
    account_name: accountName,
    account_type: document.getElementById('accType').value,
    balance: balance
  };

  try {
    const response = await apiRequest('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData)
    });

    if (response.ok) {
      showToast('Account added successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('addAccountModal')).hide();
      loadAccounts();
      document.getElementById('addAccountForm').reset();
    } else {
      const data = await response.json();
      showToast(data.error || 'Failed to add account', 'error');
    }
  } catch (error) {
    showToast('Error adding account', 'error');
    console.error('Add account error:', error);
  }
}

async function deleteAccount(id) {
  if (!confirm('Are you sure you want to delete this account?')) return;

  try {
    const response = await apiRequest(`/accounts/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('Account deleted successfully!', 'success');
      loadAccounts();
    } else {
      const data = await response.json();
      showToast(data.error || 'Failed to delete account', 'error');
    }
  } catch (error) {
    showToast('Error deleting account', 'error');
    console.error('Delete account error:', error);
  }
}

// Analytics Functions
async function loadAnalytics() {
  try {
    // Load budget status
    const budgetResponse = await apiRequest('/analytics/budget-status');
    const budgetData = await budgetResponse.json();

    if (budgetResponse.ok) {
      displayBudgetStatus(budgetData.budgets);
    }

    // Load category spending
    const spendingResponse = await apiRequest('/analytics/spending-by-category');
    const spendingData = await spendingResponse.json();

    if (spendingResponse.ok) {
      displayCategorySpending(spendingData.categories);
    }
  } catch (error) {
    showToast('Error loading analytics', 'error');
    console.error('Analytics error:', error);
  }
}

function displayBudgetStatus(budgets) {
  const container = document.getElementById('budgetStatus');

  if (!budgets || budgets.length === 0) {
    container.innerHTML = '<p class="text-muted">No budgets set for this month.</p>';
    return;
  }

  const currency = state.user.base_currency === 'VND' ? '₫' : '$';
  container.innerHTML = '';

  budgets.forEach(budget => {
    const statusClass = budget.status.toLowerCase();
    const progressClass = budget.percentage >= 100 ? 'danger' : budget.percentage >= 80 ? 'warning' : 'success';

    const budgetHtml = `
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">${budget.category_name}</h6>
                    <span class="alert-badge ${statusClass}">${budget.status}</span>
                </div>
                <div class="progress mb-2">
                    <div class="progress-bar bg-${progressClass}" role="progressbar" 
                         style="width: ${Math.min(budget.percentage, 100)}%" 
                         aria-valuenow="${budget.percentage}" aria-valuemin="0" aria-valuemax="100">
                        ${budget.percentage.toFixed(1)}%
                    </div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Spent: ${formatCurrency(budget.spent, currency)}</span>
                    <span>Limit: ${formatCurrency(budget.amount_limit, currency)}</span>
                </div>
            </div>
        `;

    container.innerHTML += budgetHtml;
  });
}

function displayCategorySpending(categories) {
  const tbody = document.querySelector('#categorySpendingTable tbody');
  tbody.innerHTML = '';
  const currency = state.user.base_currency === 'VND' ? '₫' : '$';

  categories.forEach(cat => {
    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${cat.category_name}</td>
            <td><span class="badge bg-${cat.type === 'Income' ? 'success' : 'danger'}">${cat.type}</span></td>
            <td>${cat.transaction_count}</td>
            <td class="txn-${cat.type.toLowerCase()}">${formatCurrency(cat.total_amount, currency)}</td>
            <td>${formatCurrency(cat.avg_amount, currency)}</td>
        `;
  });
}

// Helper Functions
async function loadAccountsForFilter() {
  const response = await apiRequest('/accounts');
  const data = await response.json();

  if (response.ok) {
    state.accounts = data.accounts;
    const select = document.getElementById('filterAccount');
    select.innerHTML = '<option value="">All Accounts</option>';

    data.accounts.forEach(acc => {
      const option = document.createElement('option');
      option.value = acc.account_id;
      option.textContent = acc.account_name;
      select.appendChild(option);
    });
  }
}

async function loadCategoriesForModal() {
  const response = await apiRequest('/categories');
  const data = await response.json();

  if (response.ok) {
    state.categories = data.categories;
    const select = document.getElementById('txnCategory');
    select.innerHTML = '';

    data.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.category_id;
      option.textContent = `${cat.category_name} (${cat.type})`;
      select.appendChild(option);
    });
    
    // Add "Other" option at the end
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'Other (Custom)';
    select.appendChild(otherOption);
  }
}

async function loadAccountsForModal() {
  const response = await apiRequest('/accounts');
  const data = await response.json();

  if (response.ok) {
    const select = document.getElementById('txnAccount');
    select.innerHTML = '';

    data.accounts.forEach(acc => {
      const option = document.createElement('option');
      option.value = acc.account_id;
      option.textContent = `${acc.account_name} (${acc.account_type})`;
      select.appendChild(option);
    });
  }
}

// Load data when modal is shown
document.getElementById('addTransactionModal')?.addEventListener('show.bs.modal', () => {
  loadAccountsForModal();
  loadCategoriesForModal();

  // Set default date to now
  const now = new Date();
  const dateString = now.toISOString().slice(0, 16);
  document.getElementById('txnDate').value = dateString;
});

function formatCurrency(amount, symbol = '₫') {
  const num = parseFloat(amount) || 0;
  if (symbol === '₫') {
    return symbol + num.toLocaleString('vi-VN');
  }
  return symbol + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getAccountIcon(type) {
  const icons = {
    'Cash': 'bi-cash-stack',
    'Bank Account': 'bi-bank',
    'Credit Card': 'bi-credit-card',
    'E-Wallet': 'bi-wallet2',
    'Investment': 'bi-graph-up-arrow'
  };
  return icons[type] || 'bi-wallet';
}

function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;

  const icon = type === 'success' ? 'check-circle-fill' : type === 'error' ? 'x-circle-fill' : 'exclamation-circle-fill';

  toast.innerHTML = `
        <i class="bi bi-${icon}" style="font-size: 1.5rem; color: var(--${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'}-color);"></i>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// FORM HANDLERS FOR NEW FEATURES
// ============================================
async function handleAddBudget(e) {
  e.preventDefault();

  const amountLimit = parseFloat(document.getElementById('budgetLimit').value);
  if (isNaN(amountLimit) || amountLimit <= 0) {
    showToast('Please enter a valid budget amount', 'error');
    return;
  }

  const startDate = document.getElementById('budgetStartDate').value;
  const endDate = document.getElementById('budgetEndDate').value;
  
  if (new Date(endDate) <= new Date(startDate)) {
    showToast('End date must be after start date', 'error');
    return;
  }

  const data = {
    category_id: parseInt(document.getElementById('budgetCategory').value),
    amount_limit: amountLimit,
    start_date: startDate,
    end_date: endDate
  };

  try {
    const response = await apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Budget created successfully');
      bootstrap.Modal.getInstance(document.getElementById('addBudgetModal')).hide();
      document.getElementById('addBudgetForm').reset();
      loadBudgets();
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed to create budget', 'error');
    }
  } catch (error) {
    showToast('Error creating budget', 'error');
  }
}

async function handleAddGroup(e) {
  e.preventDefault();

  const data = {
    group_name: document.getElementById('groupName').value
  };

  try {
    const response = await apiRequest('/groups', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Group created successfully');
      bootstrap.Modal.getInstance(document.getElementById('addGroupModal')).hide();
      document.getElementById('addGroupForm').reset();
      loadGroups();
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed to create group', 'error');
    }
  } catch (error) {
    showToast('Error creating group', 'error');
  }
}

async function handleAddMember(e) {
  e.preventDefault();

  const groupId = document.getElementById('memberGroupId').value;
  const data = {
    email: document.getElementById('memberEmail').value
  };

  try {
    const response = await apiRequest(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Member added successfully');
      bootstrap.Modal.getInstance(document.getElementById('addMemberModal')).hide();
      document.getElementById('addMemberForm').reset();
      loadGroups();
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed to add member', 'error');
    }
  } catch (error) {
    showToast('Error adding member', 'error');
  }
}

async function handleAddRecurring(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('recurringAmount').value);
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }

  const data = {
    account_id: parseInt(document.getElementById('recurringAccount').value),
    category_id: parseInt(document.getElementById('recurringCategory').value),
    amount: amount,
    frequency: document.getElementById('recurringFrequency').value,
    start_date: document.getElementById('recurringStartDate').value
  };

  try {
    const response = await apiRequest('/recurring', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Recurring payment added successfully');
      bootstrap.Modal.getInstance(document.getElementById('addRecurringModal')).hide();
      document.getElementById('addRecurringForm').reset();
      loadRecurringPayments();
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed to add recurring payment', 'error');
    }
  } catch (error) {
    showToast('Error adding recurring payment', 'error');
  }
}

async function loadCategoriesForBudget() {
  try {
    const response = await apiRequest('/categories');
    const data = await response.json();

    const select = document.getElementById('budgetCategory');
    if (select) {
      select.innerHTML = data.categories
        .filter(c => c.type === 'Expense')
        .map(c => `<option value="${c.category_id}">${c.category_name}</option>`)
        .join('');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadAccountsForRecurring() {
  try {
    const response = await apiRequest('/accounts');
    const data = await response.json();
    const accounts = data.accounts || data;

    const select = document.getElementById('recurringAccount');
    select.innerHTML = accounts
      .map(a => `<option value="${a.account_id}">${a.account_name} (${a.account_type})</option>`)
      .join('');
  } catch (error) {
    console.error('Error loading accounts:', error);
  }
}

async function loadCategoriesForRecurring() {
  try {
    const response = await apiRequest('/categories');
    const data = await response.json();
    const categories = data.categories || data;

    const select = document.getElementById('recurringCategory');
    select.innerHTML = categories
      .filter(c => c.type === 'Expense')
      .map(c => `<option value="${c.category_id}">${c.category_name}</option>`)
      .join('');
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// ============================================
// BUDGETS FUNCTIONS
// ============================================
async function loadBudgets() {
  try {
    const response = await apiRequest('/budgets');
    const budgets = await response.json();

    state.budgets = budgets || [];
    displayBudgets(state.budgets);
  } catch (error) {
    showToast('Error loading budgets', 'error');
    console.error('Budgets error:', error);
  }
}

function displayBudgets(budgets) {
  // Apply filter
  let filteredBudgets = budgets;
  if (state.budgetFilter !== 'all') {
    filteredBudgets = budgets.filter(b => b.status === state.budgetFilter.toUpperCase());
  }

  // Apply sorting
  const sortedBudgets = [...filteredBudgets].sort((a, b) => {
    let compareValue = 0;
    
    if (state.budgetSortBy === 'status') {
      const statusOrder = { 'EXCEEDED': 4, 'WARNING': 3, 'NORMAL': 2, 'SAFE': 1 };
      compareValue = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
    } else if (state.budgetSortBy === 'amount') {
      compareValue = parseFloat(a.amount_limit) - parseFloat(b.amount_limit);
    } else if (state.budgetSortBy === 'spent') {
      compareValue = parseFloat(a.spent) - parseFloat(b.spent);
    } else if (state.budgetSortBy === 'category') {
      compareValue = a.category_name.localeCompare(b.category_name);
    }
    
    return state.budgetSortOrder === 'asc' ? compareValue : -compareValue;
  });

    const container = document.getElementById('budgetsContainer');
    if (!sortedBudgets || sortedBudgets.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted py-5">
          <i class="bi bi-wallet2" style="font-size: 3rem;"></i>
          <p>No budgets found. Create one to start tracking your spending limits!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = sortedBudgets.map(budget => {
      const percentage = budget.percentage || 0;
      const statusClass = budget.status === 'EXCEEDED' ? 'danger' : budget.status === 'WARNING' ? 'warning' : budget.status === 'NORMAL' ? 'info' : 'success';
      const currency = state.user.base_currency === 'VND' ? '₫' : '$';

      return `
        <div class="col-md-6 col-lg-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h6 class="card-title">${budget.category_name}</h6>
              <p class="mb-2 small text-muted">${budget.start_date} to ${budget.end_date}</p>
              <div class="d-flex justify-content-between mb-2">
                <span>Spent: ${formatCurrency(budget.spent, currency)}</span>
                <span>Limit: ${formatCurrency(budget.amount_limit, currency)}</span>
              </div>
              <div class="progress mb-2" style="height: 20px;">
                <div class="progress-bar bg-${statusClass}" role="progressbar" 
                     style="width: ${Math.min(percentage, 100)}%">
                  ${percentage.toFixed(1)}%
                </div>
              </div>
              <div class="d-flex justify-content-between">
                <span class="badge bg-${statusClass}">${budget.status}</span>
                <div>
                  <button class="btn btn-sm btn-secondary me-1" onclick="editBudget(${budget.budget_id})">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="deleteBudget(${budget.budget_id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
}

function sortBudgets(sortBy) {
  if (state.budgetSortBy === sortBy) {
    state.budgetSortOrder = state.budgetSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    state.budgetSortBy = sortBy;
    state.budgetSortOrder = 'desc';
  }
  
  // Update sort indicators
  document.querySelectorAll('.budget-sort-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`.budget-sort-btn[data-sort="${sortBy}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.querySelector('i').className = state.budgetSortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }
  
  displayBudgets(state.budgets);
}

function filterBudgets(filter) {
  state.budgetFilter = filter;
  
  // Update filter buttons
  document.querySelectorAll('.budget-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`.budget-filter-btn[data-filter="${filter}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  displayBudgets(state.budgets);
}

async function deleteBudget(budgetId) {
  if (!confirm('Are you sure you want to delete this budget?')) return;

  try {
    const response = await apiRequest(`/budgets/${budgetId}`, { method: 'DELETE' });
    if (response.ok) {
      showToast('Budget deleted successfully');
      loadBudgets();
    }
  } catch (error) {
    showToast('Error deleting budget', 'error');
  }
}

async function editBudget(budgetId) {
  try {
    const response = await apiRequest(`/budgets/${budgetId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      showToast(errorData.error || 'Budget not found', 'error');
      return;
    }
    
    const budget = await response.json();

    // Load categories
    const categoriesResponse = await apiRequest('/categories');
    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.categories || categoriesData;

    // Populate category dropdown
    const categorySelect = document.getElementById('editBudgetCategory');
    categorySelect.innerHTML = categories
      .filter(c => c.type === 'Expense')
      .map(c => `<option value="${c.category_id}" ${c.category_id === budget.category_id ? 'selected' : ''}>${c.category_name}</option>`)
      .join('');

    // Populate other fields
    document.getElementById('editBudgetId').value = budget.budget_id;
    document.getElementById('editBudgetLimit').value = budget.amount_limit;
    document.getElementById('editBudgetStartDate').value = budget.start_date;
    document.getElementById('editBudgetEndDate').value = budget.end_date;

    // Show modal
    new bootstrap.Modal(document.getElementById('editBudgetModal')).show();
  } catch (error) {
    showToast('Error loading budget', 'error');
    console.error('Edit budget error:', error);
  }
}

async function handleEditBudget(e) {
  e.preventDefault();

  const budgetId = document.getElementById('editBudgetId').value;
  const amountLimit = parseFloat(document.getElementById('editBudgetLimit').value);
  
  if (isNaN(amountLimit) || amountLimit <= 0) {
    showToast('Please enter a valid budget amount', 'error');
    return;
  }

  const startDate = document.getElementById('editBudgetStartDate').value;
  const endDate = document.getElementById('editBudgetEndDate').value;
  
  if (new Date(endDate) <= new Date(startDate)) {
    showToast('End date must be after start date', 'error');
    return;
  }

  const data = {
    category_id: parseInt(document.getElementById('editBudgetCategory').value),
    amount_limit: amountLimit,
    start_date: startDate,
    end_date: endDate
  };

  try {
    const response = await apiRequest(`/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Budget updated successfully');
      bootstrap.Modal.getInstance(document.getElementById('editBudgetModal')).hide();
      loadBudgets();
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed to update budget', 'error');
    }
  } catch (error) {
    showToast('Error updating budget', 'error');
  }
}

async function fetchExchangeRate() {
  const currencyCode = document.getElementById('txnCurrencyCode').value;
  const baseCurrency = state.user.base_currency || 'VND';
  
  if (!currencyCode) {
    showToast('Please select a currency first', 'error');
    return;
  }

  try {
    const apiKey = '5d716195b0e393f93ac3bfe6';
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currencyCode}`);
    const data = await response.json();

    if (data.result === 'success') {
      const rate = data.conversion_rates[baseCurrency];
      if (rate) {
        document.getElementById('txnExchangeRate').value = rate.toFixed(4);
        showToast(`Exchange rate updated: 1 ${currencyCode} = ${rate.toFixed(4)} ${baseCurrency}`, 'success');
      } else {
        showToast(`Exchange rate for ${baseCurrency} not available`, 'error');
      }
    } else {
      showToast('Failed to fetch exchange rate', 'error');
    }
  } catch (error) {
    showToast('Error fetching exchange rate', 'error');
    console.error('Exchange rate error:', error);
  }
}

async function loadGroupsForTransaction() {
  try {
    const response = await apiRequest('/groups');
    const groups = await response.json();

    const select = document.getElementById('txnGroup');
    if (groups && groups.length > 0) {
      select.innerHTML = '<option value="">Personal Expense</option>' + 
        groups.map(g => `<option value="${g.group_id}">${g.group_name}</option>`).join('');
    }
  } catch (error) {
    console.error('Error loading groups:', error);
  }
}

// ============================================
// GROUPS FUNCTIONS
// ============================================
async function loadGroups() {
  try {
    const response = await apiRequest('/groups');
    const groups = await response.json();

    const container = document.getElementById('groupsContainer');
    if (!groups || groups.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted py-5">
          <i class="bi bi-people" style="font-size: 3rem;"></i>
          <p>No groups yet. Create a group to track shared expenses!</p>
        </div>
      `;
      return;
    }

    const currency = state.user.base_currency === 'VND' ? '₫' : '$';
    container.innerHTML = groups.map(group => `
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h6 class="card-title mb-0">${group.group_name}</h6>
              ${group.is_creator ? '<span class="badge bg-primary">Owner</span>' : ''}
            </div>
            <p class="mb-2">
              <i class="bi bi-people"></i> ${group.member_count} members
            </p>
            <p class="mb-2">
              <i class="bi bi-cash"></i> Total spent: ${formatCurrency(group.total_spent, currency)}
            </p>
            <p class="mb-3 small text-muted">
              Created: ${new Date(group.created_at).toLocaleDateString()}
            </p>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-sm btn-info" onclick="viewGroupDetails(${group.group_id})">
                <i class="bi bi-eye"></i> View Details
              </button>
              ${group.is_creator ? `
                <button class="btn btn-sm btn-primary" onclick="showAddMemberModal(${group.group_id})">
                  <i class="bi bi-person-plus"></i> Add Member
                </button>
              ` : ''}
              <button class="btn btn-sm btn-outline-danger" onclick="leaveGroup(${group.group_id})">
                <i class="bi bi-box-arrow-right"></i> Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showToast('Error loading groups', 'error');
    console.error('Groups error:', error);
  }
}

function showAddMemberModal(groupId) {
  document.getElementById('memberGroupId').value = groupId;
  new bootstrap.Modal(document.getElementById('addMemberModal')).show();
}

async function leaveGroup(groupId) {
  if (!confirm('Are you sure you want to leave this group?')) return;

  try {
    const response = await apiRequest(`/groups/${groupId}/members/${state.user.user_id}`, { method: 'DELETE' });
    if (response.ok) {
      showToast('Left group successfully');
      loadGroups();
    }
  } catch (error) {
    showToast('Error leaving group', 'error');
  }
}

async function viewGroupDetails(groupId) {
  try {
    // Get group details
    const groupResponse = await apiRequest(`/groups/${groupId}`);
    const group = await groupResponse.json();
    
    // Get group transactions
    const txnResponse = await apiRequest(`/transactions?group_id=${groupId}`);
    const txnData = await txnResponse.json();
    const transactions = txnData.transactions || [];

    const currency = state.user.base_currency === 'VND' ? '₫' : '$';
    
    // Build modal content
    const membersHtml = group.members.map(m => `
      <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
        <div>
          <strong>${m.username}</strong>
          <small class="text-muted d-block">${m.email}</small>
        </div>
        ${m.is_creator ? '<span class="badge bg-primary">Owner</span>' : ''}
      </div>
    `).join('');

    const transactionsHtml = transactions.length > 0 ? transactions.map(txn => `
      <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
        <div>
          <strong>${txn.description || 'Transaction'}</strong>
          <small class="text-muted d-block">${new Date(txn.transaction_date).toLocaleDateString()} - ${txn.category_name}</small>
        </div>
        <span class="badge bg-${txn.category_type === 'Income' ? 'success' : 'danger'}">
          ${txn.category_type === 'Income' ? '+' : '-'}${formatCurrency(txn.amount, currency)}
        </span>
      </div>
    `).join('') : '<p class="text-muted text-center py-3">No transactions yet</p>';

    // Calculate split amount per person
    const memberCount = group.members.length;
    const splitAmount = memberCount > 0 ? group.total_spent / memberCount : 0;

    // Update modal content
    document.getElementById('groupDetailsName').textContent = group.group_name;
    document.getElementById('groupMembersList').innerHTML = membersHtml;
    document.getElementById('groupTransactionsList').innerHTML = transactionsHtml;
    document.getElementById('groupTotalSpent').textContent = formatCurrency(group.total_spent, currency);
    document.getElementById('groupSplitAmount').textContent = formatCurrency(splitAmount, currency);
    document.getElementById('groupMemberCount').textContent = memberCount;

    // Show modal
    new bootstrap.Modal(document.getElementById('groupDetailsModal')).show();
  } catch (error) {
    showToast('Error loading group details', 'error');
    console.error('Group details error:', error);
  }
}

// ============================================
// RECURRING PAYMENTS FUNCTIONS
// ============================================
async function loadRecurringPayments() {
  try {
    const response = await apiRequest('/recurring');
    const payments = await response.json();

    const container = document.getElementById('recurringContainer');
    if (!payments || payments.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted py-5">
          <i class="bi bi-arrow-repeat" style="font-size: 3rem;"></i>
          <p>No recurring payments configured. Add one to automate your expenses!</p>
        </div>
      `;
      return;
    }

    const currency = state.user.base_currency === 'VND' ? '₫' : '$';
    container.innerHTML = payments.map(payment => {
      const statusBadge = payment.is_active ?
        '<span class="badge bg-success">Active</span>' :
        '<span class="badge bg-secondary">Inactive</span>';
      const dueBadge = payment.is_overdue ?
        '<span class="badge bg-danger">Overdue</span>' :
        payment.is_due_soon ?
          '<span class="badge bg-warning">Due Soon</span>' :
          '';

      return `
        <div class="col-md-6 col-lg-4 mb-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="card-title mb-0">${payment.category_name}</h6>
                ${statusBadge}
              </div>
              <p class="mb-2"><strong>${formatCurrency(payment.amount, currency)}</strong> / ${payment.frequency}</p>
              <p class="mb-2 small"><i class="bi bi-wallet"></i> ${payment.account_name}</p>
              <p class="mb-2 small"><i class="bi bi-calendar-event"></i> Next due: ${payment.next_due_date} ${dueBadge}</p>
              <div class="d-flex gap-2 flex-wrap">
                ${payment.is_active ? `
                  <button class="btn btn-sm btn-success" onclick="executeRecurring(${payment.recurring_id})">
                    <i class="bi bi-check-circle"></i> Execute
                  </button>
                  <button class="btn btn-sm btn-warning" onclick="toggleRecurring(${payment.recurring_id}, false)">
                    <i class="bi bi-pause"></i>
                  </button>
                ` : `
                  <button class="btn btn-sm btn-primary" onclick="toggleRecurring(${payment.recurring_id}, true)">
                    <i class="bi bi-play"></i> Activate
                  </button>
                `}
                <button class="btn btn-sm btn-secondary" onclick="editRecurring(${payment.recurring_id})">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecurring(${payment.recurring_id})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    showToast('Error loading recurring payments', 'error');
    console.error('Recurring error:', error);
  }
}

async function executeRecurring(recurringId) {
  if (!confirm('Execute this recurring payment now?')) return;

  try {
    const response = await apiRequest(`/recurring/${recurringId}/execute`, { method: 'POST' });
    if (response.ok) {
      showToast('Payment executed successfully');
      loadRecurringPayments();
      loadDashboard(); // Refresh dashboard
    }
  } catch (error) {
    showToast('Error executing payment', 'error');
  }
}

async function toggleRecurring(recurringId, isActive) {
  try {
    const response = await apiRequest(`/recurring/${recurringId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive })
    });
    if (response.ok) {
      showToast(`Recurring payment ${isActive ? 'activated' : 'paused'}`);
      loadRecurringPayments();
    }
  } catch (error) {
    showToast('Error updating payment', 'error');
  }
}

async function deleteRecurring(recurringId) {
  if (!confirm('Delete this recurring payment?')) return;

  try {
    const response = await apiRequest(`/recurring/${recurringId}`, { method: 'DELETE' });
    if (response.ok) {
      showToast('Recurring payment deleted');
      loadRecurringPayments();
    }
  } catch (error) {
    showToast('Error deleting payment', 'error');
  }
}

async function editRecurring(recurringId) {
  try {
    const response = await apiRequest(`/recurring/${recurringId}`);
    const payment = await response.json();

    // Load accounts and categories first
    const accountsResponse = await apiRequest('/accounts');
    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || accountsData;
    
    const categoriesResponse = await apiRequest('/categories');
    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.categories || categoriesData;

    // Populate account dropdown
    const accountSelect = document.getElementById('editRecurringAccount');
    accountSelect.innerHTML = accounts
      .map(a => `<option value="${a.account_id}" ${a.account_id === payment.account_id ? 'selected' : ''}>${a.account_name} (${a.account_type})</option>`)
      .join('');

    // Populate category dropdown
    const categorySelect = document.getElementById('editRecurringCategory');
    categorySelect.innerHTML = categories
      .filter(c => c.type === 'Expense')
      .map(c => `<option value="${c.category_id}" ${c.category_id === payment.category_id ? 'selected' : ''}>${c.category_name}</option>`)
      .join('');

    // Populate other fields
    document.getElementById('editRecurringId').value = payment.recurring_id;
    document.getElementById('editRecurringAmount').value = payment.amount;
    document.getElementById('editRecurringFrequency').value = payment.frequency;
    document.getElementById('editRecurringStartDate').value = payment.start_date;

    // Show modal
    new bootstrap.Modal(document.getElementById('editRecurringModal')).show();
  } catch (error) {
    showToast('Error loading recurring payment', 'error');
    console.error('Edit recurring error:', error);
  }
}

async function handleEditRecurring(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('editRecurringAmount').value);
  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }

  const recurringId = document.getElementById('editRecurringId').value;
  const data = {
    account_id: parseInt(document.getElementById('editRecurringAccount').value),
    category_id: parseInt(document.getElementById('editRecurringCategory').value),
    amount: amount,
    frequency: document.getElementById('editRecurringFrequency').value,
    start_date: document.getElementById('editRecurringStartDate').value
  };

  try {
    const response = await apiRequest(`/recurring/${recurringId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Recurring payment updated successfully');
      bootstrap.Modal.getInstance(document.getElementById('editRecurringModal')).hide();
      loadRecurringPayments();
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed to update recurring payment', 'error');
    }
  } catch (error) {
    showToast('Error updating recurring payment', 'error');
  }
}

