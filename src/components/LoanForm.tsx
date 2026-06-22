import {
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { currencies, type LoanFormValues } from "../types";
import {
  ACCRUAL_PAGE_SIZE,
  getNumberOfDays,
  MAX_LOAN_AMOUNT,
  MAX_LOAN_DAYS,
  MAX_RATE,
} from "../utils/calculations";
import { FormField } from "./FormField";
import { DateRangePicker } from "./DateRangePicker";

type FormErrors = Partial<Record<keyof LoanFormValues, string>>;

interface LoanFormProps {
  values: LoanFormValues;
  onChange: (values: LoanFormValues) => void;
  onSubmit: () => void;
  isEditing: boolean;
  showNewAction: boolean;
  onStartNew: () => void;
}

function FieldInfo({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  return (
    <span className="field-label-with-info">
      <span>{label}</span>
      <span className="info-tip">
        <span
          className="info-tip-trigger"
          role="button"
          tabIndex={0}
          aria-label={`${label}: ${children}`}
        >
          i
        </span>
        <span className="info-tip-popover" role="tooltip">
          {children}
        </span>
      </span>
    </span>
  );
}

function validate(values: LoanFormValues): FormErrors {
  const errors: FormErrors = {};
  const amount = Number(values.amount);
  const baseRate = Number(values.baseRate);
  const margin = Number(values.margin);

  if (!values.startDate) errors.startDate = "Select a start date.";
  if (!values.endDate) errors.endDate = "Select an end date.";
  if (
    values.startDate &&
    values.endDate &&
    getNumberOfDays(values.startDate, values.endDate) <= 0
  ) {
    errors.endDate = "End date must be later than start date.";
  }
  if (
    values.startDate &&
    values.endDate &&
    getNumberOfDays(values.startDate, values.endDate) > MAX_LOAN_DAYS
  ) {
    errors.endDate =
      "The selected period exceeds the calculator’s 50-year processing limit.";
  }
  if (!values.amount || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  } else if (amount > MAX_LOAN_AMOUNT) {
    errors.amount = "Enter an amount no greater than 1 trillion.";
  }
  if (!values.currency) errors.currency = "Select a currency.";
  if (values.baseRate === "" || !Number.isFinite(baseRate) || baseRate < 0) {
    errors.baseRate = "Enter a rate of zero or more.";
  } else if (baseRate > MAX_RATE) {
    errors.baseRate = "Enter a base rate no greater than 100%.";
  }
  if (values.margin === "" || !Number.isFinite(margin) || margin < 0) {
    errors.margin = "Enter a margin of zero or more.";
  } else if (margin > MAX_RATE) {
    errors.margin = "Enter a margin no greater than 100%.";
  }

  return errors;
}

export function LoanForm({
  values,
  onChange,
  onSubmit,
  isEditing,
  showNewAction,
  onStartNew,
}: LoanFormProps) {
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const errors = validate(values);
  const canSubmit = Object.keys(errors).length === 0;
  const totalRate =
    (Number(values.baseRate) || 0) + (Number(values.margin) || 0);
  const hasRateInput = values.baseRate !== "" || values.margin !== "";
  const duration =
    values.startDate && values.endDate
      ? getNumberOfDays(values.startDate, values.endDate)
      : 0;
  const schedulePages =
    duration > 0 ? Math.ceil(duration / ACCRUAL_PAGE_SIZE) : 0;
  const numericAmount = Number(values.amount) || 0;
  const sliderMax = Math.max(
    1_000_000,
    Math.ceil(numericAmount / 100_000) * 100_000,
  );
  const sliderValue = Math.min(Math.max(numericAmount, 1_000), sliderMax);
  const sliderProgress =
    ((sliderValue - 1_000) / (sliderMax - 1_000)) * 100;

  const update =
    (field: keyof LoanFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange({ ...values, [field]: event.target.value });
    };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (canSubmit) {
      onSubmit();
      setAttemptedSubmit(false);
    }
  };

  return (
    <form className="card form-card" onSubmit={submit} noValidate>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Loan details</span>
          <h2>
            {isEditing ? "Create from calculation" : "Create a calculation"}
          </h2>
        </div>
        {showNewAction && (
          <button
            className="text-button new-calculation-button"
            type="button"
            onClick={() => {
              setAttemptedSubmit(false);
              onStartNew();
            }}
          >
            New calculation
          </button>
        )}
      </div>

      <fieldset>
        <legend>Loan period</legend>
        <DateRangePicker
          label="Start and end dates"
          startDate={values.startDate}
          endDate={values.endDate}
          onChange={(startDate, endDate) =>
            onChange({ ...values, startDate, endDate })
          }
          maxDate="2100-12-31"
          endDateExclusive
        />
        {attemptedSubmit && (errors.startDate || errors.endDate) && (
          <span className="field-message error" role="alert">
            {errors.startDate ?? errors.endDate}
          </span>
        )}
        {duration > 0 && duration <= MAX_LOAN_DAYS && (
          <div className="duration-preview" aria-live="polite">
            <strong>{duration.toLocaleString("en-GB")} calendar days</strong>
            <span>
              Daily schedule displayed across{" "}
              {schedulePages.toLocaleString("en-GB")}{" "}
              {schedulePages === 1 ? "page" : "pages"}
            </span>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>Principal</legend>
        <div className="form-grid amount-grid">
          <FormField
            id="amount"
            label="Loan amount"
            error={attemptedSubmit ? errors.amount : undefined}
          >
            <div className="amount-control">
              <input
                id="amount"
                type="number"
                min="0.01"
                max={MAX_LOAN_AMOUNT}
                step="0.01"
                inputMode="decimal"
                placeholder="100,000"
                value={values.amount}
                onChange={update("amount")}
                aria-invalid={attemptedSubmit && Boolean(errors.amount)}
                aria-describedby={
                  attemptedSubmit && errors.amount ? "amount-error" : undefined
                }
              />
              <div className="amount-slider">
                <input
                  type="range"
                min="1000"
                  max={sliderMax}
                  step="1000"
                  value={sliderValue}
                  onChange={update("amount")}
                  aria-label="Quickly adjust loan amount"
                  style={
                    {
                      "--range-progress": `${sliderProgress}%`,
                    } as CSSProperties
                  }
                />
              </div>
            </div>
          </FormField>
          <FormField
            id="currency"
            label="Currency"
            error={attemptedSubmit ? errors.currency : undefined}
          >
            <select
              id="currency"
              className={values.currency ? undefined : "placeholder"}
              value={values.currency}
              onChange={update("currency")}
              aria-invalid={attemptedSubmit && Boolean(errors.currency)}
            >
              <option value="" disabled>
                Select currency
              </option>
              {currencies.map((currency) => (
                <option value={currency} key={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </fieldset>

      <fieldset>
        <legend>Annual interest</legend>
        <div className="form-grid">
          <FormField
            id="baseRate"
            label={
              <FieldInfo label="Base interest rate">
                Annual reference rate before the margin is added.
              </FieldInfo>
            }
            error={attemptedSubmit ? errors.baseRate : undefined}
          >
            <div className="input-affix">
              <input
                id="baseRate"
                type="number"
                min="0"
                max={MAX_RATE}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={values.baseRate}
                onChange={update("baseRate")}
                aria-invalid={attemptedSubmit && Boolean(errors.baseRate)}
                aria-describedby={
                  attemptedSubmit && errors.baseRate
                    ? "baseRate-error"
                    : undefined
                }
              />
              <span aria-hidden="true">%</span>
            </div>
          </FormField>
          <FormField
            id="margin"
            label={
              <FieldInfo label="Margin">
                Additional annual rate added to the base rate.
              </FieldInfo>
            }
            error={attemptedSubmit ? errors.margin : undefined}
          >
            <div className="input-affix">
              <input
                id="margin"
                type="number"
                min="0"
                max={MAX_RATE}
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={values.margin}
                onChange={update("margin")}
                aria-invalid={attemptedSubmit && Boolean(errors.margin)}
                aria-describedby={
                  attemptedSubmit && errors.margin ? "margin-error" : undefined
                }
              />
              <span aria-hidden="true">%</span>
            </div>
          </FormField>
        </div>
      </fieldset>

      <div className="rate-preview" aria-live="polite">
        <span>Total annual rate</span>
        <strong>{hasRateInput ? `${totalRate.toFixed(2)}%` : "—"}</strong>
        <small>Base rate + margin</small>
      </div>

      <div className="form-actions">
        <button className="button primary" type="submit">
          Calculate interest
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
