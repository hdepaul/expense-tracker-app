export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  notes?: string;
  categoryId: string;
  categoryName?: string;
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CategorySummary {
  categoryName: string;
  amount: number;
}

export interface ExpenseListResult {
  items: Expense[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalAmount: number;
  byCategory: CategorySummary[];
}
