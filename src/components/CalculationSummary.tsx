import type { CSSProperties } from "react";
import type { LoanCalculation } from "../types";
import {
  formatCurrency,
  formatDate,
  formatRate,
} from "../utils/formatters";

interface CalculationSummaryProps {
  calculation: LoanCalculation;
}

function SummaryInfo({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  return (
    <span className="summary-term-info">
      <button
        className="info-tip-trigger"
        type="button"
        aria-label={`${label}: ${children}`}
      >
        i
      </button>
      <span className="summary-term-popover" role="tooltip">
        {children}
      </span>
    </span>
  );
}

export function CalculationSummary({
  calculation,
}: CalculationSummaryProps) {
  const totalRepayment = calculation.amount + calculation.totalInterest;
  const principalShare = (calculation.amount / totalRepayment) * 100;
  const interestShare = 100 - principalShare;
  const interestShareLabel =
    interestShare > 0 && interestShare < 0.1
      ? "<0.1%"
      : `${interestShare.toFixed(1)}%`;
  const donutRotation = interestShare * 1.8;

  return (
    <section className="card summary-card" aria-labelledby="summary-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Calculation result</span>
          <h2 id="summary-title">Interest summary</h2>
        </div>
      </div>

      <div className="hero-total">
        <span>Total interest</span>
        <strong>
          {formatCurrency(calculation.totalInterest, calculation.currency)}
        </strong>
        <small>
          {formatDate(calculation.startDate)} – {formatDate(calculation.endDate)}
        </small>
      </div>

      <div className="breakdown-heading">
        <strong>Repayment composition</strong>
        <span>How principal and interest make up the total repayment</span>
      </div>
      <div
        className="repayment-breakdown"
        aria-label={`Repayment breakdown: ${principalShare.toFixed(1)} percent principal and ${interestShareLabel} interest`}
      >
        <div className="donut-wrap">
          <svg
            className="repayment-donut"
            viewBox="0 0 220 220"
            role="img"
            aria-label="Principal and total interest donut chart"
            style={
              {
                "--donut-rotation": `${donutRotation}deg`,
              } as CSSProperties
            }
          >
            <circle className="donut-principal" cx="110" cy="110" r="72" />
            <circle
              className="donut-interest"
              cx="110"
              cy="110"
              r="72"
              pathLength="100"
              strokeDasharray={`${interestShare} ${100 - interestShare}`}
              strokeDashoffset={-principalShare}
            />
          </svg>
          <div className="donut-total">
            <span>Total repayment</span>
            <strong>
              {formatCurrency(totalRepayment, calculation.currency)}
            </strong>
          </div>
        </div>
        <div className="breakdown-key">
          <div className="breakdown-key-item">
            <span className="breakdown-key-title">
              <i className="key-dot principal-dot" aria-hidden="true" />
              Principal · {principalShare.toFixed(1)}%
              <SummaryInfo label="Principal">
                Original loan amount before interest.
              </SummaryInfo>
            </span>
            <strong>
              {formatCurrency(calculation.amount, calculation.currency)}
            </strong>
          </div>
          <div className="breakdown-key-item">
            <span className="breakdown-key-title">
              <i className="key-dot interest-dot" aria-hidden="true" />
              Total interest · {interestShareLabel}
              <SummaryInfo label="Total interest">
                Daily interest × number of loan days.
              </SummaryInfo>
            </span>
            <strong>
              {formatCurrency(calculation.totalInterest, calculation.currency)}
            </strong>
          </div>
        </div>
      </div>

      <dl className="summary-grid">
        <div>
          <dt className="summary-term-label">
            Annual rate
            <SummaryInfo label="Annual rate">
              Base rate + margin.
            </SummaryInfo>
          </dt>
          <dd>{formatRate(calculation.totalRate)}</dd>
        </div>
        <div>
          <dt className="summary-term-label">
            Loan term
            <SummaryInfo label="Loan term">
              Calendar days from the start date up to, but excluding, the end
              date.
            </SummaryInfo>
          </dt>
          <dd>{calculation.numberOfDays} days</dd>
        </div>
        <div>
          <dt className="summary-term-label">
            Daily interest
            <SummaryInfo label="Daily interest">
              Principal × annual rate ÷ 365.
            </SummaryInfo>
          </dt>
          <dd>
            {formatCurrency(
              calculation.dailyAccruedInterest,
              calculation.currency,
            )}
          </dd>
        </div>
        <div>
          <dt className="summary-term-label">
            Total repayment
            <SummaryInfo label="Total repayment">
              Principal + total interest.
            </SummaryInfo>
          </dt>
          <dd>{formatCurrency(totalRepayment, calculation.currency)}</dd>
        </div>
      </dl>

      <div className="assumption-note">
        <strong>Calculation basis</strong>
        <p>
          Simple interest using a 365-day year. Start date included; end date
          excluded. No compounding.
        </p>
      </div>
    </section>
  );
}
