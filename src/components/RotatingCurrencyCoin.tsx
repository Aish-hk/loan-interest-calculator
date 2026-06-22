import type { AnimationEvent } from "react";
import type { Currency } from "../types";

const currencySymbols: Record<Currency, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};

const slabCount = 144;
const coinSize = 280;
const thickness = 22;
const radius = coinSize / 2;

interface RotatingCurrencyCoinProps {
  currency: Currency;
  spinning?: boolean;
  onSpinComplete?: () => void;
}

export function RotatingCurrencyCoin({
  currency,
  spinning = false,
  onSpinComplete,
}: RotatingCurrencyCoinProps) {
  const symbol = currencySymbols[currency];
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) onSpinComplete?.();
  };

  return (
    <div
      className={`currency-coin-visual${spinning ? " spinning" : ""}`}
      aria-hidden="true"
    >
      <div className="currency-coin-stage">
        <div className="currency-coin" onAnimationEnd={handleAnimationEnd}>
          <div className="currency-coin-face currency-coin-front">
            <span>{symbol}</span>
          </div>
          <div className="currency-coin-face currency-coin-back">
            <span>{symbol}</span>
          </div>
          {Array.from({ length: slabCount }, (_, index) => {
            const angle = (360 / slabCount) * index;
            const width = (2 * Math.PI * radius) / slabCount + 1.5;
            return (
              <i
                key={index}
                className="currency-coin-edge"
                style={{
                  height: `${thickness}px`,
                  top: `${radius - thickness / 2}px`,
                  width: `${width}px`,
                  transform: `translateX(-50%) rotateY(90deg) rotateX(${angle}deg) translateZ(${radius}px)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
