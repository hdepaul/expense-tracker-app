import { Component, inject, signal, OnInit, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../services/expense.service';
import { AIService } from '../../services/ai.service';
import { Expense, CategorySummary, ChatMessage } from '../../models/expense.model';
import { ConfirmModalComponent } from '../../components/confirm-modal.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, FormsModule, TranslateModule, ConfirmModalComponent],
  template: `
    <div class="expenses-container">

      <!-- AI Mini-Chat -->
      <div class="ai-chat">
        @if (chatMessages().length > 0) {
          <div class="chat-messages" #chatMessagesContainer>
            @for (msg of chatMessages(); track $index) {
              <div class="chat-bubble" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
                {{ msg.content }}
              </div>
            }
            @if (aiLoading()) {
              <div class="chat-bubble assistant loading-bubble">
                <span class="dot-typing"></span>
              </div>
            }
          </div>
          <button class="btn-clear-chat" (click)="clearChat()" [title]="'ai.clear' | translate">&#10005;</button>
        } @else {
          <div class="chat-welcome">
            <div class="welcome-icon">&#128172;</div>
            <p class="welcome-text">{{ 'ai.welcomeMessage' | translate }}</p>
            <div class="chat-chips">
              @for (chip of exampleChips; track chip) {
                <button class="chip" (click)="sendChip(chip)">{{ chip }}</button>
              }
            </div>
          </div>
        }
        <div class="chat-input-bar">
          <input
            type="text"
            [(ngModel)]="chatInput"
            (keydown.enter)="sendMessage()"
            [placeholder]="isRecording() ? ('ai.listening' | translate) : ('ai.placeholder' | translate)"
            [disabled]="aiLoading() || isRecording()"
            class="chat-input"
            [class.recording]="isRecording()"
          />
          @if (speechSupported) {
            <button
              (click)="toggleVoice()"
              [disabled]="aiLoading()"
              class="btn-mic"
              [class.recording]="isRecording()"
              [title]="isRecording() ? ('ai.stopListening' | translate) : ('ai.voice' | translate)">
              @if (isRecording()) {
                <span class="mic-pulse"></span>
              }
              <span class="mic-icon">&#127908;</span>
            </button>
          }
          <button
            (click)="sendMessage()"
            [disabled]="aiLoading() || !chatInput.trim()"
            class="btn-send">
            @if (aiLoading()) {
              {{ 'ai.processing' | translate }}
            } @else {
              {{ 'ai.send' | translate }}
            }
          </button>
        </div>
      </div>

      <div class="header">
        <h2>{{ 'expenses.title' | translate }}</h2>
        <div class="month-nav">
          <button class="btn-month-arrow" (click)="prevMonth()" [title]="'expenses.previous' | translate">&#8249;</button>
          <button class="btn-month-label" (click)="toggleAllTime()">
            {{ currentMonthLabel() }}
          </button>
          <button class="btn-month-arrow" (click)="nextMonth()" [disabled]="!canGoNextMonth()" [title]="'expenses.next' | translate">&#8250;</button>
        </div>
      </div>

      @if (loading()) {
        <p>{{ 'expenses.loading' | translate }}</p>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      @if (!loading() && expenses().length === 0) {
        <p class="empty">{{ 'expenses.noExpenses' | translate }}</p>
      }

      <div class="expense-list">
        @for (expense of expenses(); track expense.id) {
          <div class="expense-card">
            <div class="expense-info">
              <h3>{{ expense.description }}</h3>
              <p class="date">{{ expense.date | date:'mediumDate' }}</p>
              @if (expense.notes) {
                <p class="notes">{{ expense.notes }}</p>
              }
            </div>
            <div class="expense-amount">
              {{ expense.amount | currency:'USD' }}
            </div>
            <div class="expense-actions">
              <a [routerLink]="['/expenses', expense.id, 'edit']" [queryParams]="{page: currentPage()}" class="btn-icon" [title]="'expenses.edit_btn' | translate">&#9999;&#65039;</a>
              <button (click)="delete(expense)" class="btn-icon btn-icon-delete" [title]="'expenses.delete' | translate">&#128465;&#65039;</button>
            </div>
          </div>
        }
      </div>

      @if (!loading() && totalCount() > 0) {
        <div class="pagination">
          @if (totalPages() > 1) {
            <button
              (click)="previousPage()"
              [disabled]="!hasPreviousPage()"
              class="btn-page">
              {{ 'expenses.previous' | translate }}
            </button>
          }
          <span class="page-info">
            @if (totalPages() > 1) {
              {{ 'expenses.page' | translate }} {{ currentPage() }} {{ 'expenses.of' | translate }} {{ totalPages() }} ({{ totalCount() }} {{ 'expenses.items' | translate }})
            } @else {
              {{ totalCount() }} {{ 'expenses.items' | translate }}
            }
          </span>
          @if (totalPages() > 1) {
            <button
              (click)="nextPage()"
              [disabled]="!hasNextPage()"
              class="btn-page">
              {{ 'expenses.next' | translate }}
            </button>
          }
        </div>
      }

      @if (showDeleteModal()) {
        <app-confirm-modal
          [title]="'deleteModal.title' | translate"
          [message]="deleteMessage()"
          [confirmText]="'deleteModal.confirm' | translate"
          [cancelText]="'deleteModal.cancel' | translate"
          (confirmed)="confirmDelete()"
          (cancelled)="cancelDelete()"
        />
      }
    </div>
  `,
  styles: [`
    .expenses-container {
      max-width: 800px;
      margin: 30px auto;
      padding: 20px;
    }

    /* AI Chat */
    .ai-chat {
      background: var(--bg-card-alt);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      position: relative;
    }
    .chat-messages {
      max-height: 350px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
      padding-right: 24px;
    }
    .chat-bubble {
      padding: 10px 14px;
      border-radius: 16px;
      max-width: 80%;
      word-wrap: break-word;
      font-size: 0.95em;
      line-height: 1.4;
    }
    .chat-bubble.user {
      align-self: flex-end;
      background: var(--accent);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .chat-bubble.assistant {
      align-self: flex-start;
      background: var(--bg-card);
      color: var(--text-primary);
      white-space: pre-wrap;
      border: 1px solid var(--border-color);
      border-bottom-left-radius: 4px;
    }
    .loading-bubble {
      padding: 14px 20px;
    }
    .dot-typing {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
      animation: dotTyping 1.4s infinite;
      position: relative;
    }
    .dot-typing::before,
    .dot-typing::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: 0;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
    }
    .dot-typing::before {
      left: -10px;
      animation: dotTyping 1.4s infinite 0.2s;
    }
    .dot-typing::after {
      left: 10px;
      animation: dotTyping 1.4s infinite 0.4s;
    }
    @keyframes dotTyping {
      0%, 80%, 100% { opacity: 0.3; }
      40% { opacity: 1; }
    }
    .btn-clear-chat {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 1.1em;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 50%;
    }
    .btn-clear-chat:hover {
      background: var(--btn-icon-hover);
      color: var(--text-primary);
    }
    .chat-welcome {
      text-align: center;
      padding: 16px 0 20px;
    }
    .welcome-icon {
      font-size: 2.5em;
      margin-bottom: 8px;
    }
    .welcome-text {
      color: var(--text-secondary);
      font-size: 1em;
      margin-bottom: 16px;
      line-height: 1.4;
    }
    .chat-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }
    .chip {
      background: var(--chip-bg);
      color: var(--chip-text);
      border: 1px solid var(--chip-border);
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 0.88em;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .chip:hover {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    .chat-input-bar {
      display: flex;
      gap: 8px;
      padding-top: 4px;
    }
    .chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: 24px;
      font-size: 0.95em;
      outline: none;
      transition: border-color 0.2s;
      background: var(--input-bg);
      color: var(--text-primary);
    }
    .chat-input:focus {
      border-color: var(--accent);
    }
    .chat-input:disabled {
      background: var(--input-disabled-bg);
    }
    .btn-mic {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: 2px solid var(--accent);
      background: var(--bg-card);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      transition: all 0.2s;
    }
    .mic-icon {
      font-size: 1.5em;
      line-height: 1;
    }
    .btn-mic:hover {
      background: var(--accent-bg);
    }
    .btn-mic.recording {
      background: var(--danger);
      border-color: var(--danger);
    }
    .btn-mic:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .mic-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid var(--danger);
      animation: micPulse 1.2s infinite;
    }
    @keyframes micPulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    .chat-input.recording {
      border-color: var(--danger);
      background: var(--comparison-up-bg);
    }
    .btn-send {
      padding: 10px 20px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      font-size: 0.9em;
      white-space: nowrap;
    }
    .btn-send:disabled {
      background: var(--border-color);
      cursor: not-allowed;
    }
    .btn-send:not(:disabled):hover {
      background: var(--accent-hover);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header h2 {
      color: var(--text-heading);
    }
    .month-nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-month-arrow {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      font-size: 1.3em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-primary);
      transition: all 0.2s;
    }
    .btn-month-arrow:hover:not(:disabled) {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    .btn-month-arrow:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .btn-month-label {
      padding: 8px 16px;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      background: var(--bg-card);
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      color: var(--text-primary);
      min-width: 140px;
      text-align: center;
      transition: all 0.2s;
    }
    .btn-month-label:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .expense-card {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-card);
      transition: background 0.3s, border-color 0.3s;
    }
    .expense-info {
      flex: 1;
    }
    .expense-info h3 {
      margin: 0 0 5px 0;
      color: var(--text-heading);
    }
    .date {
      color: var(--text-secondary);
      font-size: 0.9em;
      margin: 0;
    }
    .notes {
      color: var(--text-muted);
      font-size: 0.85em;
      margin: 5px 0 0 0;
    }
    .expense-amount {
      font-size: 1.3em;
      font-weight: bold;
      color: var(--danger);
      margin-right: 20px;
    }
    .expense-actions {
      display: flex;
      gap: 6px;
    }
    .btn-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      background: var(--btn-icon-bg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1em;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-icon:hover {
      background: var(--btn-icon-hover);
    }
    .btn-icon-delete:hover {
      background: var(--comparison-up-bg);
    }
    .error {
      color: var(--error-text);
      background: var(--error-bg);
      padding: 10px;
      border-radius: 4px;
    }
    .empty {
      text-align: center;
      color: var(--text-secondary);
      padding: 40px;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-top: 20px;
      padding: 15px;
      background: var(--bg-card-alt);
      border-radius: 8px;
    }
    .btn-page {
      padding: 8px 16px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-page:disabled {
      background: var(--border-color);
      cursor: not-allowed;
    }
    .btn-page:not(:disabled):hover {
      background: var(--accent-hover);
    }
    .page-info {
      color: var(--text-secondary);
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .expenses-container {
        margin: 15px auto;
        padding: 10px;
      }
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      .header h2 {
        margin: 0;
        text-align: center;
      }
      .month-nav {
        justify-content: center;
      }
      .expense-card {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
      }
      .expense-info {
        flex: 1;
        min-width: 0;
      }
      .expense-info h3 {
        font-size: 0.95em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .expense-amount {
        margin-right: 0;
        font-size: 1.1em;
      }
      .expense-actions {
        gap: 8px;
      }
      .pagination {
        flex-direction: column;
        gap: 10px;
      }
      .page-info {
        order: -1;
        font-size: 0.9em;
      }
      .btn-page {
        width: 100%;
      }
      .ai-chat {
        padding: 14px;
      }
      .chat-bubble {
        max-width: 90%;
      }
      .chat-input-bar {
        gap: 6px;
      }
      .chat-input {
        min-width: 0;
        padding: 10px 12px;
        font-size: 16px;
      }
      .btn-mic {
        width: 44px;
        height: 44px;
      }
      .btn-send {
        padding: 10px 14px;
      }
    }
  `]
})
export class ExpenseListComponent implements OnInit, AfterViewChecked {
  Math = Math;
  private expenseService = inject(ExpenseService);
  private aiService = inject(AIService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  @ViewChild('chatMessagesContainer') chatMessagesContainer?: ElementRef<HTMLDivElement>;

  expenses = signal<Expense[]>([]);
  loading = signal(true);
  error = signal('');
  showDeleteModal = signal(false);
  expenseToDelete = signal<Expense | null>(null);
  deleteMessage = computed(() => {
    const name = this.expenseToDelete()?.description || '';
    return this.translate.instant('deleteModal.message', { name });
  });

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);

  // Summary from backend (totals across ALL expenses, not just current page)
  totalAmount = signal(0);
  byCategory = signal<CategorySummary[]>([]);

  // Month filter
  selectedMonth = '';
  private filterYear = new Date().getFullYear();
  private filterMonth = new Date().getMonth(); // 0-indexed
  showAllTime = false;

  // AI Chat
  chatMessages = signal<ChatMessage[]>([]);
  aiLoading = signal(false);
  chatInput = '';
  private shouldScrollChat = false;

  // Voice input
  speechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  isRecording = signal(false);
  private recognition: any = null;


  // Example chips (translated via getter)
  get exampleChips(): string[] {
    return [
      this.translate.instant('ai.chip1'),
      this.translate.instant('ai.chip2'),
      this.translate.instant('ai.chip3'),
    ];
  }

  ngOnInit(): void {
    const page = this.route.snapshot.queryParamMap.get('page');
    if (page) {
      this.currentPage.set(parseInt(page, 10));
    }
    // Start showing current month
    this.selectedMonth = `${this.filterYear}-${this.filterMonth + 1}`;
    this.loadExpenses();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat) {
      this.scrollChatToBottom();
      this.shouldScrollChat = false;
    }
  }

  // AI Chat methods
  sendMessage(): void {
    const message = this.chatInput.trim();
    if (!message || this.aiLoading()) return;

    // Add user message to chat
    this.chatMessages.update(msgs => [...msgs, { role: 'user' as const, content: message }]);
    this.chatInput = '';
    this.aiLoading.set(true);
    this.shouldScrollChat = true;

    // Build history (all messages except the current one)
    const history = this.chatMessages().slice(0, -1);

    this.aiService.chat(message, history).subscribe({
      next: (response) => {
        this.chatMessages.update(msgs => [...msgs, { role: 'assistant' as const, content: response.message }]);
        this.aiLoading.set(false);
        this.shouldScrollChat = true;

        if (response.type === 'expense_created') {
          // Refresh expense list and clear chat after a short delay
          this.loadExpenses();
          setTimeout(() => this.clearChat(), 5000);
        }
      },
      error: () => {
        this.chatMessages.update(msgs => [
          ...msgs,
          { role: 'assistant' as const, content: this.translate.instant('ai.error') },
        ]);
        this.aiLoading.set(false);
        this.shouldScrollChat = true;
      },
    });
  }

  sendChip(text: string): void {
    this.chatInput = text;
    this.sendMessage();
  }

  toggleVoice(): void {
    if (this.isRecording()) {
      this.recognition?.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.translate.currentLang === 'es' ? 'es-AR' : 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => this.isRecording.set(true);

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.chatInput = transcript;
      this.isRecording.set(false);
      this.sendMessage();
    };

    this.recognition.onerror = () => this.isRecording.set(false);
    this.recognition.onend = () => this.isRecording.set(false);

    this.recognition.start();
  }

  clearChat(): void {
    this.chatMessages.set([]);
    this.chatInput = '';
    this.aiLoading.set(false);
  }

  private scrollChatToBottom(): void {
    const el = this.chatMessagesContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  // Existing methods
  loadExpenses(): void {
    this.loading.set(true);

    let fromDate: string | undefined;
    let toDate: string | undefined;

    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      toDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    }

    this.expenseService.getExpenses(this.currentPage(), this.pageSize(), fromDate, toDate).subscribe({
      next: (result) => {
        this.expenses.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.hasPreviousPage.set(result.hasPreviousPage);
        this.hasNextPage.set(result.hasNextPage);
        this.totalAmount.set(result.totalAmount);
        this.byCategory.set(result.byCategory);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('errors.loadExpenses'));
        this.loading.set(false);
      }
    });
  }

  currentMonthLabel(): string {
    if (this.showAllTime) {
      return this.translate.instant('expenses.allTime');
    }
    const lang = this.translate.currentLang || 'en';
    const locale = lang === 'es' ? 'es-AR' : 'en-US';
    const date = new Date(this.filterYear, this.filterMonth, 1);
    const label = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  canGoNextMonth(): boolean {
    const now = new Date();
    return this.showAllTime || this.filterYear < now.getFullYear() ||
      (this.filterYear === now.getFullYear() && this.filterMonth < now.getMonth());
  }

  prevMonth(): void {
    if (this.showAllTime) {
      this.showAllTime = false;
    } else {
      this.filterMonth--;
      if (this.filterMonth < 0) {
        this.filterMonth = 11;
        this.filterYear--;
      }
    }
    this.updateMonthAndReload();
  }

  nextMonth(): void {
    if (!this.canGoNextMonth()) return;
    this.filterMonth++;
    if (this.filterMonth > 11) {
      this.filterMonth = 0;
      this.filterYear++;
    }
    this.updateMonthAndReload();
  }

  toggleAllTime(): void {
    this.showAllTime = !this.showAllTime;
    if (!this.showAllTime) {
      const now = new Date();
      this.filterYear = now.getFullYear();
      this.filterMonth = now.getMonth();
    }
    this.updateMonthAndReload();
  }

  private updateMonthAndReload(): void {
    this.selectedMonth = this.showAllTime ? '' : `${this.filterYear}-${this.filterMonth + 1}`;
    this.currentPage.set(1);
    this.loadExpenses();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadExpenses();
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(p => p - 1);
      this.loadExpenses();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
      this.loadExpenses();
    }
  }

  delete(expense: Expense): void {
    this.expenseToDelete.set(expense);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const expense = this.expenseToDelete();
    if (!expense) return;

    this.expenseService.deleteExpense(expense.id).subscribe({
      next: () => {
        this.closeModal();
        // Reload to update pagination correctly
        this.loadExpenses();
      },
      error: () => {
        this.error.set(this.translate.instant('errors.deleteExpense'));
        this.closeModal();
      }
    });
  }

  cancelDelete(): void {
    this.closeModal();
  }

  private closeModal(): void {
    this.showDeleteModal.set(false);
    this.expenseToDelete.set(null);
  }
}
