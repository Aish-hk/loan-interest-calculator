import type { LoanCalculation } from "../types";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRate,
} from "../utils/formatters";

interface CalculationHistoryProps {
  calculations: LoanCalculation[];
  activeId?: string;
  openedId?: string;
  onOpen: (calculation: LoanCalculation) => void;
}

export function CalculationHistory({
  calculations,
  activeId,
  openedId,
  onOpen,
}: CalculationHistoryProps) {
  return (
    <section className="history-section" aria-labelledby="history-title">
      <div className="section-heading history-heading">
        <div>
          <span className="eyebrow">Current session</span>
          <h2 id="history-title">Calculation history</h2>
        </div>
        <span className="record-count">
          {calculations.length}{" "}
          {calculations.length === 1 ? "calculation" : "calculations"}
        </span>
      </div>

      {calculations.length === 0 ? (
        <div className="card empty-state">
          <span aria-hidden="true">↗</span>
          <div>
            <strong>Your calculations will appear here</strong>
            <p>Create a calculation to review or update it later.</p>
          </div>
        </div>
      ) : (
        <div className="history-list">
          {calculations.map((calculation) => (
            <article
              className={`card history-item ${
                calculation.id === activeId ? "active" : ""
              }`}
              key={calculation.id}
            >
              <div className="history-main">
                <div className="history-identity">
                  <span className="currency-badge">{calculation.currency}</span>
                  {calculation.id === openedId ? (
                    <span className="viewing-badge">Editing</span>
                  ) : calculation.id === activeId ? (
                    <span className="viewing-badge">Current</span>
                  ) : null}
                </div>
                <div>
                  <strong>
                    {formatCurrency(calculation.amount, calculation.currency)}
                  </strong>
                  <p>
                    {formatDate(calculation.startDate)} –{" "}
                    {formatDate(calculation.endDate)}
                  </p>
                  <span className="loan-terms">
                    {formatRate(calculation.baseRate)} base rate +{" "}
                    {formatRate(calculation.margin)} margin
                  </span>
                  {calculation.updatedFromId && (
                    <span className="history-version">
                      Updated from previous calculation
                    </span>
                  )}
                </div>
              </div>
              <dl className="history-metrics">
                <div className="history-metric-row">
                  <div>
                    <dt>Interest</dt>
                    <dd>
                      {formatCurrency(
                        calculation.totalInterest,
                        calculation.currency,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Term</dt>
                    <dd>
                      {calculation.numberOfDays.toLocaleString("en-GB")} days ·{" "}
                      {formatRate(calculation.totalRate)} total rate
                    </dd>
                  </div>
                </div>
                <small className="history-timestamp">
                  {calculation.updatedAt ? "Updated" : "Created"}{" "}
                  {formatDateTime(
                    calculation.updatedAt ?? calculation.createdAt,
                  )}
                </small>
              </dl>
              <div className="history-actions">
                <button
                  className="button secondary open-calculation"
                  type="button"
                  onClick={() => onOpen(calculation)}
                  disabled={calculation.id === openedId}
                >
                  {calculation.id === openedId ? "Editing" : "Edit"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
