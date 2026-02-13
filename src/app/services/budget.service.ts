import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Budget } from '../models/expense.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getBudget(): Observable<Budget | null> {
    return this.http.get<Budget>(`${this.apiUrl}/budget`, { observe: 'response' }).pipe(
      map(response => response.status === 204 ? null : response.body)
    );
  }

  setBudget(amount: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/budget`, { amount });
  }

  deleteBudget(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/budget`);
  }
}
