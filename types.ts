export type ViewState = 'dashboard' | 'tasks' | 'finance' | 'notes';

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  project: string;
  date: string; // YYYY-MM-DD
  priority: Priority;
  completed: boolean;
  createdAt: number;
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 'Design' | 'Trafego Pago' | 'Branding' | 'Social Media';
export type ExpenseCategory = 'Software' | 'Marketing' | 'Impostos' | 'Outros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory | string;
  date: string;
  month: string; // YYYY-MM for filtering
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyGoal: number;
}

export type FileType = 'note' | 'document';

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface FileItem {
  id: string;
  folderId: string; // 'root' or folder id
  title: string;
  content: string; // For notes: text content; For docs: just description or mock url
  type: FileType;
  createdAt: number;
}