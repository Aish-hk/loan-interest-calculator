import { useRef, useState } from "react";
import { AccrualTable } from "./components/AccrualTable";
import { CalculationHistory } from "./components/CalculationHistory";
import { CalculationSummary } from "./components/CalculationSummary";
import { LoanForm } from "./components/LoanForm";
import { RotatingCurrencyCoin } from "./components/RotatingCurrencyCoin";
import anchorBankLogo from "./assets/anchor-bank-logo.png";
import type {
  Currency,
  LoanCalculation,
  LoanFormValues,
  LoanInput,
} from "./types";
import { calculateLoan } from "./utils/calculations";

function initialValues(): LoanFormValues {
  return {
    startDate: "",
    endDate: "",
    amount: "",
    currency: "",
    baseRate: "",
    margin: "",
  };
}

function toFormValues(calculation: LoanCalculation): LoanFormValues {
  return {
    startDate: calculation.startDate,
    endDate: calculation.endDate,
    amount: String(calculation.amount),
    currency: calculation.currency,
    baseRate: String(calculation.baseRate),
    margin: String(calculation.margin),
  };
}

function App() {
  const [values, setValues] = useState<LoanFormValues>(initialValues);
  const [calculations, setCalculations] = useState<LoanCalculation[]>([]);
  const [active, setActive] = useState<LoanCalculation>();
  const [openedId, setOpenedId] = useState<string>();
  const [isCalculating, setIsCalculating] = useState(false);
  const [animationRun, setAnimationRun] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const submit = () => {
    const input: LoanInput = {
      startDate: values.startDate,
      endDate: values.endDate,
      amount: Number(values.amount),
      currency: values.currency as Currency,
      baseRate: Number(values.baseRate),
      margin: Number(values.margin),
    };
    const openedCalculation = calculations.find(
      (item) => item.id === openedId,
    );
    const hasChanges =
      !openedCalculation ||
      openedCalculation.startDate !== input.startDate ||
      openedCalculation.endDate !== input.endDate ||
      openedCalculation.amount !== input.amount ||
      openedCalculation.currency !== input.currency ||
      openedCalculation.baseRate !== input.baseRate ||
      openedCalculation.margin !== input.margin;
    const result = hasChanges
      ? calculateLoan(input)
      : openedCalculation;

    if (hasChanges) {
      setCalculations((current) => [result, ...current]);
    }
    setActive(result);
    setOpenedId(undefined);
    setAnimationRun((current) => current + 1);
    setIsCalculating(true);
    requestAnimationFrame(() => {
      resultsRef.current?.focus();
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const openCalculation = (calculation: LoanCalculation) => {
    setIsCalculating(false);
    setValues(toFormValues(calculation));
    setActive(calculation);
    setOpenedId(calculation.id);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const startNewCalculation = () => {
    setIsCalculating(false);
    setValues(initialValues());
    setActive(undefined);
    setOpenedId(undefined);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <img
            className="brand-logo"
            src={anchorBankLogo}
            alt=""
            aria-hidden="true"
          />
          <strong>Anchor Bank</strong>
        </div>
      </header>

      <main>
        <section className="page-intro">
          <div className="intro-copy">
            <span className="eyebrow">Loan calculator</span>
            <h1>See what your loan costs, day by day.</h1>
            <p>
              Calculate simple interest, review daily accruals and revisit
              previous calculations in one place.
            </p>
          </div>
        </section>

        <div className="workspace">
          <section ref={formRef}>
            <LoanForm
              values={values}
              onChange={setValues}
              onSubmit={submit}
              isEditing={Boolean(openedId)}
              showNewAction={Boolean(active) || Boolean(openedId)}
              onStartNew={startNewCalculation}
            />
          </section>

          <div className="results-column" ref={resultsRef} tabIndex={-1}>
            {active ? (
              <CalculationSummary
                key={`${active.id}-${active.updatedAt ?? active.createdAt}`}
                calculation={active}
              />
            ) : (
              <section className="card result-placeholder">
                <RotatingCurrencyCoin currency={values.currency || "GBP"} />
                <h2>Your result will appear here</h2>
                <p>
                  Complete the loan details to see total interest and the daily
                  accrual schedule.
                </p>
              </section>
            )}
            {isCalculating && (
              <div className="calculation-coin-overlay card">
                <RotatingCurrencyCoin
                  key={animationRun}
                  currency={active?.currency ?? (values.currency || "GBP")}
                  spinning
                  onSpinComplete={() => setIsCalculating(false)}
                />
                <h2>Your result will appear here</h2>
                <p>
                  Complete the loan details to see total interest and the daily
                  accrual schedule.
                </p>
              </div>
            )}
          </div>
        </div>

        {active && <AccrualTable calculation={active} />}

        <CalculationHistory
          calculations={calculations}
          activeId={active?.id}
          openedId={openedId}
          onOpen={openCalculation}
        />
      </main>

      <footer>
        <p>Calculations are estimates and are not financial advice.</p>
        <p>Data is held only for this browser session.</p>
      </footer>
    </>
  );
}

export default App;
