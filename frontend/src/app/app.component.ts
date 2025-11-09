import { Component, OnInit } from '@angular/core';
import { ApiService, Month, MonthSummary, BudgetCategory, Transaction } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'budgeting-app';

  // Available months list
  months: Month[] = [];

  // Currently selected month
  currentMonth: Month | null = null;
  currentMonthSummary: MonthSummary | null = null;

  // Loading state
  loading = false;
  error: string | null = null;

  // Form states
  showAddTransactionModal = false;
  showAddPaymentModal = false;
  showAddCategoryModal = false;
  showEditPaymentModal = false;
  showEditCategoryModal = false;
  showAddMonthModal = false;
  showEditIncomeModal = false;
  selectedCategoryId: number | null = null;
  editingPaymentId: number | null = null;
  editingCategoryId: number | null = null;

  newTransaction = {
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  };

  newPayment = {
    name: '',
    amount: 0
  };

  newCategory = {
    name: '',
    allocated_amount: 0
  };

  editPayment = {
    name: '',
    amount: 0
  };

  editCategory = {
    name: '',
    allocated_amount: 0
  };

  newMonth = {
    month_name: '',
    year: new Date().getFullYear(),
    income: 0,
    copyFromMonthId: null as number | null
  };

  editIncome = {
    income: 0
  };

  // Track expanded categories
  expandedCategories: Set<number> = new Set();

  // Dark mode
  darkMode = false;

  constructor(private apiService: ApiService) {
    // Load dark mode preference
    const savedTheme = localStorage.getItem('theme');
    this.darkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  ngOnInit() {
    this.loadMonths();
  }

  // Load all available months
  loadMonths() {
    this.loading = true;
    this.error = null;

    this.apiService.getMonths().subscribe({
      next: (months) => {
        this.months = months;
        this.loading = false;

        // If no months exist, we'll show empty state
        // If months exist, load the first one
        if (months.length > 0) {
          this.selectMonth(months[0].id);
        }
      },
      error: (err) => {
        this.error = 'Failed to load months: ' + err.message;
        this.loading = false;
        console.error('Error loading months:', err);
      }
    });
  }

  // Select and load a specific month
  selectMonth(monthId: number) {
    this.loading = true;
    this.error = null;

    // Load full month data
    this.apiService.getMonth(monthId).subscribe({
      next: (month) => {
        this.currentMonth = month;
        this.loading = false;

        // Load summary calculations
        this.loadMonthSummary(monthId);
      },
      error: (err) => {
        this.error = 'Failed to load month: ' + err.message;
        this.loading = false;
        console.error('Error loading month:', err);
      }
    });
  }

  // Load month summary with calculations
  loadMonthSummary(monthId: number) {
    this.apiService.getMonthSummary(monthId).subscribe({
      next: (summary) => {
        this.currentMonthSummary = summary;
      },
      error: (err) => {
        console.error('Error loading summary:', err);
      }
    });
  }

  // Get transactions for a specific category
  getCategoryTransactions(categoryId: number): Transaction[] {
    const category = this.currentMonth?.categories?.find(c => c.id === categoryId);
    return category?.transactions || [];
  }

  // Get category spending from summary
  getCategorySpending(categoryId: number) {
    return this.currentMonthSummary?.categorySpending.find(cs => cs.categoryId === categoryId);
  }

  // Calculate subtotals
  get paymentSubTotal(): number {
    if (!this.currentMonthSummary) return 0;
    return this.currentMonthSummary.afterFixedPayments;
  }

  get budgetSubTotal(): number {
    if (!this.currentMonthSummary) return 0;
    return this.currentMonthSummary.budgetAllocationsTotal;
  }

  get extraMoney(): number {
    if (!this.currentMonthSummary) return 0;
    return this.currentMonthSummary.afterBudgetAllocations;
  }

  get totalMoneyLeft(): number {
    if (!this.currentMonthSummary) return 0;
    return this.currentMonthSummary.totalMoneyLeft;
  }

  // Get total spending for a category
  getCategoryTotal(categoryId: number): number {
    const spending = this.getCategorySpending(categoryId);
    return spending?.spent || 0;
  }

  // Open add transaction modal
  openAddTransactionModal(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.showAddTransactionModal = true;
    // Default to first day of current month
    const defaultDate = this.getDefaultTransactionDate();
    this.newTransaction = {
      amount: 0,
      description: '',
      transaction_date: defaultDate
    };
  }

  // Get default transaction date (first day of current month)
  getDefaultTransactionDate(): string {
    if (!this.currentMonth) return new Date().toISOString().split('T')[0];

    const monthIndex = this.getMonthIndex(this.currentMonth.month_name);
    const date = new Date(this.currentMonth.year, monthIndex, 1);
    return date.toISOString().split('T')[0];
  }

  // Get min date for transaction (first day of month)
  getMinTransactionDate(): string {
    if (!this.currentMonth) return '';
    const monthIndex = this.getMonthIndex(this.currentMonth.month_name);
    const date = new Date(this.currentMonth.year, monthIndex, 1);
    return date.toISOString().split('T')[0];
  }

  // Get max date for transaction (last day of month)
  getMaxTransactionDate(): string {
    if (!this.currentMonth) return '';
    const monthIndex = this.getMonthIndex(this.currentMonth.month_name);
    // Get first day of next month, then subtract one day
    const date = new Date(this.currentMonth.year, monthIndex + 1, 0);
    return date.toISOString().split('T')[0];
  }

  // Helper to get month index (0-11)
  getMonthIndex(monthName: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  }

  // Close modal
  closeAddTransactionModal() {
    this.showAddTransactionModal = false;
    this.selectedCategoryId = null;
  }

  // Add a new transaction
  addTransaction() {
    if (!this.selectedCategoryId || !this.currentMonth) return;

    this.apiService.createTransaction(this.selectedCategoryId, this.newTransaction).subscribe({
      next: (transaction) => {
        console.log('Transaction added:', transaction);
        // Reload current month to refresh data
        this.selectMonth(this.currentMonth!.id);
        this.closeAddTransactionModal();
      },
      error: (err) => {
        this.error = 'Failed to add transaction: ' + err.message;
        console.error('Error adding transaction:', err);
      }
    });
  }

  // Delete a transaction
  deleteTransaction(transactionId: number) {
    if (!this.currentMonth) return;

    if (confirm('Are you sure you want to delete this transaction?')) {
      this.apiService.deleteTransaction(transactionId).subscribe({
        next: () => {
          console.log('Transaction deleted');
          // Reload current month to refresh data
          this.selectMonth(this.currentMonth!.id);
        },
        error: (err) => {
          this.error = 'Failed to delete transaction: ' + err.message;
          console.error('Error deleting transaction:', err);
        }
      });
    }
  }

  // Helper method to format currency (South African Rand)
  formatCurrency(amount: number): string {
    return 'R ' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  // Fixed Payment methods
  openAddPaymentModal() {
    this.showAddPaymentModal = true;
    this.newPayment = { name: '', amount: 0 };
  }

  closeAddPaymentModal() {
    this.showAddPaymentModal = false;
  }

  addFixedPayment() {
    if (!this.currentMonth || !this.newPayment.name || this.newPayment.amount <= 0) return;

    this.apiService.createFixedPayment(this.currentMonth.id, this.newPayment).subscribe({
      next: () => {
        console.log('Fixed payment added');
        this.selectMonth(this.currentMonth!.id);
        this.closeAddPaymentModal();
      },
      error: (err) => {
        this.error = 'Failed to add fixed payment: ' + err.message;
        console.error('Error adding fixed payment:', err);
      }
    });
  }

  deleteFixedPayment(paymentId: number) {
    if (!this.currentMonth) return;

    if (confirm('Are you sure you want to delete this payment?')) {
      this.apiService.deleteFixedPayment(paymentId).subscribe({
        next: () => {
          console.log('Fixed payment deleted');
          this.selectMonth(this.currentMonth!.id);
        },
        error: (err) => {
          this.error = 'Failed to delete payment: ' + err.message;
          console.error('Error deleting payment:', err);
        }
      });
    }
  }

  // Budget Category methods
  openAddCategoryModal() {
    this.showAddCategoryModal = true;
    this.newCategory = { name: '', allocated_amount: 0 };
  }

  closeAddCategoryModal() {
    this.showAddCategoryModal = false;
  }

  addBudgetCategory() {
    if (!this.currentMonth || !this.newCategory.name || this.newCategory.allocated_amount <= 0) return;

    this.apiService.createCategory(this.currentMonth.id, this.newCategory).subscribe({
      next: () => {
        console.log('Budget category added');
        this.selectMonth(this.currentMonth!.id);
        this.closeAddCategoryModal();
      },
      error: (err) => {
        this.error = 'Failed to add budget category: ' + err.message;
        console.error('Error adding category:', err);
      }
    });
  }

  deleteCategory(categoryId: number) {
    if (!this.currentMonth) return;

    if (confirm('Are you sure you want to delete this category? All transactions will also be deleted.')) {
      this.apiService.deleteCategory(categoryId).subscribe({
        next: () => {
          console.log('Category deleted');
          this.selectMonth(this.currentMonth!.id);
        },
        error: (err) => {
          this.error = 'Failed to delete category: ' + err.message;
          console.error('Error deleting category:', err);
        }
      });
    }
  }

  // Toggle category expansion
  toggleCategory(categoryId: number) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  // Dark mode methods
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme() {
    if (this.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // Edit Payment methods
  openEditPaymentModal(payment: any) {
    this.editingPaymentId = payment.id;
    this.editPayment = {
      name: payment.name,
      amount: payment.amount
    };
    this.showEditPaymentModal = true;
  }

  closeEditPaymentModal() {
    this.showEditPaymentModal = false;
    this.editingPaymentId = null;
  }

  updateFixedPayment() {
    if (!this.editingPaymentId || !this.currentMonth) return;

    this.apiService.updateFixedPayment(this.editingPaymentId, this.editPayment).subscribe({
      next: () => {
        console.log('Fixed payment updated');
        this.selectMonth(this.currentMonth!.id);
        this.closeEditPaymentModal();
      },
      error: (err) => {
        this.error = 'Failed to update fixed payment: ' + err.message;
        console.error('Error updating fixed payment:', err);
      }
    });
  }

  // Edit Category methods
  openEditCategoryModal(category: any) {
    this.editingCategoryId = category.id;
    this.editCategory = {
      name: category.name,
      allocated_amount: category.allocated_amount
    };
    this.showEditCategoryModal = true;
  }

  closeEditCategoryModal() {
    this.showEditCategoryModal = false;
    this.editingCategoryId = null;
  }

  updateBudgetCategory() {
    if (!this.editingCategoryId || !this.currentMonth) return;

    this.apiService.updateCategory(this.editingCategoryId, this.editCategory).subscribe({
      next: () => {
        console.log('Budget category updated');
        this.selectMonth(this.currentMonth!.id);
        this.closeEditCategoryModal();
      },
      error: (err) => {
        this.error = 'Failed to update budget category: ' + err.message;
        console.error('Error updating category:', err);
      }
    });
  }

  // Month management methods
  openAddMonthModal() {
    this.showAddMonthModal = true;
    const nextMonth = this.getNextMonth();
    this.newMonth = {
      month_name: nextMonth.monthName,
      year: nextMonth.year,
      income: this.currentMonth?.income || 0,
      copyFromMonthId: this.currentMonth?.id || null
    };
  }

  // Get next month details
  getNextMonth(): { monthName: string; year: number } {
    if (!this.currentMonth) {
      const now = new Date();
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      return { monthName: months[now.getMonth()], year: now.getFullYear() };
    }

    const monthIndex = this.getMonthIndex(this.currentMonth.month_name);
    if (monthIndex === 11) { // December
      return { monthName: 'January', year: this.currentMonth.year + 1 };
    } else {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      return { monthName: months[monthIndex + 1], year: this.currentMonth.year };
    }
  }

  // Check if month selection should be disabled
  isMonthDisabled(monthName: string): boolean {
    const nextMonth = this.getNextMonth();
    return monthName !== nextMonth.monthName;
  }

  closeAddMonthModal() {
    this.showAddMonthModal = false;
  }

  addMonth() {
    if (!this.newMonth.month_name || !this.newMonth.year) return;

    const monthData: any = {
      month_name: this.newMonth.month_name,
      year: this.newMonth.year,
      income: this.newMonth.income
    };

    if (this.newMonth.copyFromMonthId) {
      monthData.copyFromMonthId = this.newMonth.copyFromMonthId;
    }

    this.apiService.createMonth(monthData).subscribe({
      next: (month) => {
        console.log('Month created:', month);
        this.loadMonths();
        this.selectMonth(month.id);
        this.closeAddMonthModal();
      },
      error: (err) => {
        this.error = 'Failed to create month: ' + err.message;
        console.error('Error creating month:', err);
      }
    });
  }

  // Income edit methods
  openEditIncomeModal() {
    if (!this.currentMonth) return;
    this.editIncome.income = this.currentMonth.income;
    this.showEditIncomeModal = true;
  }

  closeEditIncomeModal() {
    this.showEditIncomeModal = false;
  }

  updateIncome() {
    if (!this.currentMonth) return;

    this.apiService.updateMonth(this.currentMonth.id, { income: this.editIncome.income }).subscribe({
      next: () => {
        console.log('Income updated');
        this.selectMonth(this.currentMonth!.id);
        this.closeEditIncomeModal();
      },
      error: (err) => {
        this.error = 'Failed to update income: ' + err.message;
        console.error('Error updating income:', err);
      }
    });
  }
}
