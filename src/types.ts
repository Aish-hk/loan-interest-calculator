export const currencies = ["GBP", "USD", "EUR"] as const;

export type Currency = (typeof currencies)[number];

export interface LoanInput {
  startDate: string;
  endDate: string;
  amount: number;
  currency: Currency;
  baseRate: number;
  margin: number;
}

export interface DailyAccrual {
  date: string;
  daysElapsed: number;
  baseInterest: number;
  accruedInterest: number;
  runningTotal: number;
}

export interface LoanCalculation extends LoanInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
  totalRate: number;
  numberOfDays: number;
  dailyBaseInterest: number;
  dailyAccruedInterest: number;
  totalInterest: number;
}

export type LoanFormValues = {
  startDate: string;
  endDate: string;
  amount: string;
  currency: Currency | "";
  baseRate: string;
  margin: string;
};
