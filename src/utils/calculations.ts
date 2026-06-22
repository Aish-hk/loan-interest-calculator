import type { DailyAccrual, LoanCalculation, LoanInput } from "../types";

const MS_PER_DAY = 86_400_000;
export const DAY_COUNT_BASIS = 365;
export const MAX_LOAN_DAYS = 50 * 366;
export const ACCRUAL_PAGE_SIZE = 100;

function parseUtcDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysToIso(value: string, days: number): string {
  return toIsoDate(new Date(parseUtcDate(value).getTime() + days * MS_PER_DAY));
}

export function getNumberOfDays(startDate: string, endDate: string): number {
  return Math.round(
    (parseUtcDate(endDate).getTime() - parseUtcDate(startDate).getTime()) /
      MS_PER_DAY,
  );
}

export function calculateLoan(
  input: LoanInput,
  id: string = crypto.randomUUID(),
  createdAt = new Date().toISOString(),
): LoanCalculation {
  const numberOfDays = getNumberOfDays(input.startDate, input.endDate);

  if (numberOfDays <= 0) {
    throw new Error("End date must be later than start date.");
  }
  if (numberOfDays > MAX_LOAN_DAYS) {
    throw new Error("Loan period cannot exceed the 50-year processing limit.");
  }

  const totalRate = input.baseRate + input.margin;
  const dailyBaseInterest =
    input.amount * (input.baseRate / 100) / DAY_COUNT_BASIS;
  const dailyAccruedInterest =
    input.amount * (totalRate / 100) / DAY_COUNT_BASIS;

  return {
    ...input,
    id,
    createdAt,
    totalRate,
    numberOfDays,
    dailyBaseInterest,
    dailyAccruedInterest,
    totalInterest: dailyAccruedInterest * numberOfDays,
  };
}

export function getAccrualPage(
  calculation: LoanCalculation,
  page: number,
  pageSize = ACCRUAL_PAGE_SIZE,
  rangeStart = 0,
  rangeEnd = calculation.numberOfDays,
): DailyAccrual[] {
  const filteredDays = Math.max(0, rangeEnd - rangeStart);
  const totalPages = Math.max(1, Math.ceil(filteredDays / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = rangeStart + (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, rangeEnd);
  const start = parseUtcDate(calculation.startDate);
  const rows: DailyAccrual[] = [];

  for (let index = startIndex; index < endIndex; index += 1) {
    const accrualDate = new Date(start.getTime() + index * MS_PER_DAY);
    rows.push({
      date: toIsoDate(accrualDate),
      daysElapsed: index,
      baseInterest: calculation.dailyBaseInterest,
      accruedInterest: calculation.dailyAccruedInterest,
      runningTotal: calculation.dailyAccruedInterest * (index + 1),
    });
  }

  return rows;
}
