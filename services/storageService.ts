import { Task, Transaction, FinancialSummary, Folder, FileItem } from "../types";
import { getCurrentMonthKey, API_URL } from "../constants";

const KEYS = {
  TASKS: 'luiz_dashboard_tasks',
  TRANSACTIONS: 'luiz_dashboard_transactions',
  GOAL: 'luiz_dashboard_monthly_goal',
  LAST_LOGIN_MONTH: 'luiz_dashboard_last_month',
  FOLDERS: 'luiz_dashboard_folders',
  FILES: 'luiz_dashboard_files'
};

// --- CLOUD SYNC HELPERS ---

const saveToCloud = async (type: string, data: any) => {
  try {
    // FIX: Use 'no-cors' mode. 
    // Google Apps Script redirects POST requests to a result page.
    // Browsers often block this redirect in standard CORS mode, causing "Load failed".
    // 'no-cors' allows the request to be sent (opaque) without reading the response.
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain', // text/plain is allowed in no-cors
      },
      body: JSON.stringify({ type, data })
    });
    console.log(`[Cloud] Saved ${type} (Background)`);
  } catch (error) {
    // In no-cors mode, you rarely see errors unless network is down
    console.error(`[Cloud] Error saving ${type}:`, error);
  }
};

export const syncFromCloud = async (): Promise<boolean> => {
  if (!API_URL) return false;
  
  try {
    const controller = new AbortController();
    // 8 second timeout to prevent hanging
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // FIX: Add timestamp to URL to bypass browser/google caching which can break CORS headers
    const response = await fetch(`${API_URL}?t=${Date.now()}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Status ${response.status}`);
    }

    const data = await response.json();

    if (data.tasks) localStorage.setItem(KEYS.TASKS, JSON.stringify(data.tasks));
    if (data.transactions) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    if (data.folders) localStorage.setItem(KEYS.FOLDERS, JSON.stringify(data.folders));
    if (data.files) localStorage.setItem(KEYS.FILES, JSON.stringify(data.files));
    
    console.log("[Cloud] Data synced successfully");
    return true;
  } catch (error) {
    console.warn("[Cloud] Sync failed, using local data:", error);
    return false;
  }
};

// --- TASKS ---
export const getTasks = (): Task[] => {
  const data = localStorage.getItem(KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const saveTask = (task: Task) => {
  const tasks = getTasks();
  const existingIndex = tasks.findIndex(t => t.id === task.id);
  if (existingIndex >= 0) {
    tasks[existingIndex] = task;
  } else {
    tasks.push(task);
  }
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  saveToCloud('tasks', tasks); // Background sync
};

export const deleteTask = (id: string) => {
  const tasks = getTasks().filter(t => t.id !== id);
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  saveToCloud('tasks', tasks);
};

// --- TRANSACTIONS ---
export const getTransactions = (month?: string): Transaction[] => {
  const data = localStorage.getItem(KEYS.TRANSACTIONS);
  const all: Transaction[] = data ? JSON.parse(data) : [];
  if (month) {
    return all.filter(t => t.month === month);
  }
  return all;
};

export const addTransaction = (transaction: Transaction) => {
  const all = getTransactions();
  all.push(transaction);
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));
  saveToCloud('transactions', all);
};

export const removeTransaction = (id: string) => {
  const all = getTransactions().filter(t => t.id !== id);
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(all));
  saveToCloud('transactions', all);
};

export const getFinancialSummary = (month: string): FinancialSummary => {
  const transactions = getTransactions(month);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const storedGoal = localStorage.getItem(KEYS.GOAL);
  
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    monthlyGoal: storedGoal ? Number(storedGoal) : 10000
  };
};

export const setMonthlyGoal = (amount: number) => {
  localStorage.setItem(KEYS.GOAL, String(amount));
  // Ideally create a 'config' sheet for this, but for now local is fine or map to a sheet later
};

// --- NOTES & FOLDERS ---
export const getFolders = (): Folder[] => {
  const data = localStorage.getItem(KEYS.FOLDERS);
  return data ? JSON.parse(data) : [];
};

export const saveFolder = (folder: Folder) => {
  const list = getFolders();
  list.push(folder);
  localStorage.setItem(KEYS.FOLDERS, JSON.stringify(list));
  saveToCloud('folders', list);
};

export const deleteFolder = (id: string) => {
  const list = getFolders().filter(f => f.id !== id);
  localStorage.setItem(KEYS.FOLDERS, JSON.stringify(list));
  saveToCloud('folders', list);
  
  // Also delete files in folder
  const files = getFiles().filter(f => f.folderId !== id);
  localStorage.setItem(KEYS.FILES, JSON.stringify(files));
  saveToCloud('files', files);
};

export const getFiles = (folderId?: string): FileItem[] => {
  const data = localStorage.getItem(KEYS.FILES);
  const all: FileItem[] = data ? JSON.parse(data) : [];
  if (folderId) {
    return all.filter(f => f.folderId === folderId);
  }
  return all;
};

export const saveFile = (file: FileItem) => {
  const list = getFiles();
  const existingIndex = list.findIndex(f => f.id === file.id);
  if (existingIndex >= 0) {
    list[existingIndex] = file;
  } else {
    list.push(file);
  }
  localStorage.setItem(KEYS.FILES, JSON.stringify(list));
  saveToCloud('files', list);
};

export const deleteFile = (id: string) => {
  const list = getFiles().filter(f => f.id !== id);
  localStorage.setItem(KEYS.FILES, JSON.stringify(list));
  saveToCloud('files', list);
};

// --- MONTHLY RESET LOGIC ---
export const checkMonthlyReset = () => {
  const currentMonth = getCurrentMonthKey();
  const lastLoginMonth = localStorage.getItem(KEYS.LAST_LOGIN_MONTH);

  if (lastLoginMonth && lastLoginMonth !== currentMonth) {
    console.log(`New month detected: ${currentMonth}. Previous: ${lastLoginMonth}`);
    // In a real app, we might archive data here or send to Sheets.
  }
  localStorage.setItem(KEYS.LAST_LOGIN_MONTH, currentMonth);
};