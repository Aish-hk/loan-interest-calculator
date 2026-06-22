import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateField,
  DateInput,
  DateSegment,
  Label,
  Calendar,
} from "react-aria-components";
import {
  CalendarDate,
  parseDate,
} from "@internationalized/date";
import { formatDate } from "../utils/formatters";

interface DateRangePickerProps {
  label: string;
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  minDate?: string;
  maxDate?: string;
  endDateExclusive?: boolean;
}

function toIso(value: CalendarDate): string {
  return value.toString();
}

function parseOptionalDate(value: string): CalendarDate | null {
  return value ? parseDate(value) : null;
}

function today(): CalendarDate {
  const value = new Date();
  return new CalendarDate(
    value.getFullYear(),
    value.getMonth() + 1,
    value.getDate(),
  );
}

function clampDay(year: number, month: number, day: number): CalendarDate {
  const first = new CalendarDate(year, month, 1);
  return new CalendarDate(
    year,
    month,
    Math.min(day, first.calendar.getDaysInMonth(first)),
  );
}

export function DateRangePicker({
  label,
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  endDateExclusive,
}: DateRangePickerProps) {
  const committedStart = parseOptionalDate(startDate);
  const committedEnd = parseOptionalDate(endDate);
  const minimum = minDate ? parseDate(minDate) : new CalendarDate(1970, 1, 1);
  const maximum = maxDate
    ? parseDate(maxDate)
    : new CalendarDate(2100, 12, 31);
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<CalendarDate | null>(
    committedStart,
  );
  const [draftEnd, setDraftEnd] = useState<CalendarDate | null>(committedEnd);
  const [focusedDate, setFocusedDate] = useState(
    committedStart ?? committedEnd ?? today(),
  );
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const rangeError =
    draftStart && draftEnd && draftEnd.compare(draftStart) <= 0
      ? "End date must be later than start date."
      : undefined;
  const years = useMemo(
    () =>
      Array.from(
        { length: maximum.year - minimum.year + 1 },
        (_, index) => minimum.year + index,
      ),
    [maximum.year, minimum.year],
  );
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    setDraftStart(committedStart);
    setDraftEnd(committedEnd);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDraftStart(committedStart);
        setDraftEnd(committedEnd);
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open, startDate, endDate]);

  const commitIfValid = (
    start: CalendarDate | null,
    end: CalendarDate | null,
  ) => {
    if (start && end && end.compare(start) > 0) {
      onChange(toIso(start), toIso(end));
    }
  };

  const selectCalendarDate = (date: CalendarDate) => {
    if (activeTab === "start") {
      setDraftStart(date);
      setActiveTab("end");
      setFocusedDate(draftEnd ?? date.add({ days: 1 }));
      commitIfValid(date, draftEnd);
      return;
    }

    if (draftStart && date.compare(draftStart) <= 0) return;
    setDraftEnd(date);
    setFocusedDate(date);
    commitIfValid(draftStart, date);
  };

  return (
    <div className="range-picker">
      <span className="range-picker-label" id={labelId}>
        {label}
      </span>
      <div
        className={`range-picker-trigger${rangeError ? " invalid" : ""}`}
        role="group"
        aria-labelledby={labelId}
      >
        <DateField
          className="range-date-field"
          value={draftStart}
          minValue={minimum}
          maxValue={maximum.subtract({ days: 1 })}
          onChange={(value) => {
            setDraftStart(value);
            if (value) setFocusedDate(value);
            commitIfValid(value, draftEnd);
          }}
        >
          <Label>Start date</Label>
          <DateInput>
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
        </DateField>
        <span className="range-arrow" aria-hidden="true">
          →
        </span>
        <DateField
          className="range-date-field"
          value={draftEnd}
          minValue={draftStart?.add({ days: 1 }) ?? minimum.add({ days: 1 })}
          maxValue={maximum}
          onChange={(value) => {
            setDraftEnd(value);
            if (value) {
              setFocusedDate(value);
              commitIfValid(draftStart, value);
            }
          }}
        >
          <Label>End date</Label>
          <DateInput>
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
        </DateField>
        <Button
          className="calendar-trigger-button"
          ref={triggerRef}
          aria-label="Choose dates from calendar"
          aria-haspopup="dialog"
          aria-expanded={open}
          onPress={() => {
            setActiveTab("start");
            setFocusedDate(draftStart ?? draftEnd ?? today());
            setOpen((current) => !current);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 2v3M17 2v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
        </Button>
      </div>
      {rangeError && (
        <span className="range-picker-error" role="alert">
          {rangeError}
        </span>
      )}
      {endDateExclusive && (
        <span className="range-picker-help">
          Interest accrues through the day before the end date.
        </span>
      )}
      {open && (
        <div
          className="calendar-popover"
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${label} calendar`}
        >
          <div className="calendar-popover-heading">
            <div>
              <strong>Choose dates</strong>
              <span>Select a start date, then an end date</span>
            </div>
            <button
              type="button"
              aria-label="Close calendar"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="calendar-tabs">
            <button
              type="button"
              className={`tab ${activeTab === "start" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("start");
                setFocusedDate(draftStart ?? draftEnd ?? today());
              }}
            >
              {draftStart
                ? `Start · ${formatDate(toIso(draftStart))}`
                : "Start date"}
            </button>
            <button
              type="button"
              className={`tab ${activeTab === "end" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("end");
                setFocusedDate(draftEnd ?? draftStart ?? today());
              }}
            >
              {draftEnd ? `End · ${formatDate(toIso(draftEnd))}` : "End date"}
            </button>
          </div>
          <p className="calendar-step-hint" aria-live="polite">
            {activeTab === "start"
              ? "Choose the first day of the loan."
              : draftStart
                ? `Choose an end date after ${formatDate(toIso(draftStart))}.`
                : "Choose a start date first."}
          </p>
          <Calendar
            className="range-calendar"
            value={activeTab === "start" ? draftStart : draftEnd}
            onChange={selectCalendarDate}
            minValue={
              activeTab === "end" && draftStart
                ? draftStart.add({ days: 1 })
                : minimum
            }
            maxValue={maximum}
            focusedValue={focusedDate}
            onFocusChange={setFocusedDate}
          >
            <div className="calendar-navigation">
              <select
                aria-label="Choose month"
                value={focusedDate.month}
                onChange={(event) =>
                  setFocusedDate(
                    clampDay(
                      focusedDate.year,
                      Number(event.target.value),
                      focusedDate.day,
                    ),
                  )
                }
              >
                {months.map((month, index) => (
                  <option value={index + 1} key={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                aria-label="Choose year"
                value={focusedDate.year}
                onChange={(event) =>
                  setFocusedDate(
                    clampDay(
                      Number(event.target.value),
                      focusedDate.month,
                      focusedDate.day,
                    ),
                  )
                }
              >
                {years.map((year) => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <CalendarGrid>
              <CalendarGridHeader>
                {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    onClick={() => selectCalendarDate(date)}
                    className={({ defaultClassName }) =>
                      [
                        defaultClassName,
                        draftStart?.compare(date) === 0 ? "range-start" : "",
                        draftEnd?.compare(date) === 0 ? "range-end" : "",
                        activeTab === "end" &&
                        draftStart &&
                        date.compare(draftStart) <= 0
                          ? "before-start"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
          <div className="calendar-selection" aria-live="polite">
            {draftStart && draftEnd
              ? `Selected: ${formatDate(toIso(draftStart))} – ${formatDate(
                  toIso(draftEnd),
                )}`
              : draftStart
                ? `Start date: ${formatDate(toIso(draftStart))}. Select an end date.`
                : "Select a start date."}
          </div>
          <button
            className="button primary calendar-done"
            type="button"
            disabled={
              !draftStart ||
              !draftEnd ||
              draftEnd.compare(draftStart) <= 0
            }
            onClick={() => {
              commitIfValid(draftStart, draftEnd);
              setOpen(false);
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
