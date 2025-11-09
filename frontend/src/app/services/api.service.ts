import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Month {
  id: number;
  month_name: string;
  year: number;
  income: number;
  created_at: string;
  fixedPayments?: FixedPayment[];
  categories?: BudgetCategory[];
}

export interface FixedPayment {
  id: number;
  month_id: number;
  name: string;
  amount: number;
  order_index: number;
  created_at: string;
}

export interface BudgetCategory {
  id: number;
  month_id: number;
  name: string;
  allocated_amount: number;
  order_index: number;
  created_at: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: number;
  category_id: number;
  amount: number;
  description?: string;
  transaction_date: string;
  created_at: string;
}

export interface MonthSummary {
  monthId: string;
  monthName: string;
  year: number;
  income: number;
  fixedPaymentsTotal: number;
  afterFixedPayments: number;
  budgetAllocationsTotal: number;
  afterBudgetAllocations: number;
  totalActualSpending: number;
  totalMoneyLeft: number;
  categorySpending: CategorySpending[];
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
  overBudget: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Month endpoints
  getMonths(): Observable<Month[]> {
    return this.http.get<Month[]>(`${this.apiUrl}/months`);
  }

  getMonth(id: number): Observable<Month> {
    return this.http.get<Month>(`${this.apiUrl}/months/${id}`);
  }

  createMonth(data: { month_name: string; year: number; income: number; copyFromMonthId?: number }): Observable<Month> {
    return this.http.post<Month>(`${this.apiUrl}/months`, data);
  }

  updateMonth(id: number, data: { income: number }): Observable<Month> {
    return this.http.put<Month>(`${this.apiUrl}/months/${id}`, data);
  }

  deleteMonth(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/months/${id}`);
  }

  getMonthSummary(id: number): Observable<MonthSummary> {
    return this.http.get<MonthSummary>(`${this.apiUrl}/months/${id}/summary`);
  }

  // Fixed Payment endpoints
  createFixedPayment(monthId: number, data: { name: string; amount: number }): Observable<FixedPayment> {
    return this.http.post<FixedPayment>(`${this.apiUrl}/months/${monthId}/fixed-payments`, data);
  }

  updateFixedPayment(id: number, data: { name?: string; amount?: number }): Observable<FixedPayment> {
    return this.http.put<FixedPayment>(`${this.apiUrl}/fixed-payments/${id}`, data);
  }

  deleteFixedPayment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fixed-payments/${id}`);
  }

  // Budget Category endpoints
  createCategory(monthId: number, data: { name: string; allocated_amount: number }): Observable<BudgetCategory> {
    return this.http.post<BudgetCategory>(`${this.apiUrl}/months/${monthId}/categories`, data);
  }

  updateCategory(id: number, data: { name?: string; allocated_amount?: number }): Observable<BudgetCategory> {
    return this.http.put<BudgetCategory>(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  getCategoryTransactions(categoryId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/categories/${categoryId}/transactions`);
  }

  // Transaction endpoints
  createTransaction(categoryId: number, data: { amount: number; description?: string; transaction_date?: string }): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/categories/${categoryId}/transactions`, data);
  }

  updateTransaction(id: number, data: { amount?: number; description?: string; transaction_date?: string }): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, data);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transactions/${id}`);
  }
}
