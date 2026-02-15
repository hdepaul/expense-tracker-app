import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, ChatResponse } from '../models/expense.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;

  chat(message: string, history: ChatMessage[]): Observable<ChatResponse> {
    const timezoneOffset = new Date().getTimezoneOffset();
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, { message, history, timezoneOffset });
  }
}
