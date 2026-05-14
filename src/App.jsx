import { useState } from "react";
import { DateRangePicker, createRange } from "./components/DateRangePicker";

const basicUsageSnippet = `import { useState } from "react";
import { DateRangePicker, createRange } from "./components";

export function ReportsFilters() {
  const [range, setRange] = useState(() =>
    createRange("2025-04-15 14:35:05", "2025-05-15 15:00:00"),
  );

  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      onApply={(nextRange) => {
        console.log("Apply filter", nextRange.start, nextRange.end);
      }}
    />
  );
}`;

const customPresetsSnippet = `const presets = [
  {
    label: "Monitoring",
    items: [
      {
        label: "Last 5 Minutes",
        range: createRange("2025-05-14 09:55:00", "2025-05-14 10:00:00"),
      },
      {
        label: "Current Shift",
        range: createRange("2025-05-14 08:00:00", "2025-05-14 16:00:00"),
      },
    ],
  },
];

<DateRangePicker value={range} onChange={setRange} presets={presets} />;`;

const themeSnippet = `.orders-toolbar .drp {
  --drp-bg: #fffdf8;
  --drp-panel-bg: #f4efe4;
  --drp-border: #d9cdb7;
  --drp-border-strong: #b6955a;
  --drp-text: #1d1b18;
  --drp-muted: #7b6f60;
  --drp-accent: #b45f06;
  --drp-accent-soft: #f8e7c9;
}`;

const integrationSnippet = `import { DateRangePicker, createRange } from "./components";
import "./components/DateRangePicker.css";

const initialRange = createRange(
  "2025-04-15 14:35:05",
  "2025-05-15 15:00:00",
);`;

const customPresets = [
  {
    label: "Monitoring",
    items: [
      {
        label: "Last 5 Minutes",
        range: createRange("2025-05-14 09:55:00", "2025-05-14 10:00:00"),
      },
      {
        label: "Last 2 Hours",
        range: createRange("2025-05-14 08:00:00", "2025-05-14 10:00:00"),
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Current Shift",
        range: createRange("2025-05-14 08:00:00", "2025-05-14 16:00:00"),
      },
      {
        label: "Month Opening",
        range: createRange("2025-05-01 00:00:00", "2025-05-14 10:00:00"),
      },
    ],
  },
];

export default function App() {
  const [value, setValue] = useState(() =>
    createRange("2025-04-15 14:35:05", "2025-05-15 15:00:00"),
  );
  const [customValue, setCustomValue] = useState(() =>
    createRange("2025-05-14 08:00:00", "2025-05-14 16:00:00"),
  );

  return (
    <main className="manual-shell">
      <section className="manual-hero">
        <div className="manual-hero-copy">
          <p className="manual-eyebrow">React Date Range Picker</p>
          <h1>Manual, examples, and integration snippets</h1>
          <p className="manual-lead">
            Portable React date range picker with manual typing, second-level
            precision, built-in presets, popup calendars, and CSS-variable based
            theming.
          </p>

          <div className="manual-badges">
            <span>No third-party UI</span>
            <span>Controlled or uncontrolled</span>
            <span>Keyboard editable</span>
            <span>Themeable with CSS</span>
          </div>
        </div>

        <aside className="manual-preview-card">
          <div className="manual-preview-label">Live Example</div>
          <div className="manual-preview-demo">
            <DateRangePicker value={value} onChange={setValue} />
            <code className="manual-live-value">
              {value.start.toISOString()} | {value.end.toISOString()}
            </code>
          </div>

          <div className="manual-preview-notes">
            <h2>Try It</h2>
            <ul className="manual-list compact">
              <li>Type directly into the input down to seconds.</li>
              <li>Open the popup and switch months from either calendar header.</li>
              <li>Use preset categories on the left for quick jumps.</li>
              <li>Press <code>Enter</code> to apply or <code>Escape</code> to cancel.</li>
            </ul>
          </div>

          <div className="manual-preview-meta">
            <span>Input format</span>
            <code>YYYY-MM-DD HH:mm:ss - YYYY-MM-DD HH:mm:ss</code>
          </div>
        </aside>
      </section>

      <section className="manual-grid">
        <article className="manual-card">
          <h2>What This Component Does</h2>
          <ul className="manual-list">
            <li>
              Accepts direct input in{" "}
              <code>YYYY-MM-DD HH:mm:ss - YYYY-MM-DD HH:mm:ss</code> format.
            </li>
            <li>
              Validates that <code>start {"<="} end</code> and shows an invalid
              visual state otherwise.
            </li>
            <li>Supports quick preset ranges and manual calendar selection.</li>
            <li>Works well in filter bars, report pages, search forms, and table headers.</li>
          </ul>
        </article>

        <article className="manual-card">
          <h2>Files To Reuse</h2>
          <ul className="manual-list">
            <li><code>src/components/DateRangePicker.jsx</code></li>
            <li><code>src/components/DateRangePicker.css</code></li>
            <li><code>src/components/dateRangeUtils.js</code></li>
            <li><code>src/components/index.js</code> for clean imports</li>
          </ul>
        </article>
      </section>

      <section className="manual-section">
        <div className="manual-section-heading">
          <p>Quick Start</p>
          <h2>Import and use the controlled API</h2>
        </div>
        <div className="manual-two-column">
          <div className="manual-copy-block">
            <p>
              The most portable integration is a controlled value. Keep the range in
              parent state and use `onApply` when you want to trigger data reloads
              only after the user confirms.
            </p>
            <p>
              <code>createRange()</code> is the simplest helper for building the
              initial state from readable timestamp strings.
            </p>
          </div>
          <CodeBlock code={basicUsageSnippet} />
        </div>
      </section>

      <section className="manual-section">
        <div className="manual-section-heading">
          <p>Customization</p>
          <h2>Provide your own preset categories</h2>
        </div>
        <div className="manual-two-column">
          <div className="manual-demo-stack">
            <DateRangePicker
              value={customValue}
              onChange={setCustomValue}
              presets={customPresets}
            />
            <code className="manual-inline-value">
              {customValue.start.toISOString()} | {customValue.end.toISOString()}
            </code>
          </div>
          <CodeBlock code={customPresetsSnippet} />
        </div>
      </section>

      <section className="manual-grid">
        <article className="manual-card">
          <h2>Styling Hooks</h2>
          <p>
            The picker uses CSS custom properties, so you can restyle it inside a
            host page or product theme without modifying component logic.
          </p>
          <CodeBlock code={themeSnippet} />
        </article>

        <article className="manual-card">
          <h2>Integration Checklist</h2>
          <CodeBlock code={integrationSnippet} />
          <ul className="manual-list compact">
            <li>Import the component and its CSS once in the host app.</li>
            <li>Store range state where your filters or query params live.</li>
            <li>Call your data loading logic from `onApply` if needed.</li>
            <li>Override CSS variables in a wrapper class for brand styling.</li>
          </ul>
        </article>
      </section>

      <section className="manual-section">
        <div className="manual-section-heading">
          <p>API</p>
          <h2>Main props</h2>
        </div>
        <div className="manual-props">
          <PropRow
            name="value"
            type="{ start: Date, end: Date }"
            description="Controlled current range."
          />
          <PropRow
            name="defaultValue"
            type="{ start: Date, end: Date }"
            description="Initial range when used uncontrolled."
          />
          <PropRow
            name="onChange"
            type="(range) => void"
            description="Called whenever the parsed range changes."
          />
          <PropRow
            name="onApply"
            type="(range) => void"
            description="Called when the user confirms with Apply or Enter."
          />
          <PropRow
            name="presets"
            type="PresetGroup[]"
            description="Optional replacement for the default preset categories."
          />
          <PropRow
            name="className"
            type="string"
            description="Extra class for wrapper-level styling."
          />
        </div>
      </section>
    </main>
  );
}

function CodeBlock({ code }) {
  return (
    <pre className="manual-code">
      <code>
        {/* Lightweight syntax highlighting keeps the docs dependency-free. */}
        {highlightCode(code).map((token, index) => (
          <span
            key={`${token.type}-${index}`}
            className={token.type === "plain" ? undefined : `token-${token.type}`}
          >
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  );
}

function PropRow({ name, type, description }) {
  return (
    <div className="manual-prop-row">
      <div>
        <strong>{name}</strong>
        <span>{type}</span>
      </div>
      <p>{description}</p>
    </div>
  );
}

function highlightCode(code) {
  // This is intentionally small and heuristic-based; it only targets the
  // snippet shapes used on this manual page, not arbitrary JavaScript parsing.
  const pattern =
    /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`|\b(import|from|export|function|return|const|let|var|new)\b|<\/?[A-Z][A-Za-z0-9]*|\b(useState|DateRangePicker|createRange|console)\b|\b(onApply|onChange|value|presets|label|items|range|start|end|className)\b|[()[\]{}]|=>|<\/|\/>|\.\/[\w/-]+(?:\.\w+)?|--[\w-]+|#[0-9a-fA-F]{3,6}|\b\d{2,4}(?::\d{2}){1,2}\b|\b\d+\b)/g;

  const tokens = [];
  let lastIndex = 0;

  for (const match of code.matchAll(pattern)) {
    const value = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      tokens.push({ type: "plain", value: code.slice(lastIndex, index) });
    }

    tokens.push({ type: getTokenType(value), value });
    lastIndex = index + value.length;
  }

  if (lastIndex < code.length) {
    tokens.push({ type: "plain", value: code.slice(lastIndex) });
  }

  return tokens;
}

function getTokenType(value) {
  if (/^['"`]/.test(value)) {
    return "string";
  }

  if (/^(import|from|export|function|return|const|let|var|new)$/.test(value)) {
    return "keyword";
  }

  if (/^<\/?[A-Z]/.test(value)) {
    return "component";
  }

  if (/^(useState|DateRangePicker|createRange|console)$/.test(value)) {
    return "function";
  }

  if (/^(onApply|onChange|value|presets|label|items|range|start|end|className)$/.test(value)) {
    return "property";
  }

  if (/^[()[\]{}]$/.test(value) || /^(=>|<\/|\/>)$/.test(value)) {
    return "operator";
  }

  if (/^\.\/[\w/-]+(?:\.\w+)?$/.test(value) || /^--[\w-]+$/.test(value)) {
    return "path";
  }

  if (/^#[0-9a-fA-F]{3,6}$/.test(value)) {
    return "hex";
  }

  if (/^\d/.test(value)) {
    return "number";
  }

  return "plain";
}
