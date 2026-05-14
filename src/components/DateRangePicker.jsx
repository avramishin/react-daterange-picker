import { useEffect, useId, useRef, useState } from "react";
import "./DateRangePicker.css";
import {
  addMonths,
  buildDefaultPresets,
  createRange,
  formatDateTime,
  getDayNames,
  getMonthLabel,
  getMonthMatrix,
  isSameDay,
  isWithinRange,
  parseDateRangeInput,
  setTimeParts,
  stripTime,
} from "./dateRangeUtils";

const DEFAULT_RANGE = createRange("2025-04-15 14:35:05", "2025-05-15 15:00:00");

export function DateRangePicker({
  value,
  defaultValue = DEFAULT_RANGE,
  onChange,
  onApply,
  presets,
  className = "",
}) {
  const isControlled = value !== undefined;
  const committed = isControlled ? value : defaultValue;
  const resolvedPresets = presets ?? buildDefaultPresets();

  const [internalRange, setInternalRange] = useState(committed);
  const [draftRange, setDraftRange] = useState(committed);
  const [inputValue, setInputValue] = useState(formatRange(committed));
  const [isOpen, setIsOpen] = useState(false);
  const [isInputValid, setIsInputValid] = useState(true);
  const [selectionTarget, setSelectionTarget] = useState("start");
  const [activePresetGroup, setActivePresetGroup] = useState(null);
  const [leftVisibleMonth, setLeftVisibleMonth] = useState(
    new Date(committed.start.getFullYear(), committed.start.getMonth(), 1),
  );
  const [rightVisibleMonth, setRightVisibleMonth] = useState(
    addMonths(new Date(committed.start.getFullYear(), committed.start.getMonth(), 1), 1),
  );
  const [startTimeText, setStartTimeText] = useState(formatTime(committed.start));
  const [endTimeText, setEndTimeText] = useState(formatTime(committed.end));

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const suppressNextFocusOpenRef = useRef(false);
  const popupId = useId();

  const activeRange = isControlled ? committed : internalRange;

  useEffect(() => {
    setInputValue(formatRange(activeRange));
    setDraftRange(activeRange);
    syncVisibleMonths(activeRange.start);
    setStartTimeText(formatTime(activeRange.start));
    setEndTimeText(formatTime(activeRange.end));
  }, [activeRange]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActivePresetGroup(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function commitRange(nextRange, options = {}) {
    if (!isControlled) {
      setInternalRange(nextRange);
    }
    onChange?.(nextRange);
    if (options.applied) {
      onApply?.(nextRange);
    }
  }

  function handleInputChange(event) {
    const nextValue = event.target.value;
    setInputValue(nextValue);

    const parsed = parseDateRangeInput(nextValue);
    setIsInputValid(parsed.valid);

    if (parsed.valid) {
      setDraftRange(parsed.range);
      setStartTimeText(formatTime(parsed.range.start));
      setEndTimeText(formatTime(parsed.range.end));
      syncVisibleMonths(parsed.range.start);
      commitRange(parsed.range);
    }
  }

  function handleInputKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (event.key === "Enter") {
      const parsed = parseDateRangeInput(inputValue);
      setIsInputValid(parsed.valid);
      if (parsed.valid) {
        commitRange(parsed.range, { applied: true });
        setIsOpen(false);
        setActivePresetGroup(null);
      }
      return;
    }

    if (event.key === "Escape") {
      setInputValue(formatRange(activeRange));
      setIsInputValid(true);
      setIsOpen(false);
      setActivePresetGroup(null);
    }
  }

  function handleInputFocus() {
    if (suppressNextFocusOpenRef.current) {
      suppressNextFocusOpenRef.current = false;
      return;
    }
    setIsOpen(true);
  }

  function handleCalendarButtonClick() {
    setIsOpen((current) => !current);
    setActivePresetGroup(null);
    suppressNextFocusOpenRef.current = true;
    inputRef.current?.focus();
  }

  function handleDayClick(which, day) {
    if (which === "start") {
      const nextStart = withDate(draftRange.start, day);
      const nextRange =
        nextStart <= draftRange.end
          ? { start: nextStart, end: draftRange.end }
          : { start: nextStart, end: nextStart };
      updateDraft(nextRange, "start", true, true, false);
      return;
    }

    const nextEnd = withDate(draftRange.end, day);
    const nextRange =
      draftRange.start <= nextEnd
        ? { start: draftRange.start, end: nextEnd }
        : { start: nextEnd, end: nextEnd };
    updateDraft(nextRange, "end", true, true, false);
  }

  function handleTimeChange(which, nextText) {
    if (which === "start") {
      setStartTimeText(nextText);
      const nextDate = setTimeParts(draftRange.start, nextText);
      if (!nextDate || nextDate > draftRange.end) {
        return;
      }
      updateDraft(
        { start: nextDate, end: draftRange.end },
        selectionTarget,
        false,
        false,
        false,
      );
      return;
    }

    setEndTimeText(nextText);
    const nextDate = setTimeParts(draftRange.end, nextText);
    if (!nextDate || nextDate < draftRange.start) {
      return;
    }
    updateDraft(
      { start: draftRange.start, end: nextDate },
      selectionTarget,
      false,
      false,
      false,
    );
  }

  function applyPreset(range) {
    updateDraft({ start: new Date(range.start), end: new Date(range.end) }, "start");
  }

  function updateDraft(
    nextRange,
    nextTarget = selectionTarget,
    syncInput = true,
    syncTimeText = true,
    syncMonths = true,
  ) {
    setDraftRange(nextRange);
    setSelectionTarget(nextTarget);
    if (syncTimeText) {
      setStartTimeText(formatTime(nextRange.start));
      setEndTimeText(formatTime(nextRange.end));
    }
    if (syncMonths) {
      syncVisibleMonths(nextRange.start);
    }
    if (syncInput) {
      setInputValue(formatRange(nextRange));
      setIsInputValid(true);
    }
  }

  function syncVisibleMonths(anchorDate) {
    const leftMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    setLeftVisibleMonth(leftMonth);
    setRightVisibleMonth(addMonths(leftMonth, 1));
  }

  function handleApply() {
    commitRange(draftRange, { applied: true });
    setInputValue(formatRange(draftRange));
    setIsInputValid(true);
    setIsOpen(false);
    setActivePresetGroup(null);
    suppressNextFocusOpenRef.current = true;
    inputRef.current?.focus();
  }

  function handleCancel() {
    updateDraft(activeRange, "start");
    setInputValue(formatRange(activeRange));
    setIsInputValid(true);
    setIsOpen(false);
    setActivePresetGroup(null);
  }

  function handlePresetGroupBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setActivePresetGroup(null);
    }
  }

  return (
    <div className={`drp ${className}`.trim()} ref={rootRef}>
      <div className={`drp-input-shell ${isInputValid ? "" : "is-invalid"}`}>
        <input
          ref={inputRef}
          className="drp-input"
          aria-invalid={!isInputValid}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={popupId}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
        />
        <button
          type="button"
          className="drp-input-action"
          aria-label={isOpen ? "Close date range picker" : "Open date range picker"}
          aria-controls={popupId}
          aria-expanded={isOpen}
          onClick={handleCalendarButtonClick}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm11 8H6v10h12V10ZM6 8h12V7H6v1Z" />
          </svg>
        </button>
        {!isInputValid ? <span className="drp-invalid-indicator">!</span> : null}
      </div>

      {isOpen ? (
        <div className="drp-popover" id={popupId} role="dialog" aria-label="Date range picker">
          <aside className="drp-sidebar">
            {resolvedPresets.map((group) => (
              <section
                key={group.label}
                className="drp-preset-group"
                onMouseEnter={() => setActivePresetGroup(group.label)}
                onMouseLeave={() =>
                  setActivePresetGroup((current) =>
                    current === group.label ? null : current,
                  )
                }
                onBlur={handlePresetGroupBlur}
              >
                <button
                  type="button"
                  className={`drp-preset-trigger ${
                    activePresetGroup === group.label ||
                    group.items.some((item) => isPresetActive(item.range, draftRange))
                      ? "is-active"
                      : ""
                  }`}
                  aria-expanded={activePresetGroup === group.label}
                  onFocus={() => setActivePresetGroup(group.label)}
                >
                  <span>{group.label}</span>
                  <span className="drp-preset-caret">›</span>
                </button>
                <div
                  className={`drp-preset-menu ${
                    activePresetGroup === group.label ? "is-open" : ""
                  }`}
                >
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={isPresetActive(item.range, draftRange) ? "is-active" : ""}
                      onClick={() => applyPreset(item.range)}
                      onFocus={() => setActivePresetGroup(group.label)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </aside>

          <div className="drp-main">
            <div className="drp-calendars">
              <CalendarMonth
                month={leftVisibleMonth}
                onPrevious={() => setLeftVisibleMonth(addMonths(leftVisibleMonth, -1))}
                onNext={() => setLeftVisibleMonth(addMonths(leftVisibleMonth, 1))}
                range={draftRange}
                onDayClick={(day) => handleDayClick("start", day)}
              />
              <CalendarMonth
                month={rightVisibleMonth}
                onPrevious={() => setRightVisibleMonth(addMonths(rightVisibleMonth, -1))}
                onNext={() => setRightVisibleMonth(addMonths(rightVisibleMonth, 1))}
                range={draftRange}
                onDayClick={(day) => handleDayClick("end", day)}
              />
            </div>

            <div className="drp-time-row">
              <label>
                <span>From</span>
                <input
                  value={startTimeText}
                  onChange={(event) => handleTimeChange("start", event.target.value)}
                  onFocus={() => setSelectionTarget("start")}
                />
              </label>
              <label>
                <span>To</span>
                <input
                  value={endTimeText}
                  onChange={(event) => handleTimeChange("end", event.target.value)}
                  onFocus={() => setSelectionTarget("end")}
                />
              </label>
            </div>

            <footer className="drp-footer">
              <div className="drp-footer-value">{formatRange(draftRange)}</div>
              <div className="drp-footer-actions">
                <button type="button" className="drp-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="button" className="drp-primary" onClick={handleApply}>
                  Apply
                </button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarMonth({ month, range, onDayClick, onPrevious, onNext }) {
  const weeks = getMonthMatrix(month);
  const dayNames = getDayNames();

  return (
    <section className="drp-calendar">
      <header className="drp-calendar-header">
        {onPrevious ? (
          <button type="button" className="drp-nav" onClick={onPrevious} aria-label="Previous month">
            ‹
          </button>
        ) : (
          <span className="drp-nav-spacer" />
        )}
        <h2>{getMonthLabel(month)}</h2>
        {onNext ? (
          <button type="button" className="drp-nav" onClick={onNext} aria-label="Next month">
            ›
          </button>
        ) : (
          <span className="drp-nav-spacer" />
        )}
      </header>

      <div className="drp-weekdays">
        {dayNames.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>

      <div className="drp-grid">
        {weeks.flat().map((day) => {
          const isCurrentMonth = day.getMonth() === month.getMonth();
          const isStart = isSameDay(day, range.start);
          const isEnd = isSameDay(day, range.end);
          const isInRange = isWithinRange(day, range);

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={[
                "drp-day",
                isCurrentMonth ? "" : "is-muted",
                isInRange ? "is-in-range" : "",
                isStart ? "is-start" : "",
                isEnd ? "is-end" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onDayClick(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function formatRange(range) {
  return `${formatDateTime(range.start)} - ${formatDateTime(range.end)}`;
}

function formatTime(date) {
  return formatDateTime(date).slice(11);
}

function withDate(source, datePart) {
  const next = new Date(source);
  next.setFullYear(datePart.getFullYear(), datePart.getMonth(), datePart.getDate());
  return next;
}

function isPresetActive(left, right) {
  return (
    stripTime(left.start).getTime() === stripTime(right.start).getTime() &&
    stripTime(left.end).getTime() === stripTime(right.end).getTime() &&
    formatTime(left.start) === formatTime(right.start) &&
    formatTime(left.end) === formatTime(right.end)
  );
}

export { createRange };
