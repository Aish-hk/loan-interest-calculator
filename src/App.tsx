import { useRef, useState } from "react";
import { AccrualTable } from "./components/AccrualTable";
import { CalculationHistory } from "./components/CalculationHistory";
import { CalculationSummary } from "./components/CalculationSummary";
import { LoanForm } from "./components/LoanForm";
import { RotatingCurrencyCoin } from "./components/RotatingCurrencyCoin";
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
    const result = openedCalculation
      ? {
          ...calculateLoan(
            input,
            openedCalculation.id,
            openedCalculation.createdAt,
          ),
          updatedAt: new Date().toISOString(),
        }
      : calculateLoan(input);

    setCalculations((current) =>
      openedCalculation
        ? current.map((item) => (item.id === openedId ? result : item))
        : [result, ...current],
    );
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
        <div className="brand-logo" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="-40 -40 592 592" 
            fill="white" 
            width="32" 
            height="32"
            style={{ overflow: 'visible' }}
          >
            <path d="M304 32c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 40 29.6 73.2 68.3 79.1l0 32.9L144 144c-17.7 0-32 14.3-32 32s14.3 32 32 32l68.3 0 0 168.1C117 353 48 274.6 48 176c0-17.7-14.3-32-32-32S-16 158.3-16 176c0 120.3 84.8 221 198.8 244.3l0 59.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-59.7C360.2 397 445 296.3 445 176c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 98.6-69 177-164.3 200.1l0-168.1 68.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-68.3 0 0-32.9C274.4 105.2 304 72 304 32z"/>
          </svg>
          <span style={{ fontFamily: '"Basier Circle", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 700, fontSize: '20px', color: 'white' }}>
            Anchor Bank
          </span>
        </div>
      </header>

      <main>
        <section className="page-intro">
          <div className="intro-copy">
            <span className="eyebrow">Loan calculator</span>
            <h1>Calculate your loan costs.</h1>
            <p>
              Easily review your daily interest and total loan costs.
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
