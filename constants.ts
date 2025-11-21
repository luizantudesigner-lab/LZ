import { IncomeCategory, ExpenseCategory } from "./types";

export const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/15Gf02t48dcSdpmz_XL567bqZxGaQkEvO?usp=sharing";
export const ACCESS_CODE = "luiz02";

// URL Gerada pelo Google Apps Script
export const API_URL = "https://script.google.com/macros/s/AKfycbwhuGnNxACksFXnPPWnrLZLZm0pFv2oezCWoWObIFcbRgM9zEYxV3EVG0QE7sYQCxQD/exec";

export const INCOME_CATEGORIES: IncomeCategory[] = ['Design', 'Trafego Pago', 'Branding', 'Social Media'];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Software', 'Marketing', 'Impostos', 'Outros'];

export const GOLD_COLOR = "#D4AF37";
export const GOLD_LIGHT = "#FBF5B7";
export const GOLD_DARK = "#AA771C";

// Helper to format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Helper to get today's date string YYYY-MM-DD
export const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get current month key YYYY-MM
export const getCurrentMonthKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};