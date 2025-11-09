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
  selectedCategoryId: number | null = null;
  newTransaction = {
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  };

  constructor(private apiService: ApiService) {}

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
    this.newTransaction = {
      amount: 0,
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    };
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
}
