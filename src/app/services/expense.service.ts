import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Expense, CreateExpenseRequest, Category, ExpenseListResult } from '../models/expense.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Expenses
  getExpenses(pageNumber = 1, pageSize = 10, fromDate?: string, toDate?: string): Observable<ExpenseListResult> {
    let url = `${this.apiUrl}/expenses?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    return this.http.get<ExpenseListResult>(url);
  }

  getExpense(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/expenses/${id}`);
  }

  createExpense(expense: CreateExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense);
  }

  updateExpense(id: string, expense: CreateExpenseRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/expenses/${id}`, expense);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }
}
