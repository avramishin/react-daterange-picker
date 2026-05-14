const MONTH_NAMES = [
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

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function formatDateTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

export function createRange(start, end) {
  return {
    start: typeof start === "string" ? parseDateTime(start) : new Date(start),
    end: typeof end === "string" ? parseDateTime(end) : new Date(end),
  };
}

export function parseDateTime(value) {
  // Parse the exact manual input format and reject overflowed JS dates.
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(
    value.trim(),
  );
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match.map(Number);
  const date = new Date(year, month - 1, day, hour, minute, second);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return null;
  }

  return date;
}

export function parseDateRangeInput(value) {
  const separator = " - ";
  const parts = value.split(separator);
  if (parts.length !== 2) {
    return { valid: false, range: null };
  }

  const start = parseDateTime(parts[0]);
  const end = parseDateTime(parts[1]);
  if (!start || !end || start > end) {
    return { valid: false, range: null };
  }

  return { valid: true, range: { start, end } };
}

export function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isWithinRange(date, range) {
  return (
    stripTime(date) >= stripTime(range.start) &&
    stripTime(date) <= stripTime(range.end)
  );
}

export function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfDay(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

export function endOfDay(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

export function startOfWeek(date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export function endOfWeek(date) {
  const end = endOfDay(date);
  end.setDate(end.getDate() + (6 - end.getDay()));
  return end;
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfQuarter(date) {
  const month = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), month, 1, 0, 0, 0, 0);
}

export function endOfQuarter(date) {
  const start = startOfQuarter(date);
  return new Date(
    start.getFullYear(),
    start.getMonth() + 3,
    0,
    23,
    59,
    59,
    999,
  );
}

export function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function setTimeParts(date, value) {
  const match = /^(\d{2}):(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, hour, minute, second] = match.map(Number);
  if (hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  const next = new Date(date);
  next.setHours(hour, minute, second, 0);
  return next;
}

export function getMonthMatrix(monthDate) {
  // Render a stable 6-row grid so both calendars keep a consistent height.
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstDay = first.getDay();
  const firstCell = addDays(first, -firstDay);
  const weeks = [];

  for (let week = 0; week < 6; week += 1) {
    const days = [];
    for (let day = 0; day < 7; day += 1) {
      days.push(addDays(firstCell, week * 7 + day));
    }
    weeks.push(days);
  }

  return weeks;
}

export function getMonthLabel(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function getDayNames() {
  return DAY_NAMES;
}

export function buildDefaultPresets(now = new Date()) {
  // Presets are grouped for menu rendering, but each item is just a plain range.
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterday = addDays(now, -1);
  const lastMonthAnchor = addMonths(now, -1);
  const lastQuarterAnchor = addMonths(now, -3);

  return [
    {
      label: "Operational",
      items: [
        preset("Last 15 Minutes", addMinutes(now, -15), now),
        preset("Last 1 Hour", addHours(now, -1), now),
        preset("Last 24 Hours", addHours(now, -24), now),
        preset("Today", todayStart, todayEnd),
        preset("Yesterday", startOfDay(yesterday), endOfDay(yesterday)),
      ],
    },
    {
      label: "Rolling Trends",
      items: [
        preset("Last 7 Days", startOfDay(addDays(now, -6)), todayEnd),
        preset("Last 30 Days", startOfDay(addDays(now, -29)), todayEnd),
        preset("Last 90 Days", startOfDay(addDays(now, -89)), todayEnd),
        preset("Last 365 Days", startOfDay(addDays(now, -364)), todayEnd),
      ],
    },
    {
      label: "Calendar-Based",
      items: [
        preset("This Week", startOfWeek(now), endOfWeek(now)),
        preset("This Month", startOfMonth(now), endOfMonth(now)),
        preset(
          "Last Month",
          startOfMonth(lastMonthAnchor),
          endOfMonth(lastMonthAnchor),
        ),
      ],
    },
    {
      label: "Financial & Executive",
      items: [
        preset("This Quarter", startOfQuarter(now), endOfQuarter(now)),
        preset(
          "Last Quarter",
          startOfQuarter(lastQuarterAnchor),
          endOfQuarter(lastQuarterAnchor),
        ),
        preset("Year to Date (YTD)", startOfYear(now), todayEnd),
        preset(
          "Trailing 12 Months (TTM)",
          startOfDay(addDays(now, -364)),
          todayEnd,
        ),
      ],
    },
  ];
}

function preset(label, start, end) {
  return { label, range: { start: new Date(start), end: new Date(end) } };
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function pad(value) {
  return String(value).padStart(2, "0");
}
