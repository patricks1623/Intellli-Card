
export interface CreditCard {
  id: string;
  name: string;
  totalLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  date: string; // ISO string
  cardId: string;
  installments: number;
  isRecurring?: boolean; // Nova funcionalidade: Gastos Recorrentes
}

export interface MonthlyProjection {
  month: string;
  fullDate: Date;
  total: number;
  isCurrentMonth?: boolean;
  [cardId: string]: any;
}

export interface ProjectionDetail {
  description: string;
  cardName: string;
  cardColor: string;
  installmentNumber: number;
  totalInstallments: number;
  value: number;
  isRecurring?: boolean;
}
