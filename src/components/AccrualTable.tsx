import { useEffect, useMemo, useState } from "react";
import type { LoanCalculation } from "../types";
import {
  ACCRUAL_PAGE_SIZE,
  getAccrualPage,
} from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/formatters";

interface AccrualTableProps {
  calculation: LoanCalculation;
}

function InfoTip({ label, children }: { label: string; children: string }) {
  return (
    <span className="info-tip">
      <button
        className="info-tip-trigger"
        type="button"
        aria-label={`${label}: ${children}`}
      >
        i
      </button>
      <span className="info-tip-popover" role="tooltip">
        {children}
      </span>
    </span>
  );
}

export function AccrualTable({ calculation }: AccrualTableProps) {
  const [page, setPage] = useState(1);
  const filteredDays = calculation.numberOfDays;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDays / ACCRUAL_PAGE_SIZE),
  );
  const rows = useMemo(
    () =>
      getAccrualPage(calculation, page, ACCRUAL_PAGE_SIZE),
    [calculation, page],
  );
  const firstRecord = (page - 1) * ACCRUAL_PAGE_SIZE + 1;
  const lastRecord = Math.min(
    page * ACCRUAL_PAGE_SIZE,
    filteredDays,
  );

  useEffect(() => {
    setPage(1);
  }, [calculation.id, calculation.startDate, calculation.endDate]);

  return (
    <section className="card table-card" aria-labelledby="schedule-title">
      <div className="section-heading table-heading">
        <div>
          <span className="eyebrow">Daily breakdown</span>
          <h2 id="schedule-title">Accrual schedule</h2>
        </div>
        <div className="schedule-count">
          <span className="record-count">
            {filteredDays.toLocaleString("en-GB")} records
          </span>
          <small>
            Showing records {firstRecord.toLocaleString("en-GB")}–
            {lastRecord.toLocaleString("en-GB")}
          </small>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">
                Accrual date
              </th>
              <th scope="col">
                <span className="column-heading">
                  Days elapsed
                  <InfoTip label="Days elapsed">
                    Number of days since the loan start date.
                  </InfoTip>
                </span>
              </th>
              <th scope="col" className="numeric">
                <span className="column-heading numeric-heading">
                  Base interest
                  <InfoTip label="Base interest">
                    Interest for the day using only the base rate.
                  </InfoTip>
                </span>
              </th>
              <th scope="col" className="numeric">
                <span className="column-heading numeric-heading">
                  Daily interest
                  <InfoTip label="Daily interest">
                    Interest for the day using the base rate plus margin,
                    allocated to two decimals.
                  </InfoTip>
                </span>
              </th>
              <th scope="col" className="numeric">
                <span className="column-heading numeric-heading">
                  Accrued interest
                  <InfoTip label="Accrued interest">
                    Rounded cumulative interest accumulated up to this date.
                  </InfoTip>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date}>
                <td>{formatDate(row.date)}</td>
                <td>{row.daysElapsed}</td>
                <td className="numeric">
                  {formatCurrency(row.baseInterest, calculation.currency)}
                </td>
                <td className="numeric emphasized">
                  {formatCurrency(row.accruedInterest, calculation.currency)}
                </td>
                <td className="numeric">
                  {formatCurrency(row.runningTotal, calculation.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="pagination" aria-label="Accrual schedule pages">
        <button
          className="button secondary"
          type="button"
          disabled={page === 1}
          onClick={() => setPage((current) => current - 1)}
        >
          Previous
        </button>
        <span>
          Page <strong>{page}</strong> of{" "}
          <strong>{totalPages.toLocaleString("en-GB")}</strong>
        </span>
        <button
          className="button secondary"
          type="button"
          disabled={page === totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </nav>
    </section>
  );
}
