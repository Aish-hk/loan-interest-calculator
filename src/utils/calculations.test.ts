import { describe, expect, it } from "vitest";
import {
  ACCRUAL_PAGE_SIZE,
  calculateLoan,
  getAccrualPage,
  getNumberOfDays,
  MAX_LOAN_DAYS,
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
