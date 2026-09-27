import { useId, useState } from "react";
import { Delete, Eraser } from "lucide-react";

type MathKey = {
  label: string;
  insert: string;
  cursorOffset?: number;
  hint?: string;
  wide?: boolean;
};
type TabName = "Numbers" | "Powers & roots" | "Geometry" | "Coordinates" | "Formulas";
const key = (label: string, insert = label, hint?: string, cursorOffset = 0, wide = false): MathKey =>
  ({ label, insert, hint, cursorOffset, wide });

const KEYS: Record<TabName, MathKey[]> = {
  Numbers: [
    key("7"), key("8"), key("9"), key("÷", "/", "divide"), key("("),
    key("4"), key("5"), key("6"), key("×", "×", "multiply"), key(")"),
    key("1"), key("2"), key("3"), key("−", "−", "subtract"), key("="),
    key("0"), key("."), key("x", "x", "variable"), key("+", "+", "add"), key("y", "y", "variable"),
  ],
  "Powers & roots": [
    key("x²", "²", "squared"),
    key("x³", "³", "cubed"),
    key("xⁿ", "^()", "power", -1),
    key("√()", "√()", "square root", -1),
    key("∛()", "∛()", "cube root", -1),
    key("a/b", "()/()", "fraction", -4),
    key("|x|", "| |", "absolute value", -2),
    key("±", "±", "plus or minus"),
    key("₁", "₁", "subscript 1"),
    key("₂", "₂", "subscript 2"),
  ],
  Geometry: [
    key("∠", "∠", "angle"),
    key("°", "°", "degrees"),
    key("π", "π", "pi"),
    key("⟂", "⟂", "perpendicular"),
    key("∥", "∥", "parallel"),
    key("≅", "≅", "congruent"),
    key("~", "~", "similar"),
    key("△", "△", "triangle"),
    key("⊙", "⊙", "circle"),
    key("→", "→", "implies or maps to"),
    key("¬", "¬", "not"),
    key("↔", "↔", "if and only if"),
    key("<", "<", "less than"),
    key(">", ">", "greater than"),
    key("≤", "≤", "at most"),
    key("≥", "≥", "at least"),
    key("≠", "≠", "not equal"),
    key("≈", "≈", "approximately"),
    key(",", ",", "coordinate or list separator"),
    key(":", ":", "ratio"),
    key("∠ABC", "∠ABC", "named angle", 0, true),
    key("△ABC", "△ABC", "named triangle", 0, true),
  ],
  Coordinates: [
    key("m", "m", "slope"),
    key("Δx", "Δx", "change in x"),
    key("Δy", "Δy", "change in y"),
    key("(x, y)", "(, )", "ordered pair", -3),
    key("M", "M = ((x_1 + x_2)/2, (y_1 + y_2)/2)", "midpoint formula", 0, true),
    key("d", "d = √((x_2 − x_1)^2 + (y_2 − y_1)^2)", "distance formula", 0, true),
    key("circle", "(x − h)^2 + (y − k)^2 = r^2", "circle equation", 0, true),
    key("reflect x", "(x, y) → (x, −y)", "reflect across x-axis", 0, true),
  ],
  Formulas: [
    key("a²+b²=c²", "a^2 + b^2 = c^2", "Pythagorean theorem", 0, true),
    key("sin", "sin( )", "sine", -1),
    key("cos", "cos( )", "cosine", -1),
    key("tan", "tan( )", "tangent", -1),
    key("A = ½bh", "A = (1/2)bh", "triangle area", 0, true),
    key("A = πr²", "A = πr^2", "circle area", 0, true),
    key("C = 2πr", "C = 2πr", "circumference", 0, true),
    key("s = θr", "s = (x/360) · 2πr", "arc length for x degrees", 0, true),
    key("V = πr²h", "V = πr^2h", "cylinder volume", 0, true),
    key("V = ⅓πr²h", "V = (1/3)πr^2 h", "cone volume", 0, true),
    key("V = ⁴⁄₃πr³", "V = (4/3)πr^3", "sphere volume", 0, true),
    key("S = 4πr²", "S = 4πr^2", "sphere surface area", 0, true),
    key("V−E+F=2", "V−E+F=2", "Euler's formula", 0, true),
  ],
};

const TAB_DETAILS: Record<TabName, { description: string; tone: string; selected: string }> = {
  Numbers: {
    description: "Everyday numbers and operations",
    tone: "bg-secondary/60 border-border hover:bg-secondary",
    selected: "bg-primary text-primary-foreground border-primary",
  },
  "Powers & roots": {
    description: "Build fractions, exponents, and roots",
    tone: "bg-teal-50/80 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-950/50",
    selected: "bg-primary text-primary-foreground border-primary",
  },
  Geometry: {
    description: "Angles, congruence, parallels, similarity, and proof",
    tone: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50",
    selected: "bg-amber-200 dark:bg-amber-800 text-foreground border-amber-300 dark:border-amber-700",
  },
  Coordinates: {
    description: "Points, distances, transformations, and circles",
    tone: "bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-950/50",
    selected: "bg-sky-200 dark:bg-sky-800 text-foreground border-sky-300 dark:border-sky-700",
  },
  Formulas: {
    description: "Lengths, area, volume, and theorems",
    tone: "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/50",
    selected: "bg-rose-200 dark:bg-rose-800 text-foreground border-rose-300 dark:border-rose-700",
  },
};

interface MathKeyboardProps {
  onInsert: (symbol: string, cursorOffset?: number) => void;
  onBackspace?: () => void;
  onClear?: () => void;
}

export function MathKeyboard({ onInsert, onBackspace, onClear }: MathKeyboardProps) {
  const [activeTab, setActiveTab] = useState<TabName>("Numbers");
  const id = useId();
  const tabs = Object.keys(KEYS) as TabName[];
  const detail = TAB_DETAILS[activeTab];

  return (
    <div className="w-full min-w-0 rounded-xl border border-border bg-card p-2.5 shadow-sm sm:p-3" aria-label="Geometry math keyboard" data-testid="math-keyboard">
      <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Geometry · Math keys</p>
          <p className="text-xs text-muted-foreground">Tap to write right where your cursor is.</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {onBackspace && (
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={onBackspace}
              className="flex min-h-11 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95"
              aria-label="Delete selection or previous character" title="Backspace" data-testid="mathkb-key-Numbers-⌫">
              <Delete className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Delete</span>
            </button>
          )}
          {onClear && (
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={onClear}
              className="flex min-h-11 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95"
              aria-label="Clear entire answer" title="Clear all" data-testid="mathkb-key-Numbers-Clear">
              <Eraser className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>
      <div className="-mx-0.5 mb-2 flex gap-1.5 overflow-x-auto px-0.5 pb-1.5" role="tablist" aria-label="Geometry symbol groups">
        {tabs.map((tab, index) => (
          <button key={tab} type="button" role="tab" id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel`} aria-selected={activeTab === tab} tabIndex={activeTab === tab ? 0 : -1}
            onMouseDown={e => e.preventDefault()}
            onClick={() => setActiveTab(tab)}
            onKeyDown={e => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
              e.preventDefault();
              const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 :
                (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
              setActiveTab(tabs[next]);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
            className={`min-h-11 shrink-0 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${activeTab === tab ? TAB_DETAILS[tab].selected : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            data-testid={`mathkb-tab-${tab}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="mb-2 flex items-center gap-2 px-0.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
        <p className="text-xs font-medium text-muted-foreground">{detail.description}</p>
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tabs.indexOf(activeTab)}`}
        className={`grid gap-1.5 ${activeTab === "Numbers" ? "grid-cols-5" : "grid-cols-3 sm:grid-cols-4"}`}>
        {KEYS[activeTab].map((item, index) => (
          <button key={`${activeTab}-${index}`} type="button"
            onMouseDown={event => event.preventDefault()}
            onClick={() => onInsert(item.insert, item.cursorOffset)}
            aria-label={`Insert ${item.hint || item.label}`}
            title={item.hint ? `${item.label} · ${item.hint}` : item.label}
            className={`flex min-h-12 min-w-0 flex-col items-center justify-center rounded-lg border px-1.5 py-1 text-center text-foreground shadow-[0_1px_0_hsl(var(--border))] transition-[transform,background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.96] ${detail.tone} ${item.wide ? "col-span-2" : ""}`}
            data-testid={`mathkb-key-${activeTab}-${item.label}`}>
            <span className={`font-mono font-semibold leading-tight ${item.wide ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>{item.label}</span>
            {item.hint && activeTab !== "Numbers" && <span className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{item.hint}</span>}
          </button>
        ))}
      </div>
      <p className="mt-2 px-0.5 text-[11px] leading-snug text-muted-foreground">For () and fractions, keep typing inside the space. Select text to replace it.</p>
    </div>
  );
}