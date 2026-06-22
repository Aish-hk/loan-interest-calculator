import { describe, expect, it } from "vitest";
import {
  ACCRUAL_PAGE_SIZE,
  calculateLoan,
  getAccrualPage,
  getNumberOfDays,
  MAX_LOAN_DAYS,
  roundCurrency,
} from "./calculations";

const input = {
  startDate: "2026-01-01",
  endDate: "2026-01-11",
  amount: 100_000,
  currency: "GBP" as const,
  baseRate: 4.5,
  margin: 1.25,
};

describe("getNumberOfDays", () => {
  it("uses an inclusive start and exclusive end date", () => {
    expect(getNumberOfDays("2026-01-01", "2026-01-11")).toBe(10);
  });

  it("is stable across daylight-saving boundaries", () => {
    expect(getNumberOfDays("2026-03-28", "2026-03-30")).toBe(2);
  });
});

describe("calculateLoan", () => {
  it("calculates daily and total simple interest", () => {
    const calculation = calculateLoan(
      input,
      "test-id",
      "2026-01-01T10:00:00.000Z",
    );

    expect(calculation.createdAt).toBe("2026-01-01T10:00:00.000Z");
    expect(calculation.totalRate).toBe(5.75);
    expect(calculation.numberOfDays).toBe(10);
    expect(calculation.dailyBaseInterest).toBeCloseTo(
      (100_000 * 0.045) / 365,
    );
    expect(calculation.dailyAccruedInterest).toBeCloseTo(
      (100_000 * 0.0575) / 365,
    );
    expect(calculation.totalInterest).toBeCloseTo(
      ((100_000 * 0.0575) / 365) * 10,
    );
  });

  it("produces dates from the start date through the day before end date", () => {
    const calculation = calculateLoan(input, "test-id");
    const rows = getAccrualPage(calculation, 1);

    expect(rows[0].date).toBe("2026-01-01");
    expect(rows[0].daysElapsed).toBe(0);
    expect(rows[9].date).toBe("2026-01-10");
    expect(rows[9].daysElapsed).toBe(9);
  });

  it("reconciles rounded daily accruals exactly to total interest", () => {
    const calculation = calculateLoan(
      { ...input, endDate: "2027-01-01" },
      "test-id",
    );
    const totalPages = Math.ceil(
      calculation.numberOfDays / ACCRUAL_PAGE_SIZE,
    );
    const rows = Array.from({ length: totalPages }, (_, index) =>
      getAccrualPage(calculation, index + 1),
    ).flat();
    const accruedTotal = roundCurrency(
      rows.reduce((sum, row) => sum + row.accruedInterest, 0),
    );

    expect(accruedTotal).toBe(calculation.totalInterest);
    expect(rows.at(-1)?.runningTotal).toBe(calculation.totalInterest);
  });

  it("returns zero interest when both rates are zero", () => {
    const calculation = calculateLoan(
      { ...input, baseRate: 0, margin: 0 },
      "test-id",
    );
    const rows = getAccrualPage(calculation, 1);

    expect(calculation.totalRate).toBe(0);
    expect(calculation.totalInterest).toBe(0);
    expect(rows.every((row) => row.accruedInterest === 0)).toBe(true);
  });

  it("uses actual calendar days across a leap day with a 365-day basis", () => {
    const calculation = calculateLoan(
      {
        ...input,
        startDate: "2024-02-28",
        endDate: "2024-03-01",
        amount: 250_000,
        baseRate: 5,
        margin: 0,
      },
      "test-id",
    );

    expect(calculation.numberOfDays).toBe(2);
    expect(calculation.totalInterest).toBe(
      roundCurrency(((250_000 * 0.05) / 365) * 2),
    );
  });

  it("handles decimal principals and rates at currency precision", () => {
    const calculation = calculateLoan(
      {
        ...input,
        amount: 1_000.01,
        baseRate: 3.33,
        margin: 0.67,
        endDate: "2026-02-01",
      },
      "test-id",
    );
    const rows = getAccrualPage(calculation, 1);

    expect(calculation.totalRate).toBe(4);
    expect(calculation.totalInterest).toBe(
      roundCurrency(((1_000.01 * 0.04) / 365) * 31),
    );
    expect(rows.at(-1)?.runningTotal).toBe(calculation.totalInterest);
  });

  it("rejects unsupported financial ranges", () => {
    expect(() =>
      calculateLoan({ ...input, amount: Number.POSITIVE_INFINITY }, "test-id"),
    ).toThrow("supported range");
    expect(() =>
      calculateLoan({ ...input, baseRate: 101 }, "test-id"),
    ).toThrow("supported range");
  });

  it("rejects an invalid date range", () => {
    expect(() =>
      calculateLoan({ ...input, endDate: input.startDate }, "test-id"),
    ).toThrow("End date must be later than start date.");
  });

  it("generates only the requested schedule page", () => {
    const calculation = calculateLoan(
      { ...input, endDate: "2027-01-01" },
      "test-id",
    );
    const secondPage = getAccrualPage(calculation, 2);

    expect(secondPage).toHaveLength(ACCRUAL_PAGE_SIZE);
    expect(secondPage[0].daysElapsed).toBe(100);
    expect(secondPage[99].daysElapsed).toBe(199);
  });

  it("returns the correct final partial schedule page", () => {
    const calculation = calculateLoan(
      { ...input, endDate: "2026-09-08" },
      "test-id",
    );
    const finalPage = getAccrualPage(calculation, 3);

    expect(calculation.numberOfDays).toBe(250);
    expect(finalPage).toHaveLength(50);
    expect(finalPage[0].daysElapsed).toBe(200);
    expect(finalPage.at(-1)?.daysElapsed).toBe(249);
    expect(finalPage.at(-1)?.runningTotal).toBe(calculation.totalInterest);
  });

  it("generates pages within a filtered accrual range", () => {
    const calculation = calculateLoan(input, "test-id");
    const filteredRows = getAccrualPage(calculation, 1, 100, 2, 5);

    expect(filteredRows).toHaveLength(3);
    expect(filteredRows[0].date).toBe("2026-01-03");
    expect(filteredRows[0].daysElapsed).toBe(2);
    expect(filteredRows[2].date).toBe("2026-01-05");
  });

  it("supports a 30-year loan without materialising all daily rows", () => {
    const calculation = calculateLoan(
      { ...input, endDate: "2056-01-01" },
      "test-id",
    );

    expect(calculation.numberOfDays).toBeGreaterThan(10_000);
    expect(getAccrualPage(calculation, 1)).toHaveLength(ACCRUAL_PAGE_SIZE);
  });

  it("rejects periods beyond the defensive processing ceiling", () => {
    expect(() =>
      calculateLoan(
        {
          ...input,
          endDate: "2100-01-01",
        },
        "test-id",
      ),
    ).toThrow("50-year processing limit");
    expect(MAX_LOAN_DAYS).toBe(18_300);
  });
});
