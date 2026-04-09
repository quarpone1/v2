import { useEffect, useMemo, useState, useCallback, useRef, type ComponentType, type ReactNode } from "react";
import { motion } from "motion/react";
import { Card } from "../components/Card";
import { patientsData } from "../../data/mock";
import {
  User,
  IdCard,
  Users,
  Layers,
  Share2,
  Scissors,
  FlaskConical,
  TestTube,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Eraser,
  Calculator as CalculatorIcon,
  Activity,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  BarChart3,
  Radar,
  Flame,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RadarShape,
} from "recharts";
import { cn } from "../../lib/utils";

type Horizon = 1 | 3 | 5;
type Outcome = "recurrence" | "death";

const STORAGE_KEY = "blohin_calc_v2";
const REQUIRED_MIN_FIELDS = 20;

function normalizePatientId(input: string | null | undefined) {
  const digits = String(input ?? "").replace(/\D/g, "");
  if (digits.length >= 6) return digits.slice(0, 12);
  return String(700000 + Math.floor(Math.random() * 200000));
}

type FormState = {
  patientId: string; // цифровой ID пациента, не редактируется
  sex: string;
  age: string;
  heightCm: string;
  weightKg: string;
  stage: string;
  pT: string;
  pN: string;
  pM: string;
  gradeG: string;
  lymphovascularInvasion: string;
  perineuralInvasion: string;
  nodesExamined: string;
  nodesAffected: string;
  nras: string;
  braf: string;
  kras: string;
  operation: string;
  surgicalAccess: string;
  adjuvantTherapy: string;
  adjuvantScheme: string;
  adjuvantCourses: string;
  radiotherapy: string;
  therapySite: string; // не входит в "30", но важно для сценариев визуализации
  cea: string;
  lymphocytesAbs: string;
  leukocytes: string;
  hemoglobin: string;
  platelets: string;
  ast: string;
  bilirubin: string;

  // опциональные (скрываемые)
  albumin: string;
  neutrophilsAbs: string;
  alkalinePhosphatase: string;
  fibrinogen: string;
  inr: string;
  diabetes: string;
  comorbidities: string;
};

const emptyForm = (): FormState => ({
  patientId: "",
  sex: "",
  age: "",
  heightCm: "",
  weightKg: "",
  stage: "",
  pT: "",
  pN: "",
  pM: "",
  gradeG: "",
  lymphovascularInvasion: "",
  perineuralInvasion: "",
  nodesExamined: "",
  nodesAffected: "",
  nras: "",
  braf: "",
  kras: "",
  operation: "",
  surgicalAccess: "",
  adjuvantTherapy: "",
  adjuvantScheme: "",
  adjuvantCourses: "",
  radiotherapy: "",
  therapySite: "",
  cea: "",
  lymphocytesAbs: "",
  leukocytes: "",
  hemoglobin: "",
  platelets: "",
  ast: "",
  bilirubin: "",

  albumin: "",
  neutrophilsAbs: "",
  alkalinePhosphatase: "",
  fibrinogen: "",
  inr: "",
  diabetes: "",
  comorbidities: "",
});

// "Условно референсный" пациент (медианы когорты) — для построения графиков и таблицы сравнения.
const COHORT_REFERENCE_FORM: FormState = {
  ...emptyForm(),
  patientId: "",
  sex: "жен",
  age: "63",
  heightCm: "168",
  weightKg: "76",
  stage: "II",
  pT: "T3",
  pN: "N0",
  pM: "M0",
  gradeG: "G2",
  lymphovascularInvasion: "L0",
  perineuralInvasion: "нет",
  nodesExamined: "14",
  nodesAffected: "0",
  nras: "не мутирован",
  braf: "не мутирован",
  kras: "не мутирован",
  operation: "Сигморезекция",
  surgicalAccess: "Робот-ассистированный доступ",
  adjuvantTherapy: "да",
  adjuvantScheme: "XELOX",
  adjuvantCourses: "6",
  radiotherapy: "нет",
  therapySite: "НМИЦ им. Н.Н. Блохина (стационар)",
  cea: "3.1",
  lymphocytesAbs: "1.6",
  leukocytes: "6.1",
  hemoglobin: "125",
  platelets: "260",
  ast: "24",
  bilirubin: "12",

  // опциональные (часто встречаются в расширенной выгрузке)
  albumin: "40",
  neutrophilsAbs: "3.7",
  alkalinePhosphatase: "88",
  fibrinogen: "3.1",
  inr: "1.0",
  diabetes: "нет",
  comorbidities: "",
};

// --- Валидация/модель факторов (внутренние расчёты для графиков) ---
type FactorId =
  | "age"
  | "stage"
  | "pN"
  | "pM"
  | "nodesAffected"
  | "cea"
  | "albumin"
  | "hemoglobin"
  | "ast"
  | "bilirubin"
  | "lvi"
  | "pni"
  | "bmi";

type FactorContrib = { id: FactorId; title: string; contribution: number; modifiable: boolean };

function stageToNum(stage: string): number {
  const m: Record<string, number> = { "0": 0, I: 1, II: 2, III: 3, IV: 4 };
  return m[stage] ?? 0;
}

function pNToNum(pN: string): number {
  const m: Record<string, number> = { N0: 0, N1: 1, N2: 2 };
  return m[pN] ?? 0;
}

function pMToNum(pM: string): number {
  const m: Record<string, number> = { M0: 0, M1: 1 };
  return m[pM] ?? 0;
}

function invasionToNum(v: string): number {
  return v === "L1" || v === "есть" ? 1 : 0;
}

function bmiFromFormForModel(form: FormState): number {
  const h = parseNum(form.heightCm);
  const w = parseNum(form.weightKg);
  if (h <= 0 || w <= 0) return 0;
  const m = h / 100;
  return Math.round((w / (m * m)) * 10) / 10;
}

const HORIZON_MULT: Record<Horizon, number> = { 1: 0.85, 3: 1.0, 5: 1.15 };
const OUTCOME_MULT: Record<Outcome, number> = { recurrence: 1.0, death: 1.08 };

const FACTOR_DEFS: Array<{
  id: FactorId;
  title: string;
  modifiable: boolean;
  scale: number;
  direction: 1 | -1; // +1 увеличивает риск, -1 уменьшает риск
  getValue: (f: FormState) => number;
}> = [
  { id: "age", title: "Возраст на момент лечения", modifiable: false, scale: 120, direction: 1, getValue: (f) => parseNum(f.age) },
  { id: "stage", title: "Стадия заболевания", modifiable: false, scale: 4, direction: 1, getValue: (f) => stageToNum(f.stage) },
  { id: "pN", title: "pN (поражённые лимфоузлы)", modifiable: false, scale: 2, direction: 1, getValue: (f) => pNToNum(f.pN) },
  { id: "pM", title: "pM", modifiable: false, scale: 1, direction: 1, getValue: (f) => pMToNum(f.pM) },
  { id: "nodesAffected", title: "Число поражённых лимфоузлов", modifiable: false, scale: 100, direction: 1, getValue: (f) => parseNum(f.nodesAffected) },
  { id: "cea", title: "РЭА до лечения", modifiable: true, scale: 200, direction: 1, getValue: (f) => parseNum(f.cea) },
  { id: "lvi", title: "Лимфоваскулярная инвазия", modifiable: false, scale: 1, direction: 1, getValue: (f) => invasionToNum(f.lymphovascularInvasion) },
  { id: "pni", title: "Периневральная инвазия", modifiable: false, scale: 1, direction: 1, getValue: (f) => invasionToNum(f.perineuralInvasion) },
  { id: "albumin", title: "Альбумин сыворотки", modifiable: true, scale: 80, direction: -1, getValue: (f) => parseNum(f.albumin) },
  { id: "hemoglobin", title: "Гемоглобин", modifiable: true, scale: 250, direction: -1, getValue: (f) => parseNum(f.hemoglobin) },
  { id: "ast", title: "АСТ", modifiable: false, scale: 1000, direction: 1, getValue: (f) => parseNum(f.ast) },
  { id: "bilirubin", title: "Билирубин общий", modifiable: false, scale: 500, direction: 1, getValue: (f) => parseNum(f.bilirubin) },
  { id: "bmi", title: "ИМТ", modifiable: false, scale: 45, direction: 1, getValue: (f) => bmiFromFormForModel(f) },
];

function getRiskAt(form: FormState, outcome: Outcome, horizon: Horizon): number {
  const probs = probsFromForm(form, outcome);
  if (horizon === 1) return probs.y1;
  if (horizon === 3) return probs.y3;
  return probs.y5;
}

function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) prob = 1 - prob;
  return prob;
}

function computeScaledFactorContribs(
  form: FormState,
  outcome: Outcome,
  horizon: Horizon,
  reference: FormState = COHORT_REFERENCE_FORM
): FactorContrib[] {
  const patientRisk = getRiskAt(form, outcome, horizon);
  const baselineRisk = getRiskAt(reference, outcome, horizon);
  const delta = patientRisk - baselineRisk;

  const rawValues = FACTOR_DEFS.map((d) => {
    const v = d.getValue(form);
    const r = d.getValue(reference);
    const rawInfluence = d.scale > 0 ? ((v - r) / d.scale) * d.direction : 0;
    return rawInfluence * 10 * HORIZON_MULT[horizon] * OUTCOME_MULT[outcome];
  });

  const sumSigned = rawValues.reduce((s, v) => s + v, 0);
  const sumAbs = rawValues.reduce((s, v) => s + Math.abs(v), 0);
  const denom = Math.abs(sumSigned) > 1e-9 ? sumSigned : sumAbs || 1;
  const scale = delta / denom;

  return FACTOR_DEFS.map((d, idx) => ({
    id: d.id,
    title: d.title,
    contribution: rawValues[idx] * scale,
    modifiable: d.modifiable,
  })).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

const REQUIRED_KEYS: (keyof FormState)[] = [
  "age",
  "stage",
  "pT",
  "pN",
  "pM",
  "gradeG",
  "lymphovascularInvasion",
  "nodesExamined",
  "nodesAffected",
  "nras",
  "cea",
  "operation",
  "surgicalAccess",
  "therapySite",
  "lymphocytesAbs",
  "leukocytes",
  "hemoglobin",
  "platelets",
  "ast",
  "bilirubin",
];

const REQUIRED_KEYS_SET = new Set<keyof FormState>(REQUIRED_KEYS);

const CE_ANORM_HINT = "норма ≤ 5 нг/мл";

function parseStrictNumeric(s: string): number | null {
  const cleaned = String(s ?? "").trim().replace(",", ".");
  if (!cleaned) return null;
  // Allow only digits with optional decimal separator, without any text.
  if (!/^-?\d*(?:\.\d+)?$/.test(cleaned) || !/[0-9]/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseNum(s: string): number {
  const n = parseStrictNumeric(s);
  return n == null ? 0 : Math.max(0, n); // clamp negatives to 0 (validation will surface an error)
}

const NUMERIC_RANGES: Partial<Record<keyof FormState, { min: number; max: number }>> = {
  age: { min: 0, max: 120 },
  heightCm: { min: 50, max: 250 },
  weightKg: { min: 20, max: 300 },

  nodesExamined: { min: 0, max: 100 },
  nodesAffected: { min: 0, max: 100 },
  adjuvantCourses: { min: 0, max: 20 },

  cea: { min: 0, max: 200 },
  lymphocytesAbs: { min: 0, max: 50 },
  leukocytes: { min: 0, max: 50 },
  hemoglobin: { min: 0, max: 250 },
  platelets: { min: 0, max: 1000 },
  ast: { min: 0, max: 1000 },
  bilirubin: { min: 0, max: 500 },

  // optional labs
  albumin: { min: 0, max: 80 },
  neutrophilsAbs: { min: 0, max: 50 },
  alkalinePhosphatase: { min: 0, max: 5000 },
  fibrinogen: { min: 0, max: 10 },
  inr: { min: 0, max: 10 },
};

const REQUIRED_NUMERIC_KEYS = REQUIRED_KEYS.filter((k) => NUMERIC_RANGES[k] != null);

function validateForm(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};

  (Object.keys(NUMERIC_RANGES) as (keyof FormState)[]).forEach((key) => {
    const range = NUMERIC_RANGES[key];
    if (!range) return;
    const raw = String(form[key] ?? "").trim();
    if (!raw) return; // empty is allowed for non-required fields

    const n = parseStrictNumeric(raw);
    if (n == null) {
      errors[key] = "Введите корректное число (без текста).";
      return;
    }
    if (n < range.min) {
      errors[key] = `Значение не может быть меньше ${range.min}.`;
      return;
    }
    if (n > range.max) {
      errors[key] = `Значение не может быть больше ${range.max}.`;
      return;
    }
  });

  return errors;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      setRect((prev) => {
        const w = Math.round(r.width);
        const h = Math.round(r.height);
        if (prev.width === w && prev.height === h) return prev;
        return { width: w, height: h };
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, rect };
}

function riskCategoryFromPct(pct: number): { label: string; tone: "low" | "mid" | "high" } {
  if (pct < 25) return { label: "Низкий (< 25)", tone: "low" };
  if (pct <= 75) return { label: "Средний (25–75)", tone: "mid" };
  return { label: "Высокий (> 75)", tone: "high" };
}

function riskColors(tone: "low" | "mid" | "high") {
  switch (tone) {
    case "low":
      return { bar: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-200" };
    case "mid":
      return { bar: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200" };
    case "high":
      return { bar: "bg-red-500", text: "text-red-700", ring: "ring-red-200" };
  }
}

function horizonLabel(years: 1 | 3 | 5) {
  if (years === 1) return "1 год";
  if (years === 3) return "3 года";
  return "5 лет";
}

type TrajectoryKind = "stable" | "smooth" | "sharp" | "decline";

function trajectoryFromProbs(y1: number, y3: number, y5: number): { kind: TrajectoryKind; label: string } {
  const d13 = y3 - y1;
  const d35 = y5 - y3;

  if (d13 < 0 && d35 < 0) {
    return { kind: "decline", label: "Снижение вероятности со временем" };
  }
  if (d13 > 15 || d35 > 15) {
    return { kind: "sharp", label: "Резкий рост риска между горизонтами" };
  }
  const smooth13 = d13 >= 5 && d13 <= 15;
  const smooth35 = d35 >= 5 && d35 <= 15;
  if (smooth13 && smooth35) {
    return { kind: "smooth", label: "Плавный рост риска (5–15 п.п. между горизонтами)" };
  }
  if (Math.abs(d13) < 5 && Math.abs(d35) < 5) {
    return { kind: "stable", label: "Стабильная траектория риска" };
  }
  if (smooth13 || smooth35) {
    return { kind: "smooth", label: "Плавный рост риска (5–15 п.п. между горизонтами)" };
  }
  return { kind: "stable", label: "Стабильная траектория риска" };
}

function TrajectoryIcon({ kind }: { kind: TrajectoryKind }) {
  const cls = "size-5 shrink-0";
  switch (kind) {
    case "stable":
      return <Minus className={cls} aria-hidden />;
    case "smooth":
      return <TrendingUp className={cls} aria-hidden />;
    case "sharp":
      return <Activity className={cls} aria-hidden />;
    case "decline":
      return <TrendingDown className={cls} aria-hidden />;
  }
}

const OPERATION_OPTIONS = [
  "— выберите —",
  "Гемиколэктомия справа",
  "Расширенная гемиклолоправая резекция",
  "Сигморезекция",
  "Низкая передняя резекция прямой кишки",
  "Сохранение сфинктера (с межсфинктерной диссекцией)",
  "Абдоминоперинальная экстирпация прямой кишки",
  "Субтотальная / тотальная колэктомия",
  "Дистальная / сегментарная резекция толстой кишки",
  "Метастазэктомия печени (одномоментно с резекцией первичной опухоли)",
  "Обходное анастомозирование / стомирование (паллиативно)",
];

const ACCESS_OPTIONS = [
  "— выберите —",
  "Лапаротомный доступ",
  "Лапароскопический доступ",
  "Робот-ассистированный доступ",
  "Конверсия (лапароскопия → лапаротомия)",
];

const SITE_OPTIONS = [
  "— выберите —",
  "НМИЦ им. Н.Н. Блохина (стационар)",
  "Дневной стационар",
  "Поликлиническое звено (амбулаторно)",
  "Периферийный онкологический диспансер",
];

function probsFromForm(f: FormState, outcome: Outcome): { y1: number; y3: number; y5: number } {
  const seed =
    parseNum(f.age) * 1.1 +
    parseNum(f.cea) * 0.4 +
    parseNum(f.nodesAffected) * 3 +
    parseNum(f.ast) * 0.05;
  const oBias = outcome === "death" ? 1.15 : 1.0;
  const base = 8 + ((seed * oBias) % 44);
  const y1 = clamp(base * 0.45 + (outcome === "death" ? 2.5 : 0), 2, 95);
  const y3 = clamp(Math.max(y1 + 2, base * 0.85), 3, 96);
  const y5 = clamp(Math.max(y3 + 2, base * 1.05), 4, 97);
  return {
    y1: Math.round(y1 * 10) / 10,
    y3: Math.round(y3 * 10) / 10,
    y5: Math.round(y5 * 10) / 10,
  };
}

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
const labelCls = "text-xs font-semibold text-slate-600";

type CollapsibleKey = "top" | "form" | "results";
type OptionalGroupKey = "demography" | "tumor" | "molecular" | "treatment" | "labs";

function completionStats(form: FormState) {
  const coreKeys: (keyof FormState)[] = [
    "sex",
    "age",
    "heightCm",
    "weightKg",
    "stage",
    "pT",
    "pN",
    "pM",
    "gradeG",
    "lymphovascularInvasion",
    "perineuralInvasion",
    "nodesExamined",
    "nodesAffected",
    "nras",
    "braf",
    "kras",
    "operation",
    "surgicalAccess",
    "adjuvantTherapy",
    "adjuvantScheme",
    "adjuvantCourses",
    "radiotherapy",
    "cea",
    "lymphocytesAbs",
    "leukocytes",
    "hemoglobin",
    "platelets",
    "ast",
    "bilirubin",
  ];

  const filledCore = coreKeys.reduce((acc, k) => acc + (String(form[k] ?? "").trim() ? 1 : 0), 0);
  const totalCore = coreKeys.length; // 30
  const pct = Math.round((filledCore / totalCore) * 100);

  return { filledCore, totalCore, pct };
}

function requiredCompletionStats(form: FormState) {
  const total = REQUIRED_KEYS.length;
  const filled = REQUIRED_KEYS.reduce((acc, k) => acc + (String(form[k] ?? "").trim() ? 1 : 0), 0);
  return { filled, total };
}

function groupCompletion(form: FormState) {
  const groups: { key: string; title: string; fields: (keyof FormState)[] }[] = [
    { key: "g1", title: "Демография и идентификация", fields: ["sex", "age", "heightCm", "weightKg"] },
    {
      key: "g2",
      title: "Опухолевая характеристика",
      fields: ["stage", "pT", "pN", "pM", "gradeG", "lymphovascularInvasion", "perineuralInvasion", "nodesExamined", "nodesAffected"],
    },
    { key: "g3", title: "Молекулярно-генетические маркеры", fields: ["nras", "braf", "kras"] },
    { key: "g4", title: "Лечение", fields: ["operation", "surgicalAccess", "adjuvantTherapy", "adjuvantScheme", "adjuvantCourses", "radiotherapy"] },
    { key: "g5", title: "Онкомаркеры", fields: ["cea"] },
    {
      key: "g6",
      title: "Лабораторные показатели",
      fields: ["lymphocytesAbs", "leukocytes", "hemoglobin", "platelets", "ast", "bilirubin"],
    },
    { key: "g7", title: "Статус и сопутствующие заболевания", fields: ["diabetes", "comorbidities"] },
  ];

  const rows = groups.map((g) => {
    const filled = g.fields.reduce((acc, k) => acc + (String(form[k] ?? "").trim() ? 1 : 0), 0);
    const total = g.fields.length;
    const pct = total ? Math.round((filled / total) * 100) : 0;
    return { ...g, filled, total, pct };
  });
  return rows;
}

function qualityTone(filledCore: number) {
  if (filledCore >= 22) return "good" as const;
  if (filledCore >= REQUIRED_MIN_FIELDS) return "mid" as const;
  return "bad" as const;
}

function toneBadge(tone: ReturnType<typeof qualityTone>) {
  switch (tone) {
    case "good":
      return { Icon: ShieldCheck, label: "Данных достаточно", cls: "text-emerald-700 bg-emerald-50 border-emerald-100" };
    case "mid":
      return { Icon: ShieldAlert, label: "Данных умеренно", cls: "text-amber-700 bg-amber-50 border-amber-100" };
    case "bad":
      return { Icon: ShieldX, label: "Данных недостаточно", cls: "text-red-700 bg-red-50 border-red-100" };
  }
}

export function Calculator() {
  const [form, setForm] = useState<FormState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyForm();
      const parsed = JSON.parse(raw) as Partial<FormState> | null;
      const merged = { ...emptyForm(), ...(parsed ?? {}) };
      merged.patientId = "";
      return merged;
    } catch {
      return emptyForm();
    }
  });
  const [factorHorizon, setFactorHorizon] = useState<Horizon>(1);
  const [factorOutcome, setFactorOutcome] = useState<Outcome>("recurrence");
  const [hasResult, setHasResult] = useState(false);
  const [showExtraOptions, setShowExtraOptions] = useState<Record<OptionalGroupKey, boolean>>({
    demography: false,
    tumor: false,
    molecular: false,
    treatment: false,
    labs: false,
  });
  const [enrichInfo, setEnrichInfo] = useState<{ filled: number } | null>(null);
  const [accuracyWarning, setAccuracyWarning] = useState(false);
  const [simulationForm, setSimulationForm] = useState<FormState | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<CollapsibleKey, boolean>>({
    top: false,
    form: false,
    results: false,
  });

  const bmi = useMemo(() => {
    const h = parseNum(form.heightCm);
    const w = parseNum(form.weightKg);
    if (h <= 0 || w <= 0) return null;
    const m = h / 100;
    const v = w / (m * m);
    return Math.round(v * 10) / 10;
  }, [form.heightCm, form.weightKg]);

  const probsRec = useMemo(() => probsFromForm(form, "recurrence"), [form]);
  const probsDeath = useMemo(() => probsFromForm(form, "death"), [form]);
  const trajRec = useMemo(() => trajectoryFromProbs(probsRec.y1, probsRec.y3, probsRec.y5), [probsRec]);
  const trajDeath = useMemo(() => trajectoryFromProbs(probsDeath.y1, probsDeath.y3, probsDeath.y5), [probsDeath]);

  const { filledCore, totalCore, pct: completionPct } = useMemo(() => completionStats(form), [form]);
  const { filled: filledRequired, total: totalRequired } = useMemo(() => requiredCompletionStats(form), [form]);
  const missingRequiredKeys = useMemo(
    () => new Set<keyof FormState>(REQUIRED_KEYS.filter((k) => !String(form[k] ?? "").trim())),
    [form]
  );
  const hasMissingRequired = missingRequiredKeys.size > 0;
  const validationErrors = useMemo(() => validateForm(form), [form]);
  const blockingValidationErrors = REQUIRED_NUMERIC_KEYS.some((k) => Boolean(validationErrors[k]));
  const qTone = useMemo(() => qualityTone(filledCore), [filledCore]);
  const qBadge = useMemo(() => toneBadge(qTone), [qTone]);
  const factorContribsForUI = useMemo(() => computeScaledFactorContribs(form, factorOutcome, factorHorizon), [form, factorOutcome, factorHorizon]);
  const patientRiskSelected = useMemo(() => getRiskAt(form, factorOutcome, factorHorizon), [form, factorOutcome, factorHorizon]);
  const effectiveFormForRecommendations = simulationForm ?? form;
  const patientRiskAfterSimulation = useMemo(
    () => getRiskAt(effectiveFormForRecommendations, factorOutcome, factorHorizon),
    [effectiveFormForRecommendations, factorOutcome, factorHorizon]
  );
  const requiredStarHint = `Обязательное поле для расчёта прогноза (${REQUIRED_MIN_FIELDS} из ${REQUIRED_KEYS.length}).`;
  const reqLabel = (key: keyof FormState, text: string) => (
    <>
      {text}
      {REQUIRED_KEYS_SET.has(key) ? (
        <span className="ml-1 text-red-600 font-bold" title={requiredStarHint} aria-hidden>
          *
        </span>
      ) : null}
    </>
  );
  const withRequiredHighlight = (key: keyof FormState, extraClass?: string) =>
    cn(
      inputCls,
      submitAttempted && missingRequiredKeys.has(key) ? "border-red-500 bg-red-50/40 focus:ring-red-500/30" : null,
      extraClass ?? null
    );

  const cohortBands = useMemo(
    () => [
      {
        x: 1,
        patientRec: probsRec.y1,
        patientDeath: probsDeath.y1,
        median: Math.max(5, probsRec.y1 - 2 + (probsRec.y3 % 5)),
        q1: Math.max(2, probsRec.y1 - 8),
        q3: Math.min(92, probsRec.y1 + 10),
      },
      {
        x: 3,
        patientRec: probsRec.y3,
        patientDeath: probsDeath.y3,
        median: Math.max(8, probsRec.y3 - 3 + (probsRec.y5 % 4)),
        q1: Math.max(3, probsRec.y3 - 12),
        q3: Math.min(94, probsRec.y3 + 12),
      },
      {
        x: 5,
        patientRec: probsRec.y5,
        patientDeath: probsDeath.y5,
        median: Math.max(10, probsRec.y5 - 4 + (probsRec.y1 % 6)),
        q1: Math.max(4, probsRec.y5 - 14),
        q3: Math.min(96, probsRec.y5 + 14),
      },
    ],
    [probsRec, probsDeath]
  );

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...form, patientId: "" }));
    } catch {
      // ignore
    }
  }, [form]);

  // Моделирование должно быть временным: при изменении исходных данных сбрасываем симуляцию.
  useEffect(() => {
    if (simulationForm) setSimulationForm(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const toggleCollapsed = (key: CollapsibleKey) => {
    setCollapsed((p) => ({ ...p, [key]: !p[key] }));
  };
  const toggleOptional = (key: OptionalGroupKey) => {
    setShowExtraOptions((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleLoad = () => {
    const p = patientsData[0];
    if (!p) return;
    setForm({
      ...emptyForm(),
      patientId: normalizePatientId(p.id),
      sex: "муж",
      age: String(p.age ?? 62),
      heightCm: "172",
      weightKg: "78",
      stage: "III",
      pT: "T3",
      pN: "N1",
      pM: "M0",
      gradeG: "G2",
      lymphovascularInvasion: "L0",
      perineuralInvasion: "",
      nodesExamined: "12",
      nodesAffected: p.stage === "III" || p.stage === "IV" ? "3" : "1",
      nras: "",
      braf: "",
      kras: "",
      operation: OPERATION_OPTIONS[3] ?? "",
      surgicalAccess: ACCESS_OPTIONS[1] ?? "",
      adjuvantTherapy: "",
      adjuvantScheme: "",
      adjuvantCourses: "",
      radiotherapy: "нет",
      therapySite: SITE_OPTIONS[1] ?? "",
      cea: "18.2",
      lymphocytesAbs: "1.2",
      leukocytes: "6.8",
      hemoglobin: "118",
      platelets: "240",
      ast: "32",
      bilirubin: "14",
      albumin: "",
      neutrophilsAbs: "",
      alkalinePhosphatase: "",
      fibrinogen: "",
      inr: "",
      diabetes: "",
      comorbidities: "",
    });
    setEnrichInfo(null);
    setAccuracyWarning(false);
    setSubmitAttempted(false);
  };

  const handleEnrichFromCohort = () => {
    const typical: Partial<FormState> = {
      sex: "жен",
      age: "63",
      heightCm: "168",
      weightKg: "76",
      stage: "II",
      pT: "T3",
      pN: "N0",
      pM: "M0",
      gradeG: "G2",
      lymphovascularInvasion: "L0",
      perineuralInvasion: "нет",
      nodesExamined: "14",
      nodesAffected: "0",
      nras: "не мутирован",
      braf: "не мутирован",
      kras: "не мутирован",
      operation: OPERATION_OPTIONS[2] ?? "",
      surgicalAccess: ACCESS_OPTIONS[2] ?? "",
      adjuvantTherapy: "да",
      adjuvantScheme: "XELOX",
      adjuvantCourses: "6",
      radiotherapy: "нет",
      therapySite: SITE_OPTIONS[1] ?? "",
      cea: "3.1",
      lymphocytesAbs: "1.6",
      leukocytes: "6.1",
      hemoglobin: "125",
      platelets: "260",
      ast: "24",
      bilirubin: "12",

      albumin: "40",
      neutrophilsAbs: "3.7",
      alkalinePhosphatase: "88",
      fibrinogen: "3.1",
      inr: "1.0",
      diabetes: "нет",
      comorbidities: "",
    };

    setForm((prev) => {
      const beforeFilled = completionStats(prev).filledCore;
      const next = { ...prev };
      (Object.keys(typical) as (keyof FormState)[]).forEach((k) => {
        if (!String(next[k] ?? "").trim()) {
          const v = typical[k];
          if (v != null) next[k] = v as FormState[typeof k];
        }
      });
      const afterFilled = completionStats(next).filledCore;
      const delta = Math.max(0, afterFilled - beforeFilled);
      setAccuracyWarning(delta > 0);
      setEnrichInfo(delta > 0 ? { filled: delta } : null);
      return next;
    });
    setSubmitAttempted(false);
  };

  const handleClear = () => {
    setHasResult(false);
    setForm(emptyForm());
    setEnrichInfo(null);
    setAccuracyWarning(false);
    setSimulationForm(null);
    setSubmitAttempted(false);
  };

  const handleCalculate = () => {
    setSubmitAttempted(true);
    if (hasMissingRequired || blockingValidationErrors) {
      setHasResult(false);
      return;
    }
    setHasResult(true);
    setAccuracyWarning(false);
    setSimulationForm(null);
  };

  const riskCardsRec: { h: Horizon; pct: number }[] = [
    { h: 1, pct: probsRec.y1 },
    { h: 3, pct: probsRec.y3 },
    { h: 5, pct: probsRec.y5 },
  ];
  const riskCardsDeath: { h: Horizon; pct: number }[] = [
    { h: 1, pct: probsDeath.y1 },
    { h: 3, pct: probsDeath.y3 },
    { h: 5, pct: probsDeath.y5 },
  ];

  const [activeTab, setActiveTab] = useState<
    "line" | "heat" | "radar" | "bar" | "cohort" | "waterfall" | "hist" | "compare" | "parallel"
  >("line");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-1 py-4 sm:px-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-4"
      >
        {/* Верхняя зона ~15% (сворачиваемая) */}
        <section
          className="flex w-full flex-shrink-0 flex-col rounded-[28px] border border-white/70 bg-white/55 shadow-sm backdrop-blur-md"
          aria-labelledby="blohin-prognosis-title"
        >
          <button
            type="button"
            onClick={() => toggleCollapsed("top")}
            className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8"
            aria-expanded={!collapsed.top}
          >
            <div className="min-w-0 text-left">
              <h1 id="blohin-prognosis-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Индивидуальный прогноз
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
                30 прогностических параметров. Два исхода: рецидив и летальный исход. Горизонты: 1, 3 и 5 лет.
              </p>
            </div>
            <ChevronDown className={cn("size-5 shrink-0 text-slate-500 transition-transform", collapsed.top ? "-rotate-90" : "rotate-0")} aria-hidden />
          </button>

          {!collapsed.top && (
            <div className="px-5 pb-5 sm:px-8">
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <IdCard className="size-4" aria-hidden />
                    ID пациента
                  </div>
                  <div className="mt-1 text-xl font-black tabular-nums text-slate-900">{form.patientId}</div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <Users className="size-4" aria-hidden />
                    Заполнение формы
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${completionPct}%` }} />
                    </div>
                    <div className="w-16 text-right text-sm font-bold tabular-nums text-slate-700">{completionPct}%</div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Заполнено: <span className="font-semibold tabular-nums">{filledCore}</span> из{" "}
                    <span className="font-semibold tabular-nums">{totalCore}</span>
                  </p>
                </div>

                <div className={cn("rounded-2xl border px-4 py-3", qBadge.cls)}>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide opacity-80">
                    <qBadge.Icon className="size-4" aria-hidden />
                    Достаточность данных
                  </div>
                  <div className="mt-1 text-base font-bold">{qBadge.label}</div>
                  <p className="mt-1 text-xs opacity-80">
                    Для расчёта должны быть заполнены все обязательные поля. Сейчас:{" "}
                    <span className="font-semibold tabular-nums">{filledRequired}</span> из{" "}
                    <span className="font-semibold tabular-nums">{totalRequired}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid w-full min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-4 lg:grid-rows-none">
          {/* Центральная зона ~50% — форма */}
          <section
            className={cn("w-full flex-shrink-0", collapsed.form ? "min-h-0" : "min-h-[42vh] lg:min-h-[48vh]")}
            aria-label="Форма ввода параметров"
          >
            <Card className="flex h-full flex-col overflow-hidden p-0">
              <button
                type="button"
                onClick={() => toggleCollapsed("form")}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-7"
                aria-expanded={!collapsed.form}
              >
                <div className="min-w-0 text-left">
                  <h2 className="text-lg font-bold text-slate-800">Параметры для расчёта</h2>
                </div>
                <ChevronDown className={cn("size-5 shrink-0 text-slate-500 transition-transform", collapsed.form ? "-rotate-90" : "rotate-0")} aria-hidden />
              </button>

              {!collapsed.form && (
                <div className="px-5 pb-6 sm:px-7">
                  <div className="mt-6 space-y-6">
                    <FormGroup icon={User} title="Демография и идентификация">
                      <Field label={reqLabel("age", "Возраст, лет")}>
                        <input
                          className={withRequiredHighlight("age", validationErrors.age ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined)}
                          inputMode="numeric"
                          value={form.age}
                          onChange={(e) => setField("age", e.target.value)}
                          title={validationErrors.age ?? undefined}
                          aria-invalid={Boolean(validationErrors.age)}
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => toggleOptional("demography")}
                        className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left"
                        aria-expanded={showExtraOptions.demography}
                      >
                        <span className="text-sm font-bold text-slate-800">Демография - дополнительные параметры</span>
                        <ChevronDown
                          className={cn("size-5 text-slate-500 transition-transform", showExtraOptions.demography ? "rotate-0" : "-rotate-90")}
                          aria-hidden
                        />
                      </button>
                      {showExtraOptions.demography && (
                        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
                          <div className="grid gap-4">
                            <Field label="Пол">
                              <select className={inputCls} value={form.sex} onChange={(e) => setField("sex", e.target.value)}>
                                <option value="">— выберите —</option>
                                <option value="жен">жен</option>
                                <option value="муж">муж</option>
                              </select>
                            </Field>
                            <Field label="Рост, см">
                              <input
                                className={cn(inputCls, validationErrors.heightCm ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : null)}
                                inputMode="decimal"
                                value={form.heightCm}
                                onChange={(e) => setField("heightCm", e.target.value)}
                                title={validationErrors.heightCm ?? undefined}
                                aria-invalid={Boolean(validationErrors.heightCm)}
                              />
                            </Field>
                            <Field label="Вес, кг">
                              <input
                                className={cn(inputCls, validationErrors.weightKg ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : null)}
                                inputMode="decimal"
                                value={form.weightKg}
                                onChange={(e) => setField("weightKg", e.target.value)}
                                title={validationErrors.weightKg ?? undefined}
                                aria-invalid={Boolean(validationErrors.weightKg)}
                              />
                            </Field>
                            <Field label="ИМТ, кг/м²">
                              <input className={cn(inputCls, "bg-slate-100/70")} readOnly value={bmi != null ? String(bmi) : "—"} />
                            </Field>
                          </div>
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup icon={Layers} title="Опухолевая характеристика">
                      <Field label={reqLabel("stage", "Стадия заболевания")}>
                        <select className={withRequiredHighlight("stage")} value={form.stage} onChange={(e) => setField("stage", e.target.value)}>
                          <option value="">— выберите —</option>
                          <option value="0">0 стадия: Карцинома</option>
                          <option value="I">I стадия: Локализованная опухоль, обычно небольшого размера</option>
                          <option value="II">II стадия: Местно-распространенная опухоль, без метастазов в лимфоузлы</option>
                          <option value="III">III стадия: Наличие метастазов в регионарные лимфатические узлы</option>
                          <option value="IV">IV стадия: Наличие отдаленных метастазов (M1)</option>
                        </select>
                      </Field>
                      <Field label={reqLabel("pT", "pT")}>
                        <select className={withRequiredHighlight("pT")} value={form.pT} onChange={(e) => setField("pT", e.target.value)}>
                          <option value="">— выберите —</option>
                          <option value="Tis">Tis</option>
                          <option value="T1">T1</option>
                          <option value="T2">T2</option>
                          <option value="T3">T3</option>
                          <option value="T4">T4</option>
                        </select>
                      </Field>
                      <Field label={reqLabel("pN", "pN")}>
                        <select className={withRequiredHighlight("pN")} value={form.pN} onChange={(e) => setField("pN", e.target.value)}>
                          <option value="">— выберите —</option>
                          <option value="N0">N0</option>
                          <option value="N1">N1</option>
                          <option value="N2">N2</option>
                        </select>
                      </Field>
                      <Field label={reqLabel("pM", "pM")}>
                        <select className={withRequiredHighlight("pM")} value={form.pM} onChange={(e) => setField("pM", e.target.value)}>
                          <option value="">— выберите —</option>
                          <option value="M0">M0</option>
                          <option value="M1">M1</option>
                        </select>
                      </Field>
                      <Field label={reqLabel("gradeG", "Степень дифференцировки (G)")}>
                        <select className={withRequiredHighlight("gradeG")} value={form.gradeG} onChange={(e) => setField("gradeG", e.target.value)}>
                          <option value="">— выберите —</option>
                          <option value="GX">GX (не может быть определена)</option>
                          <option value="G1">G1 (высокая)</option>
                          <option value="G2">G2 (умеренная)</option>
                          <option value="G3">G3 (низкая)</option>
                          <option value="G4">G4 (недифференцированная)</option>
                        </select>
                      </Field>
                      <Field label={reqLabel("lymphovascularInvasion", "Лимфоваскулярная инвазия")}>
                        <select className={withRequiredHighlight("lymphovascularInvasion")} value={form.lymphovascularInvasion} onChange={(e) => setField("lymphovascularInvasion", e.target.value)}>
                          <option value="">— выберите —</option>
                          <option value="L0">L0 (отсутствует)</option>
                          <option value="L1">L1 (присутствует)</option>
                          <option value="LX">LX (невозможно оценить)</option>
                        </select>
                      </Field>
                      <Field label={reqLabel("nodesExamined", "Изучено лимфоузлов")}>
                        <input
                          className={withRequiredHighlight(
                            "nodesExamined",
                            validationErrors.nodesExamined ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined
                          )}
                          inputMode="numeric"
                          value={form.nodesExamined}
                          onChange={(e) => setField("nodesExamined", e.target.value)}
                          title={validationErrors.nodesExamined ?? undefined}
                          aria-invalid={Boolean(validationErrors.nodesExamined)}
                        />
                      </Field>
                      <Field label={reqLabel("nodesAffected", "Поражено лимфоузлов")}>
                        <input
                          className={withRequiredHighlight(
                            "nodesAffected",
                            validationErrors.nodesAffected ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined
                          )}
                          inputMode="numeric"
                          value={form.nodesAffected}
                          onChange={(e) => setField("nodesAffected", e.target.value)}
                          title={validationErrors.nodesAffected ?? undefined}
                          aria-invalid={Boolean(validationErrors.nodesAffected)}
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => toggleOptional("tumor")}
                        className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left"
                        aria-expanded={showExtraOptions.tumor}
                      >
                        <span className="text-sm font-bold text-slate-800">Опухоль - дополнительные параметры</span>
                        <ChevronDown className={cn("size-5 text-slate-500 transition-transform", showExtraOptions.tumor ? "rotate-0" : "-rotate-90")} aria-hidden />
                      </button>
                      {showExtraOptions.tumor && (
                        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
                          <Field label="Периневральная инвазия">
                            <select className={inputCls} value={form.perineuralInvasion} onChange={(e) => setField("perineuralInvasion", e.target.value)}>
                              <option value="">— выберите —</option>
                              <option value="есть">есть</option>
                              <option value="нет">нет</option>
                            </select>
                          </Field>
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup icon={Share2} title="Молекулярно-генетические маркеры">
                      <Field label={reqLabel("nras", "NRAS")}>
                        <select className={withRequiredHighlight("nras")} value={form.nras} onChange={(e) => setField("nras", e.target.value)}>
                          <option value="">— выберите —</option>
                          <option value="мутирован">мутирован</option>
                          <option value="не мутирован">не мутирован</option>
                        </select>
                      </Field>
                      <button
                        type="button"
                        onClick={() => toggleOptional("molecular")}
                        className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left"
                        aria-expanded={showExtraOptions.molecular}
                      >
                        <span className="text-sm font-bold text-slate-800">Молекулярные - дополнительные параметры</span>
                        <ChevronDown className={cn("size-5 text-slate-500 transition-transform", showExtraOptions.molecular ? "rotate-0" : "-rotate-90")} aria-hidden />
                      </button>
                      {showExtraOptions.molecular && (
                        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
                          <div className="grid gap-4">
                            <Field label="BRAF">
                              <select className={inputCls} value={form.braf} onChange={(e) => setField("braf", e.target.value)}>
                                <option value="">— выберите —</option>
                                <option value="мутирован">мутирован</option>
                                <option value="не мутирован">не мутирован</option>
                              </select>
                            </Field>
                            <Field label="KRAS">
                              <select className={inputCls} value={form.kras} onChange={(e) => setField("kras", e.target.value)}>
                                <option value="">— выберите —</option>
                                <option value="мутирован">мутирован</option>
                                <option value="не мутирован">не мутирован</option>
                              </select>
                            </Field>
                          </div>
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup icon={Scissors} title="Лечение">
                      <Field label={reqLabel("operation", "Название операции")}>
                        <select className={withRequiredHighlight("operation")} value={form.operation} onChange={(e) => setField("operation", e.target.value)}>
                          {OPERATION_OPTIONS.map((o) => (
                            <option key={o} value={o === "— выберите —" ? "" : o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={reqLabel("surgicalAccess", "Хирургический доступ")}>
                        <select className={withRequiredHighlight("surgicalAccess")} value={form.surgicalAccess} onChange={(e) => setField("surgicalAccess", e.target.value)}>
                          {ACCESS_OPTIONS.map((o) => (
                            <option key={o} value={o === "— выберите —" ? "" : o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={reqLabel("therapySite", "Место лечения")}>
                        <select className={withRequiredHighlight("therapySite")} value={form.therapySite} onChange={(e) => setField("therapySite", e.target.value)}>
                          {SITE_OPTIONS.map((o) => (
                            <option key={o} value={o === "— выберите —" ? "" : o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <button
                        type="button"
                        onClick={() => toggleOptional("treatment")}
                        className="inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left"
                        aria-expanded={showExtraOptions.treatment}
                      >
                        <span className="text-sm font-bold text-slate-800">Лечение - дополнительные параметры</span>
                        <ChevronDown className={cn("size-5 text-slate-500 transition-transform", showExtraOptions.treatment ? "rotate-0" : "-rotate-90")} aria-hidden />
                      </button>
                      {showExtraOptions.treatment && (
                        <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
                          <div className="grid gap-4">
                            <Field label="Адъювантная терапия">
                              <select className={inputCls} value={form.adjuvantTherapy} onChange={(e) => setField("adjuvantTherapy", e.target.value)}>
                                <option value="">— выберите —</option>
                                <option value="да">да</option>
                                <option value="нет">нет</option>
                              </select>
                            </Field>
                            <Field label="Схема адъювантной терапии">
                              <select className={inputCls} value={form.adjuvantScheme} onChange={(e) => setField("adjuvantScheme", e.target.value)}>
                                <option value="">— выберите —</option>
                                <option value="FOLFOX">FOLFOX</option>
                                <option value="XELOX">XELOX</option>
                                <option value="FLOX">FLOX</option>
                                <option value="капецитабин">капецитабин</option>
                              </select>
                            </Field>
                            <Field label="Количество курсов адъювантной терапии">
                              <input
                                className={cn(inputCls, validationErrors.adjuvantCourses ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : null)}
                                inputMode="numeric"
                                value={form.adjuvantCourses}
                                onChange={(e) => setField("adjuvantCourses", e.target.value)}
                                title={validationErrors.adjuvantCourses ?? undefined}
                                aria-invalid={Boolean(validationErrors.adjuvantCourses)}
                              />
                            </Field>
                            <Field label="Лучевая терапия">
                              <select className={inputCls} value={form.radiotherapy} onChange={(e) => setField("radiotherapy", e.target.value)}>
                                <option value="">— выберите —</option>
                                <option value="да">да</option>
                                <option value="нет">нет</option>
                              </select>
                            </Field>
                          </div>
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup icon={FlaskConical} title="Онкомаркеры">
                      <Field label={reqLabel("cea", `РЭА до лечения, нг/мл (${CE_ANORM_HINT})`)}>
                        <input
                          className={withRequiredHighlight("cea", validationErrors.cea ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined)}
                          inputMode="decimal"
                          value={form.cea}
                          onChange={(e) => setField("cea", e.target.value)}
                          title={validationErrors.cea ?? undefined}
                          aria-invalid={Boolean(validationErrors.cea)}
                        />
                      </Field>
                    </FormGroup>

                    <FormGroup icon={TestTube} title="Лабораторные показатели">
                      <div className="grid gap-4">
                        <Field label={reqLabel("lymphocytesAbs", "Лимфоциты (абс.), ×10⁹/л")}>
                          <input
                            className={withRequiredHighlight(
                              "lymphocytesAbs",
                              validationErrors.lymphocytesAbs ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined
                            )}
                            inputMode="decimal"
                            value={form.lymphocytesAbs}
                            onChange={(e) => setField("lymphocytesAbs", e.target.value)}
                            title={validationErrors.lymphocytesAbs ?? undefined}
                            aria-invalid={Boolean(validationErrors.lymphocytesAbs)}
                          />
                        </Field>
                        <Field label={reqLabel("leukocytes", "Лейкоциты, ×10⁹/л")}>
                          <input
                            className={withRequiredHighlight(
                              "leukocytes",
                              validationErrors.leukocytes ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined
                            )}
                            inputMode="decimal"
                            value={form.leukocytes}
                            onChange={(e) => setField("leukocytes", e.target.value)}
                            title={validationErrors.leukocytes ?? undefined}
                            aria-invalid={Boolean(validationErrors.leukocytes)}
                          />
                        </Field>
                        <Field label={reqLabel("hemoglobin", "Гемоглобин, г/л")}>
                          <input
                            className={withRequiredHighlight(
                              "hemoglobin",
                              validationErrors.hemoglobin ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined
                            )}
                            inputMode="numeric"
                            value={form.hemoglobin}
                            onChange={(e) => setField("hemoglobin", e.target.value)}
                            title={validationErrors.hemoglobin ?? undefined}
                            aria-invalid={Boolean(validationErrors.hemoglobin)}
                          />
                        </Field>
                        <Field label={reqLabel("platelets", "Тромбоциты, ×10⁹/л")}>
                          <input
                            className={withRequiredHighlight(
                              "platelets",
                              validationErrors.platelets ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined
                            )}
                            inputMode="numeric"
                            value={form.platelets}
                            onChange={(e) => setField("platelets", e.target.value)}
                            title={validationErrors.platelets ?? undefined}
                            aria-invalid={Boolean(validationErrors.platelets)}
                          />
                        </Field>
                        <Field label={reqLabel("ast", "АСТ, Ед/л")}>
                          <input
                            className={withRequiredHighlight("ast", validationErrors.ast ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined)}
                            inputMode="numeric"
                            value={form.ast}
                            onChange={(e) => setField("ast", e.target.value)}
                            title={validationErrors.ast ?? undefined}
                            aria-invalid={Boolean(validationErrors.ast)}
                          />
                        </Field>
                        <Field label={reqLabel("bilirubin", "Билирубин общий, мкмоль/л")}>
                          <input
                            className={withRequiredHighlight(
                              "bilirubin",
                              validationErrors.bilirubin ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : undefined
                            )}
                            inputMode="decimal"
                            value={form.bilirubin}
                            onChange={(e) => setField("bilirubin", e.target.value)}
                            title={validationErrors.bilirubin ?? undefined}
                            aria-invalid={Boolean(validationErrors.bilirubin)}
                          />
                        </Field>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleOptional("labs")}
                        className="mt-4 inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left"
                        aria-expanded={showExtraOptions.labs}
                      >
                        <span className="text-sm font-bold text-slate-800">Лаборатория - дополнительные параметры</span>
                        <ChevronDown className={cn("size-5 text-slate-500 transition-transform", showExtraOptions.labs ? "rotate-0" : "-rotate-90")} aria-hidden />
                      </button>

                      {showExtraOptions.labs && (
                        <div className="mt-3 rounded-2xl border border-slate-100 bg-white/70 p-4">
                          <p className="text-xs text-slate-500">Прогностически значимые показатели, часто отсутствуют в первичной выгрузке и могут быть дообогащены.</p>
                          <div className="mt-4 grid gap-4">
                            <Field label="Альбумин сыворотки, г/л">
                              <input
                                className={cn(inputCls, validationErrors.albumin ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : null)}
                                inputMode="numeric"
                                value={form.albumin}
                                onChange={(e) => setField("albumin", e.target.value)}
                                title={validationErrors.albumin ?? undefined}
                                aria-invalid={Boolean(validationErrors.albumin)}
                              />
                            </Field>
                            <Field label="Нейтрофилы (абс.), ×10⁹/л">
                              <input
                                className={cn(inputCls, validationErrors.neutrophilsAbs ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : null)}
                                inputMode="decimal"
                                value={form.neutrophilsAbs}
                                onChange={(e) => setField("neutrophilsAbs", e.target.value)}
                                title={validationErrors.neutrophilsAbs ?? undefined}
                                aria-invalid={Boolean(validationErrors.neutrophilsAbs)}
                              />
                            </Field>
                            <Field label="Щелочная фосфатаза, Ед/л">
                              <input
                                className={cn(inputCls, validationErrors.alkalinePhosphatase ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : null)}
                                inputMode="numeric"
                                value={form.alkalinePhosphatase}
                                onChange={(e) => setField("alkalinePhosphatase", e.target.value)}
                                title={validationErrors.alkalinePhosphatase ?? undefined}
                                aria-invalid={Boolean(validationErrors.alkalinePhosphatase)}
                              />
                            </Field>
                            <Field label="Фибриноген, г/л">
                              <input
                                className={cn(inputCls, validationErrors.fibrinogen ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : null)}
                                inputMode="decimal"
                                value={form.fibrinogen}
                                onChange={(e) => setField("fibrinogen", e.target.value)}
                                title={validationErrors.fibrinogen ?? undefined}
                                aria-invalid={Boolean(validationErrors.fibrinogen)}
                              />
                            </Field>
                            <Field label="МНО">
                              <input
                                className={cn(inputCls, validationErrors.inr ? "border-red-400 bg-red-50/30 focus:ring-red-500/30" : null)}
                                inputMode="decimal"
                                value={form.inr}
                                onChange={(e) => setField("inr", e.target.value)}
                                title={validationErrors.inr ?? undefined}
                                aria-invalid={Boolean(validationErrors.inr)}
                              />
                            </Field>
                          </div>
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup icon={Users} title="Статус и сопутствующие заболевания">
                      <div className="grid gap-4">
                        <Field label="Сахарный диабет">
                          <select className={inputCls} value={form.diabetes} onChange={(e) => setField("diabetes", e.target.value)}>
                            <option value="">— выберите —</option>
                            <option value="да">да</option>
                            <option value="нет">нет</option>
                          </select>
                        </Field>
                        <Field label="Другие значимые сопутствующие заболевания">
                          <input
                            className={inputCls}
                            value={form.comorbidities}
                            onChange={(e) => setField("comorbidities", e.target.value)}
                            placeholder="Например: ИБС, ХБП, ХОБЛ…"
                          />
                        </Field>
                      </div>
                    </FormGroup>

                    <FormGroup icon={ShieldCheck} title="Качество данных">
                      <div className="space-y-3">
                        {groupCompletion(form).map((g) => (
                          <div key={g.key} className="rounded-xl border border-slate-100 bg-white/70 px-3 py-2">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{g.title}</div>
                              <div className="text-xs font-bold tabular-nums text-slate-700">
                                {g.filled}/{g.total}
                              </div>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-indigo-600" style={{ width: `${g.pct}%` }} />
                            </div>
                          </div>
                        ))}
                        <div className={cn("rounded-xl border px-3 py-2", qBadge.cls)}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs font-bold uppercase tracking-wide opacity-80">Достаточность</div>
                            <div className="text-xs font-bold tabular-nums opacity-90">{completionPct}%</div>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <qBadge.Icon className="size-4" aria-hidden />
                            <div className="text-sm font-bold">{qBadge.label}</div>
                          </div>
                        </div>
                      </div>
                    </FormGroup>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
                    <button
                      type="button"
                      onClick={handleLoad}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      <Download className="size-4" aria-hidden />
                      Загрузить данные пациента
                    </button>
                    <button
                      type="button"
                      onClick={handleEnrichFromCohort}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100"
                      title="Подставить типичные значения из исходных данных НМИЦ для пустых полей"
                    >
                      <Users className="size-4" aria-hidden />
                      Обогатить из исходных данных НМИЦ
                      {enrichInfo?.filled ? (
                        <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-black text-white tabular-nums">
                          +{enrichInfo.filled}
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      <Eraser className="size-4" aria-hidden />
                      Очистить форму
                    </button>
                    <button
                      type="button"
                      onClick={handleCalculate}
                      className="inline-flex h-11 min-w-[220px] flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-colors hover:bg-indigo-700 sm:flex-none"
                    >
                      <CalculatorIcon className="size-4" aria-hidden />
                      Рассчитать прогноз
                    </button>
                  </div>

                  {submitAttempted && (hasMissingRequired || blockingValidationErrors) && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                      {hasMissingRequired
                        ? `Обязательные поля не заполнены: ${missingRequiredKeys.size}. Пустые поля подсвечены красным.`
                        : "Проверьте формат обязательных числовых полей: есть некорректные значения."}
                    </div>
                  )}

                  {accuracyWarning && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                      Предупреждение: после обогащения точность может быть снижена. Выполните «Рассчитать прогноз».
                    </div>
                  )}
                </div>
              )}
            </Card>
          </section>

          {/* Нижняя зона ~30% — результаты */}
          <section
            className={cn(
              "w-full min-h-[32vh] flex-shrink-0 transition-opacity",
              hasResult ? "opacity-100" : "pointer-events-none opacity-40"
            )}
            aria-label="Результаты прогноза"
            aria-hidden={!hasResult}
          >
            <Card className="space-y-8 p-0">
              <button
                type="button"
                onClick={() => toggleCollapsed("results")}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-7"
                aria-expanded={!collapsed.results}
              >
                <div className="min-w-0 text-left">
                  <h2 className="text-lg font-bold text-slate-800">Результаты прогноза</h2>
                  <p className="mt-1 text-sm text-slate-500">Два исхода, три горизонта, графики и факторы риска.</p>
                </div>
                <ChevronDown className={cn("size-5 shrink-0 text-slate-500 transition-transform", collapsed.results ? "-rotate-90" : "rotate-0")} aria-hidden />
              </button>

              {!hasResult && (
                <p className="px-5 pb-6 text-center text-sm text-slate-500 sm:px-7">
                  Нажмите «Рассчитать прогноз», чтобы увидеть риски, график когорты и факторы.
                </p>
              )}

              {hasResult && !collapsed.results && (
                <>
                  <div className="px-5 pb-6 sm:px-7 space-y-8">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <OutcomeBlock title="Прогноз рецидива" tone="blue" traj={trajRec} riskCards={riskCardsRec} />
                      <OutcomeBlock title="Прогноз летального исхода" tone="red" traj={trajDeath} riskCards={riskCardsDeath} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-800">Графики и сравнение</h3>
                        </div>
                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                          {(
                            [
                              { id: "line", label: "Линейный график", Icon: TrendingUp },
                              { id: "heat", label: "Теплокарта", Icon: Flame },
                              { id: "radar", label: "Лепестки", Icon: Radar },
                              { id: "bar", label: "Бар-чарт", Icon: BarChart3 },
                              { id: "cohort", label: "Когорта", Icon: Users },
                              { id: "waterfall", label: "Водопад рисков", Icon: Activity },
                              { id: "hist", label: "Распределение", Icon: BarChart3 },
                              { id: "compare", label: "Сравнение исходов", Icon: Share2 },
                              { id: "parallel", label: "Параллельные координаты", Icon: TrendingDown },
                            ] as const
                          ).map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setActiveTab(t.id)}
                              className={cn(
                                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                                activeTab === t.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                              )}
                            >
                              <t.Icon className="size-4" aria-hidden />
                              <span className="hidden sm:inline">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                        {activeTab === "line" && (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm font-bold text-slate-800">Пациент / когорта НМИЦ</div>
                              <div className="text-xs text-slate-500">Горизонты: 1 / 3 / 5 лет</div>
                            </div>
                            <div className="mt-3 h-64 w-full min-w-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={cohortBands} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                                  <XAxis
                                    dataKey="x"
                                    tickFormatter={(v) => (v === 5 ? "5 л" : `${v} г`)}
                                    type="number"
                                    domain={[0.6, 5.4]}
                                    ticks={[1, 3, 5]}
                                  />
                                  <YAxis tickFormatter={(v) => `${v}%`} width={40} domain={[0, "auto"]} />
                                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} labelFormatter={(l) => `${l} год`} />
                                  <Legend />
                                  {cohortBands.map((row, i) => (
                                    <ReferenceArea
                                      key={i}
                                      x1={row.x - 0.35}
                                      x2={row.x + 0.35}
                                      y1={row.q1}
                                      y2={row.q3}
                                      fill="#94a3b8"
                                      fillOpacity={0.22}
                                      strokeOpacity={0}
                                      ifOverflow="visible"
                                    />
                                  ))}
                                  <Line type="monotone" dataKey="median" name="Медиана когорты" stroke="#64748b" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} />
                                  <Line type="monotone" dataKey="patientRec" name="Пациент (рецидив)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                                  <Line
                                    type="monotone"
                                    dataKey="patientDeath"
                                    name="Пациент (летальный исход)"
                                    stroke="#dc2626"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: "#dc2626" }}
                                  />
                                </ComposedChart>
                              </ResponsiveContainer>
                            </div>
                          </>
                        )}

                        {activeTab === "heat" && <HeatmapPlaceholder form={form} outcome={factorOutcome} />}
                        {activeTab === "radar" && <RadarPlaceholder form={form} outcome={factorOutcome} horizon={factorHorizon} />}
                        {activeTab === "bar" && <BarPlaceholder form={form} outcome={factorOutcome} horizon={factorHorizon} />}
                        {activeTab === "cohort" && <CohortComparisonTable form={form} />}
                        {activeTab === "waterfall" && <WaterfallPlaceholder form={form} outcome={factorOutcome} horizon={factorHorizon} />}
                        {activeTab === "hist" && <HistogramPlaceholder form={form} outcome={factorOutcome} horizon={factorHorizon} />}
                        {activeTab === "compare" && <CompareOutcomesPlaceholder form={form} horizon={factorHorizon} />}
                        {activeTab === "parallel" && <ParallelCoordsPlaceholder form={form} horizon={factorHorizon} />}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-800">Ключевые факторы риска</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                          {([1, 3, 5] as const).map((y) => (
                            <button
                              key={y}
                              type="button"
                              onClick={() => setFactorHorizon(y)}
                              className={cn(
                                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                                factorHorizon === y ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                              )}
                            >
                              {horizonLabel(y)}
                            </button>
                          ))}
                        </div>
                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                          {(
                            [
                              { id: "recurrence", label: "Рецидив" },
                              { id: "death", label: "Летальный исход" },
                            ] as const
                          ).map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => setFactorOutcome(o.id)}
                              className={cn(
                                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                                factorOutcome === o.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                              )}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {(() => {
                        const rows = factorContribsForUI.slice(0, 5);
                        const maxAbs = rows[0]?.contribution ? Math.abs(rows[0].contribution) : 1;
                        const modifiable = factorContribsForUI.filter((r) => r.modifiable).slice(0, 5);
                        return (
                          <>
                            <ul className="mt-4 space-y-3">
                              {rows.map((row, idx) => {
                                const w = Math.round((Math.abs(row.contribution) / maxAbs) * 100);
                                const isPos = row.contribution >= 0;
                                return (
                                  <li key={row.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm">
                                    <span className="w-6 tabular-nums text-slate-400">{idx + 1}.</span>
                                    <div className="min-w-0">
                                      <div className="font-medium text-slate-800">{row.title}</div>
                                      <div className="mt-1 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
                                        <div
                                          className={cn("h-full rounded-full transition-colors", isPos ? "bg-red-500/80" : "bg-emerald-500/80")}
                                          style={{ width: `${w}%` }}
                                        />
                                      </div>
                                    </div>
                                    <span
                                      className={cn(
                                        "font-mono tabular-nums font-semibold",
                                        isPos ? "text-red-700" : "text-emerald-700"
                                      )}
                                    >
                                      {row.contribution >= 0 ? `+${row.contribution.toFixed(1)}%` : `${row.contribution.toFixed(1)}%`}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                            <p className="mt-4 text-sm text-slate-600">
                              Модифицируемые факторы:{" "}
                              {modifiable.length ? modifiable.map((m) => m.title).join(", ") : "—"}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                      <h3 className="text-base font-bold text-slate-800">Блок научной обоснованности</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Прогностическая модель разработана на основе ретроспективного анализа данных нескольких тысяч пациентов с колоректальным раком (НМИЦ им. Н.Н. Блохина). Отобрано 30 параметров с доказанной прогностической значимостью. Точность прогноза зависит от полноты и качества входных данных и настроек модели.
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-100 bg-white/70 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">В датасете</div>
                          <div className="mt-0.5 text-lg font-black tabular-nums text-slate-900">8 241</div>
                          <div className="text-xs text-slate-500">пациентов</div>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-white/70 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Всего</div>
                          <div className="mt-0.5 text-lg font-black tabular-nums text-slate-900">53</div>
                          <div className="text-xs text-slate-500">параметра</div>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-white/70 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Отобрано</div>
                          <div className="mt-0.5 text-lg font-black tabular-nums text-slate-900">30</div>
                          <div className="text-xs text-slate-500">прогностически значимых</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-800">Клинические рекомендации</h3>
                      {(() => {
                        const top3 = factorContribsForUI.slice(0, 3);
                        const riskCat = riskCategoryFromPct(patientRiskSelected);
                        const yHorizons: Horizon[] = [1, 3, 5];

                        const makeText = (f: FactorContrib) => {
                          const riskVerb = f.contribution >= 0 ? "повышает" : "снижает";
                          switch (f.id) {
                            case "pN":
                            case "nodesAffected":
                              return `Фактор «${f.title}» ${riskVerb} риск. Рассмотрите усиление наблюдения и обсуждение тактики в МДК при неблагоприятной траектории.`;
                            case "stage":
                              return `Фактор «${f.title}» ${riskVerb} риск. Учет стадии важен для выбора интенсивности послеоперационного наблюдения.`;
                            case "cea":
                              return `Фактор «${f.title}» ${riskVerb} риск. Рекомендуется динамический контроль РЭА (и оценка ответа на терапию) в согласованные сроки.`;
                            case "albumin":
                              return `Фактор «${f.title}» ${riskVerb} риск. При снижении показателя рассмотрите нутритивную поддержку и коррекцию нутритивного статуса.`;
                            case "hemoglobin":
                              return `Фактор «${f.title}» ${riskVerb} риск. Рекомендуется оценка анемии и поддерживающая терапия по показаниям.`;
                            case "ast":
                            case "bilirubin":
                              return `Фактор «${f.title}» ${riskVerb} риск. Следует оценить печеночный профиль и потенциальные ограничения по гепатотоксичности.`;
                            case "lvi":
                            case "pni":
                              return `Фактор «${f.title}» ${riskVerb} риск. Учитывайте инвазию при планировании адъювантного лечения и тактики наблюдения.`;
                            case "age":
                              return `Возраст влияет на общий риск. Важно учитывать комплаенс, сопутствующие риски и переносимость наблюдения/терапии.`;
                            default:
                              return `Учет фактора «${f.title}» поможет согласовать прогноз с клинической картиной.`;
                          }
                        };

                        const supervision = (() => {
                          // Интервалы (упрощенная демонстрационная модель)
                          if (riskCat.tone === "low") {
                            return {
                              ctMonths: 12,
                              ceaMonths: 6,
                              colonYears: 5,
                              zone: { a: "bg-emerald-200", b: "bg-emerald-300", c: "bg-emerald-400" },
                            };
                          }
                          if (riskCat.tone === "mid") {
                            return {
                              ctMonths: 9,
                              ceaMonths: 4,
                              colonYears: 3,
                              zone: { a: "bg-amber-200", b: "bg-amber-300", c: "bg-amber-400" },
                            };
                          }
                          return {
                            ctMonths: 6,
                            ceaMonths: 3,
                            colonYears: 1,
                            zone: { a: "bg-red-200", b: "bg-red-300", c: "bg-red-400" },
                          };
                        })();

                        const riskLeftPct = clamp((patientRiskSelected / 100) * 100, 0, 100);
                        const completenessTone = completionPct >= 70 ? "good" : completionPct >= 50 ? "mid" : "bad";
                        const completenessCls =
                          completenessTone === "good"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : completenessTone === "mid"
                              ? "border-amber-200 bg-amber-50 text-amber-900"
                              : "border-red-200 bg-red-50 text-red-900";

                        const simActive = simulationForm != null;
                        const simDelta = patientRiskAfterSimulation - patientRiskSelected;
                        const handleSimulate = () => {
                          const targetAlbumin = "45";
                          const targetHb = "140";
                          const targetCea = "2.0";
                          setSimulationForm({
                            ...form,
                            albumin: targetAlbumin,
                            hemoglobin: targetHb,
                            cea: targetCea,
                          });
                        };

                        const resetSim = () => setSimulationForm(null);

                        const modifiable = factorContribsForUI.filter((f) => f.modifiable).slice(0, 3);
                        const targetValueFor = (id: FactorId) => {
                          switch (id) {
                            case "albumin":
                              return "45";
                            case "hemoglobin":
                              return "140";
                            case "cea":
                              return "2.0";
                            default:
                              return "—";
                          }
                        };

                        const currentValueFor = (id: FactorId) => {
                          switch (id) {
                            case "albumin":
                              return form.albumin || "—";
                            case "hemoglobin":
                              return form.hemoglobin || "—";
                            case "cea":
                              return form.cea || "—";
                            default:
                              return "—";
                          }
                        };

                        return (
                          <div className="mt-4 space-y-4">
                            {/* Персонализированные рекомендации */}
                            <div>
                              <div className="text-sm font-bold text-slate-800">Персонализированные рекомендации</div>
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {top3.map((f) => {
                                  const Icon = f.contribution >= 0 ? ShieldAlert : ShieldCheck;
                                  return (
                                    <div key={f.id} className="rounded-2xl border border-slate-100 bg-white/70 p-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2">
                                          <Icon className={cn("size-5", f.contribution >= 0 ? "text-red-600" : "text-emerald-600")} aria-hidden />
                                          <div className="min-w-0">
                                            <div className="text-sm font-bold text-slate-800">{f.title}</div>
                                            <div className="mt-1 text-xs text-slate-500">Характеристика: {f.contribution >= 0 ? "неблагоприятная" : "благоприятная"}</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-3 text-sm text-slate-600 leading-relaxed">{makeText(f)}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Усиление наблюдения */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
                              <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                  <div className="text-sm font-bold text-slate-800">Рекомендации по усилению наблюдения</div>
                                  <div className="mt-1 text-xs text-slate-500">Оценка по риску на горизонте {factorHorizon} год</div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                                  <div
                                    className={cn(
                                      "size-2 rounded-full",
                                      riskCat.tone === "low" ? "bg-emerald-500" : riskCat.tone === "mid" ? "bg-amber-500" : "bg-red-500"
                                    )}
                                  />
                                  <div className="text-sm font-bold text-slate-800">{riskCat.label}</div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                  <span>Стандартное</span>
                                  <span>Усиленное</span>
                                  <span>Интенсивное</span>
                                </div>
                                <div className="relative h-4 w-full overflow-hidden rounded-xl bg-slate-100">
                                  <div className="absolute inset-y-0 left-0 w-1/4 bg-emerald-200" />
                                  <div className="absolute inset-y-0 left-1/4 w-1/2 bg-amber-200" />
                                  <div className="absolute inset-y-0 left-3/4 w-1/4 bg-red-200" />
                                  <div className="absolute top-[-6px]">
                                    <div
                                      className="h-4 w-0 border-l-2 border-slate-900"
                                      style={{ left: `${riskLeftPct}%` }}
                                      aria-hidden
                                    />
                                  </div>
                                  <div className="absolute top-[-18px] text-[10px] font-black text-slate-700" style={{ left: `${riskLeftPct}%`, transform: "translateX(-50%)" }}>
                                    {patientRiskSelected.toFixed(1)}%
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white">
                                <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                                  <div>Показатель</div>
                                  {yHorizons.map((h) => (
                                    <div key={h} className="text-center">
                                      {horizonLabel(h)}
                                    </div>
                                  ))}
                                </div>
                                {(() => {
                                  const ctCount = (years: number) => Math.max(0, Math.round((years * 12) / supervision.ctMonths));
                                  const ceaCount = (years: number) => Math.max(0, Math.round((years * 12) / supervision.ceaMonths));
                                  const colonCount = (years: number) => {
                                    if (supervision.colonYears >= 5) return years >= 5 ? 1 : 0;
                                    if (supervision.colonYears >= 3) return years >= 3 ? 1 : 0;
                                    return years; // 1 year schedule
                                  };
                                  const ct = [ctCount(1), ctCount(3), ctCount(5)];
                                  const cea = [ceaCount(1), ceaCount(3), ceaCount(5)];
                                  const colon = [colonCount(1), colonCount(3), colonCount(5)];
                                  return (
                                    <>
                                      <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-t border-slate-100 px-3 py-2 text-sm">
                                        <div className="font-semibold text-slate-700">КТ (частота)</div>
                                        {ct.map((n, i) => (
                                          <div key={i} className="text-center tabular-nums text-slate-800">
                                            {n} раз
                                          </div>
                                        ))}
                                      </div>
                                      <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-t border-slate-100 px-3 py-2 text-sm">
                                        <div className="font-semibold text-slate-700">РЭА (частота)</div>
                                        {cea.map((n, i) => (
                                          <div key={i} className="text-center tabular-nums text-slate-800">
                                            {n} раз
                                          </div>
                                        ))}
                                      </div>
                                      <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-t border-slate-100 px-3 py-2 text-sm">
                                        <div className="font-semibold text-slate-700">Колоноскопия</div>
                                        {colon.map((n, i) => (
                                          <div key={i} className="text-center tabular-nums text-slate-800">
                                            {n} раз
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Модифицируемые факторы */}
                            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-bold text-slate-800">Модифицируемые факторы</div>
                                  <div className="mt-1 text-xs text-slate-500">Демонстрация моделирования влияния на риск</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!simActive ? (
                                    <button
                                      type="button"
                                      onClick={handleSimulate}
                                      className="inline-flex h-9 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                                    >
                                      Смоделировать эффект
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={resetSim}
                                      className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                      Сбросить
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {modifiable.map((f) => (
                                  <div key={f.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Фактор</div>
                                    <div className="mt-1 text-sm font-bold text-slate-800">{f.title}</div>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                      <div className="text-xs text-slate-500">Текущее</div>
                                      <div className="text-sm font-black tabular-nums text-slate-800">{currentValueFor(f.id)}</div>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between gap-3">
                                      <div className="text-xs text-slate-500">Цель</div>
                                      <div className="text-sm font-black tabular-nums text-slate-800">{targetValueFor(f.id)}</div>
                                    </div>
                                  </div>
                                ))}
                                {!modifiable.length ? (
                                  <div className="col-span-2 text-sm text-slate-600">В модели нет модифицируемых факторов для текущего профиля.</div>
                                ) : null}
                              </div>

                              {simActive ? (
                                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                                  Риск после моделирования: {patientRiskAfterSimulation.toFixed(1)}% (изменение {simDelta >= 0 ? "+" : ""}
                                  {simDelta.toFixed(1)} п.п.)
                                </div>
                              ) : null}
                            </div>

                            {/* Источники рекомендаций */}
                            <div className="rounded-2xl border border-slate-100 bg-white/60 p-4">
                              <div className="text-sm font-bold text-slate-800">Ссылки на источники клинических рекомендаций</div>
                              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                  title="NCCN Guidelines — ссылка будет подключена к актуальной версии"
                                >
                                  NCCN
                                </a>
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                  title="ESMO Clinical Practice Guidelines — ссылка будет подключена к актуальной версии"
                                >
                                  ESMO
                                </a>
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                  title="Российские клинические рекомендации — ссылка будет подключена к актуальной версии"
                                >
                                  РФ
                                </a>
                              </div>
                            </div>

                            {/* Предупреждение о полноте данных */}
                            <div className={cn("rounded-2xl border px-4 py-3 text-sm font-semibold", completenessCls)}>
                              Окончательное решение принимает лечащий врач. При полноте {completionPct}% точность рекомендаций{" "}
                              {completionPct < 70 ? "снижена." : "сохранена."}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

function FormGroup({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-slate-50/40 p-4", className)}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
          <Icon className="size-4" aria-hidden />
        </div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function OutcomeBlock({
  title,
  tone,
  traj,
  riskCards,
}: {
  title: string;
  tone: "blue" | "red";
  traj: { kind: TrajectoryKind; label: string };
  riskCards: { h: Horizon; pct: number }[];
}) {
  const accent = tone === "blue" ? "text-blue-700" : "text-red-700";
  const border = tone === "blue" ? "border-blue-100" : "border-red-100";
  const bg = tone === "blue" ? "bg-blue-50/40" : "bg-red-50/40";
  return (
    <div className={cn("rounded-2xl border p-4", border, bg)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={cn("text-base font-black", accent)}>{title}</h3>
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2">
            <TrajectoryIcon kind={traj.kind} />
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Траектория</div>
              <div className="text-sm text-slate-700">{traj.label}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {riskCards.map(({ h, pct }) => {
          const cat = riskCategoryFromPct(pct);
          const c = riskColors(cat.tone);
          return (
            <div key={h} className={cn("rounded-2xl border bg-white p-4 shadow-sm ring-1", c.ring)}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{horizonLabel(h)}</p>
              <p className={cn("mt-2 text-3xl font-black tabular-nums", c.text)}>{pct.toFixed(1)}%</p>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={cn("h-full rounded-full transition-all", c.bar)} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700">{cat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeatmapPlaceholder({ form, outcome }: { form: FormState; outcome: Outcome }) {
  const cols: Horizon[] = [1, 3, 5];

  const horizonMaps = cols.map((h) => {
    const contribs = computeScaledFactorContribs(form, outcome, h);
    const m = {} as Record<FactorId, number>;
    contribs.forEach((c) => {
      m[c.id] = c.contribution;
    });
    return m;
  });

  const top5 = FACTOR_DEFS.map((d) => {
    const avgAbs = cols.reduce((acc, _h, i) => acc + Math.abs(horizonMaps[i][d.id] ?? 0), 0) / cols.length;
    return { id: d.id, title: d.title, avgAbs };
  })
    .sort((a, b) => b.avgAbs - a.avgAbs)
    .slice(0, 5);

  const allValues = top5.flatMap((row) => cols.map((_, i) => horizonMaps[i][row.id] ?? 0));
  const maxAbs = Math.max(0.0001, ...allValues.map((v) => Math.abs(v)));

  const cellColor = (v: number) => {
    const a = Math.min(1, Math.abs(v) / maxAbs);
    const alpha = 0.15 + a * 0.6;
    if (v >= 0) return { bg: `rgba(220,38,38,${alpha})`, fg: "rgba(127,29,29,0.98)" };
    return { bg: `rgba(16,185,129,${alpha})`, fg: "rgba(4,120,87,0.98)" };
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-800">Тепловая карта влияния факторов</div>
        <div className="text-xs text-slate-500">Исход: {outcome === "recurrence" ? "рецидив" : "летальный исход"}</div>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
        <div className="grid grid-cols-[1.25fr_repeat(3,1fr)] bg-slate-50 px-1 py-1 text-xs font-bold text-slate-600">
          <div className="px-2 py-2">Фактор</div>
          {cols.map((c) => (
            <div key={c} className="px-2 py-2 text-center">
              {c} год
            </div>
          ))}
        </div>
        {top5.map((row) => (
          <div key={row.id} className="grid grid-cols-[1.25fr_repeat(3,1fr)] border-t border-slate-100">
            <div className="px-3 py-2 text-sm font-semibold text-slate-700">{row.title}</div>
            {cols.map((_, ci) => {
              const v = horizonMaps[ci][row.id] ?? 0;
              const col = cellColor(v);
              return (
                <div key={ci} className="px-3 py-2">
                  <div className="h-9 w-full rounded-lg flex items-center justify-center text-xs font-bold tabular-nums" style={{ background: col.bg, color: col.fg }}>
                    {v >= 0 ? "+" : ""}
                    {v.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarPlaceholder({
  form,
  outcome,
  horizon,
}: {
  form: FormState;
  outcome: Outcome;
  horizon: Horizon;
}) {
  const factorContribs = computeScaledFactorContribs(form, outcome, horizon);
  const maxAbs = Math.max(0.0001, ...factorContribs.map((c) => Math.abs(c.contribution)));
  const clamp01 = (v: number) => clamp(v, 0, 1);

  const metricDefs: Array<{ metric: string; factorId: FactorId; norm: (f: FormState) => number }> = [
    { metric: "Возраст", factorId: "age", norm: (f) => parseNum(f.age) / 90 },
    { metric: "Стадия", factorId: "stage", norm: (f) => stageToNum(f.stage) / 4 },
    { metric: "pN", factorId: "pN", norm: (f) => pNToNum(f.pN) / 2 },
    { metric: "pM", factorId: "pM", norm: (f) => pMToNum(f.pM) / 1 },
    { metric: "ЛУ пораж.", factorId: "nodesAffected", norm: (f) => parseNum(f.nodesAffected) / 12 },
    { metric: "РЭА", factorId: "cea", norm: (f) => parseNum(f.cea) / 30 },
    { metric: "Hb", factorId: "hemoglobin", norm: (f) => parseNum(f.hemoglobin) / 180 },
    { metric: "Альбумин", factorId: "albumin", norm: (f) => parseNum(f.albumin) / 55 },
    { metric: "АСТ", factorId: "ast", norm: (f) => parseNum(f.ast) / 80 },
    { metric: "ИМТ", factorId: "bmi", norm: (f) => bmiFromFormForModel(f) / 45 },
  ];

  const contribById = factorContribs.reduce((acc, c) => {
    acc[c.id] = c.contribution;
    return acc;
  }, {} as Partial<Record<FactorId, number>>);

  const data = metricDefs.map((d) => {
    const w = Math.abs(contribById[d.factorId] ?? 0) / maxAbs;
    const base = 0.15 + 0.85 * w;
    return {
      metric: d.metric,
      patient: clamp01(base * clamp01(d.norm(form))),
      cohort: clamp01(base * clamp01(d.norm(COHORT_REFERENCE_FORM))),
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-bold text-slate-800">Профиль пациента / когорта</div>
        <div className="text-xs text-slate-500">
          Исход: {outcome === "recurrence" ? "рецидив" : "летальный исход"}, горизонт: {horizon} год
        </div>
      </div>
      <div className="mt-3 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[0, 1]} tickCount={3} tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <RadarShape name="Пациент" dataKey="patient" stroke="#2563eb" fill="#2563eb" fillOpacity={0.22} />
            <RadarShape
              name="Когорта (медиана)"
              dataKey="cohort"
              stroke="#64748b"
              fill="#64748b"
              fillOpacity={0.10}
            />
            <Legend />
            <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BarPlaceholder({ form, outcome, horizon }: { form: FormState; outcome: Outcome; horizon: Horizon }) {
  const contribs = computeScaledFactorContribs(form, outcome, horizon);
  const rows = contribs.slice(0, 8);

  const data = rows.map((r) => ({
    name: r.title,
    v: Math.round(r.contribution * 10) / 10,
    sign: r.contribution >= 0 ? "pos" : "neg",
  }));
  const chartHeight = Math.max(320, data.length * 44);

  return (
    <div>
      <div className="text-sm font-bold text-slate-800">Бар-чарт «Вклад факторов риска»</div>
      <div className="mt-1 text-xs text-slate-500">
        Исход: {outcome === "recurrence" ? "рецидив" : "летальный исход"}, горизонт: {horizon} год
      </div>
      <div className="mt-3 w-full min-w-0 overflow-hidden" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={14} barCategoryGap="32%" margin={{ top: 8, right: 12, left: 24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" width={220} interval={0} tick={<WrappedYAxisTick />} tickMargin={10} />
            <Tooltip formatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`} />
            <Bar dataKey="v" radius={[8, 8, 8, 8]}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.v >= 0 ? "rgba(239,68,68,0.8)" : "rgba(16,185,129,0.75)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WaterfallPlaceholder({
  form,
  outcome,
  horizon,
}: {
  form: FormState;
  outcome: Outcome;
  horizon: Horizon;
}) {
  const { ref: containerRef, rect } = useMeasure<HTMLDivElement>();

  const baselineRisk = getRiskAt(COHORT_REFERENCE_FORM, outcome, horizon);
  const patientRisk = getRiskAt(form, outcome, horizon);
  const delta = patientRisk - baselineRisk;

  const contribs = computeScaledFactorContribs(form, outcome, horizon);
  const top = contribs.slice(0, 7);
  const sumTop = top.reduce((s, c) => s + c.contribution, 0);
  const residual = delta - sumTop;

  const changes = [
    ...top.map((c) => ({ label: c.title, change: c.contribution, color: c.contribution >= 0 ? "rgba(239,68,68,0.85)" : "rgba(16,185,129,0.80)" })),
    { label: "Прочие факторы", change: residual, color: residual >= 0 ? "rgba(239,68,68,0.85)" : "rgba(16,185,129,0.80)" },
  ];

  const clampRisk = (v: number) => clamp(v, 0, 100);

  const wrapLabel = (label: string, maxChars: number) => {
    const clean = String(label ?? "").trim();
    if (!clean) return [];
    const words = clean.split(/\s+/g);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (next.length <= maxChars) cur = next;
      else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 2);
  };

  const svgW = Math.max(680, rect.width || 0);
  const svgH = Math.max(240, rect.height || 0);

  const padLeft = Math.round(Math.min(84, Math.max(52, svgW * 0.06)));
  const padRight = 18;
  const padTop = 18;
  const padBottom = Math.round(Math.min(110, Math.max(86, svgH * 0.33)));

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const categories = ["Базис", ...changes.map((c) => c.label), "Пациент"];
  const n = categories.length;
  const slotW = plotW / Math.max(1, n);
  const barW = Math.min(72, Math.max(26, slotW * 0.62));
  const xCenter = (i: number) => padLeft + (i + 0.5) * slotW;
  const xBar = (i: number) => xCenter(i) - barW / 2;
  const yOf = (riskPct: number) => padTop + (1 - clampRisk(riskPct) / 100) * plotH;

  type WfBar = { kind: "total" | "delta"; label: string; from: number; to: number; color: string };
  const bars: WfBar[] = [];
  bars.push({ kind: "total", label: "Базис", from: 0, to: baselineRisk, color: "rgba(100,116,139,0.28)" });

  let cursor = baselineRisk;
  for (const c of changes) {
    const from = cursor;
    const to = cursor + c.change;
    bars.push({ kind: "delta", label: c.label, from, to, color: c.color });
    cursor = to;
  }
  bars.push({ kind: "total", label: "Пациент", from: 0, to: patientRisk, color: "rgba(37,99,235,0.22)" });

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-bold text-slate-800">Водопад рисков</div>
        <div className="text-xs text-slate-500">
          Исход: {outcome === "recurrence" ? "рецидив" : "летальный исход"}, горизонт: {horizon} год
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-xs">
        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-600">
          Базис {clampRisk(baselineRisk).toFixed(1)}%
        </span>
        <span className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-bold text-indigo-700">
          Пациент {clampRisk(patientRisk).toFixed(1)}%
        </span>
      </div>

      <div ref={containerRef} className="mt-3 h-64 w-full min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
        <svg width={svgW} height={svgH} className="block h-full w-full" role="img" aria-label="Waterfall risk chart">
          {/* grid */}
          {[0, 25, 50, 75, 100].map((t) => (
            <g key={t}>
              <line x1={padLeft} x2={svgW - padRight} y1={yOf(t)} y2={yOf(t)} stroke="#e2e8f0" strokeDasharray="4 4" />
              <text x={padLeft - 10} y={yOf(t)} dy={4} textAnchor="end" fontSize={11} fill="#64748b" fontWeight={800}>
                {t}%
              </text>
            </g>
          ))}

          {/* bars */}
          {bars.map((b, i) => {
            const from = b.kind === "total" ? 0 : b.from;
            const to = b.kind === "total" ? b.to : b.to;
            const yFrom = yOf(from);
            const yTo = yOf(to);
            const topY = Math.min(yFrom, yTo);
            const h = Math.max(2, Math.abs(yTo - yFrom));
            const x = xBar(i);

            const stroke = b.kind === "total" ? "rgba(100,116,139,0.35)" : "rgba(15,23,42,0.08)";
            const rx = 10;
            const labelVal = b.kind === "delta" ? (b.to - b.from) : b.to;
            const valText = b.kind === "delta" ? `${labelVal >= 0 ? "+" : ""}${labelVal.toFixed(1)}%` : `${clampRisk(labelVal).toFixed(1)}%`;
            const valY = topY - 6;

            return (
              <g key={`${b.label}-${i}`}>
                <rect x={x} y={topY} width={barW} height={h} rx={rx} fill={b.color} stroke={stroke} />
                <text x={x + barW / 2} y={valY} textAnchor="middle" fontSize={10} fill="#0f172a" fontWeight={900}>
                  {valText}
                </text>
              </g>
            );
          })}

          {/* connectors: cumulative line across deltas */}
          {(() => {
            const pts: Array<{ x: number; y: number }> = [];
            let cur = baselineRisk;
            pts.push({ x: xCenter(0), y: yOf(cur) });
            changes.forEach((c, idx) => {
              cur = cur + c.change;
              pts.push({ x: xCenter(idx + 1), y: yOf(cur) });
            });
            pts.push({ x: xCenter(n - 1), y: yOf(patientRisk) });

            const d = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
            return (
              <g>
                <polyline points={d} fill="none" stroke="rgba(15,23,42,0.55)" strokeWidth={2} />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={3.2} fill="#0f172a" opacity={0.9} />
                ))}
              </g>
            );
          })()}

          {/* x labels */}
          {categories.map((label, i) => {
            const x = xCenter(i);
            const maxChars = Math.max(8, Math.floor(barW / 6.4));
            const lines = wrapLabel(label, maxChars);
            const baseY = i % 2 === 0 ? svgH - 44 : svgH - 22;
            return (
              <g key={label + i}>
                {lines.length ? (
                  <text x={x} y={baseY} textAnchor="middle" fontSize={10} fill="#334155" fontWeight={800}>
                    {lines.map((l, li) => (
                      <tspan key={li} x={x} dy={li === 0 ? 0 : 12}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                ) : null}
              </g>
            );
          })}

        </svg>
      </div>
    </div>
  );
}

function HistogramPlaceholder({
  form,
  outcome,
  horizon,
}: {
  form: FormState;
  outcome: Outcome;
  horizon: Horizon;
}) {
  const { ref: containerRef, rect } = useMeasure<HTMLDivElement>();

  const baselineRisk = getRiskAt(COHORT_REFERENCE_FORM, outcome, horizon);
  const patientRisk = getRiskAt(form, outcome, horizon);

  const iqr = 24 + (horizon === 5 ? 10 : horizon === 3 ? 5 : 0);
  const q1 = clamp(baselineRisk - iqr / 2, 0, 100);
  const q3 = clamp(baselineRisk + iqr / 2, 0, 100);
  const std = Math.max(1e-3, (q3 - q1) / 1.349);

  const z = (patientRisk - baselineRisk) / std;
  const cdf = normalCdf(z);
  const abovePct = Math.round(cdf * 100);

  const width = Math.max(680, rect.width || 0);
  const height = Math.max(240, rect.height || 0);
  const padLeft = Math.round(Math.min(84, Math.max(44, width * 0.06)));
  const padRight = 18;
  const padTop = 18;
  const padBottom = 44;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const xOf = (x: number) => padLeft + (x / 100) * plotW;
  const yOf = (pdf: number, maxPdf: number) => padTop + (1 - pdf / maxPdf) * plotH;

  const normalPdf = (x: number) => (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - baselineRisk) * (x - baselineRisk)) / (2 * std * std));

  const xs = Array.from({ length: 201 }, (_, i) => i * 0.5);
  const pdfs = xs.map((x) => normalPdf(x));
  const maxPdf = Math.max(0.000001, ...pdfs);

  const path = pdfs
    .map((pdf, i) => {
      const x = xs[i];
      const y = yOf(pdf, maxPdf);
      return `${i === 0 ? "M" : "L"} ${xOf(x).toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const lineX = xOf(patientRisk);
  const lineY = padTop + plotH;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-bold text-slate-800">Гистограмма распределения пациента в когорте</div>
        <div className="text-xs text-slate-500">
          Исход: {outcome === "recurrence" ? "рецидив" : "летальный исход"}, горизонт: {horizon} год
        </div>
      </div>
      <div className="mt-1 text-xs text-slate-600">
        Пациент: <span className="font-bold">{patientRisk.toFixed(1)}%</span>, процентиль:{" "}
        <span className="font-bold">выше {abovePct}% пациентов</span>
      </div>

      <div
        ref={containerRef}
        className="mt-3 h-64 w-full min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white/60 p-2"
      >
        <svg width={width} height={height} className="block h-full w-full" role="img" aria-label="Cohort distribution histogram">
          {/* axis */}
          <line x1={padLeft} x2={width - padRight} y1={padTop + plotH} y2={padTop + plotH} stroke="#e2e8f0" />
          <line x1={padLeft} x2={padLeft} y1={padTop} y2={padTop + plotH} stroke="#e2e8f0" />

          {[0, 25, 50, 75, 100].map((t) => (
            <g key={t}>
              <line x1={xOf(t)} x2={xOf(t)} y1={padTop + plotH} y2={padTop + plotH + 5} stroke="#e2e8f0" />
              <text x={xOf(t)} y={padTop + plotH + 18} textAnchor="middle" fontSize={11} fill="#64748b" fontWeight={700}>
                {t}
              </text>
            </g>
          ))}

          {/* curve */}
          <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} />

          {/* patient line */}
          <line x1={lineX} x2={lineX} y1={padTop} y2={lineY} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 4" />
          <text x={lineX} y={padTop + 14} textAnchor="middle" fontSize={12} fill="#ef4444" fontWeight={900}>
            {patientRisk.toFixed(1)}%
          </text>
        </svg>
      </div>
    </div>
  );
}

function CompareOutcomesPlaceholder({ form, horizon }: { form: FormState; horizon: Horizon }) {
  const metrics: Array<{ metric: string; factorId: FactorId; norm: (f: FormState) => number }> = [
    { metric: "Возраст", factorId: "age", norm: (f) => parseNum(f.age) / 90 },
    { metric: "Стадия", factorId: "stage", norm: (f) => stageToNum(f.stage) / 4 },
    { metric: "pN", factorId: "pN", norm: (f) => pNToNum(f.pN) / 2 },
    { metric: "pM", factorId: "pM", norm: (f) => pMToNum(f.pM) / 1 },
    { metric: "ЛУ пораж.", factorId: "nodesAffected", norm: (f) => parseNum(f.nodesAffected) / 12 },
    { metric: "РЭА", factorId: "cea", norm: (f) => parseNum(f.cea) / 30 },
    { metric: "Hb", factorId: "hemoglobin", norm: (f) => parseNum(f.hemoglobin) / 180 },
    { metric: "Альбумин", factorId: "albumin", norm: (f) => parseNum(f.albumin) / 55 },
    { metric: "АСТ", factorId: "ast", norm: (f) => parseNum(f.ast) / 80 },
    { metric: "ИМТ", factorId: "bmi", norm: (f) => bmiFromFormForModel(f) / 45 },
  ];

  const clamp01 = (v: number) => clamp(v, 0, 1);

  const recContribs = computeScaledFactorContribs(form, "recurrence", horizon);
  const deathContribs = computeScaledFactorContribs(form, "death", horizon);
  const maxAbsRec = Math.max(0.0001, ...recContribs.map((c) => Math.abs(c.contribution)));
  const maxAbsDeath = Math.max(0.0001, ...deathContribs.map((c) => Math.abs(c.contribution)));

  const recById = recContribs.reduce((acc, c) => {
    acc[c.id] = c.contribution;
    return acc;
  }, {} as Partial<Record<FactorId, number>>);
  const deathById = deathContribs.reduce((acc, c) => {
    acc[c.id] = c.contribution;
    return acc;
  }, {} as Partial<Record<FactorId, number>>);

  const data = metrics.map((m) => {
    const wRec = Math.abs(recById[m.factorId] ?? 0) / maxAbsRec;
    const wDeath = Math.abs(deathById[m.factorId] ?? 0) / maxAbsDeath;
    return {
      metric: m.metric,
      recurrence: clamp01(0.15 + 0.85 * wRec * clamp01(m.norm(form))),
      death: clamp01(0.15 + 0.85 * wDeath * clamp01(m.norm(form))),
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-bold text-slate-800">Сравнение двух исходов на одном графике</div>
        <div className="text-xs text-slate-500">Горизонт: {horizon} год</div>
      </div>
      <div className="mt-3 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[0, 1]} tickCount={3} tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <RadarShape name="Рецидив" dataKey="recurrence" stroke="#2563eb" fill="#2563eb" fillOpacity={0.18} />
            <RadarShape name="Летальный исход" dataKey="death" stroke="#dc2626" fill="#dc2626" fillOpacity={0.16} />
            <Legend />
            <Tooltip formatter={(v: number) => `${Math.round(v * 100)}%`} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ParallelCoordsPlaceholder({ form, horizon }: { form: FormState; horizon: Horizon }) {
  const width = 680;
  const height = 240;
  const padLeft = 36;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 56;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const clamp01 = (v: number) => clamp(v, 0, 1);

  const axisDefs: Array<{ label: string; norm: (f: FormState) => number }> = [
    { label: "Возраст", norm: (f) => parseNum(f.age) / 90 },
    { label: "Стадия", norm: (f) => stageToNum(f.stage) / 4 },
    { label: "pN", norm: (f) => pNToNum(f.pN) / 2 },
    { label: "ЛУ пораж.", norm: (f) => parseNum(f.nodesAffected) / 12 },
    { label: "РЭА", norm: (f) => parseNum(f.cea) / 30 },
    { label: "Hb", norm: (f) => parseNum(f.hemoglobin) / 180 },
    { label: "Альбумин", norm: (f) => parseNum(f.albumin) / 55 },
    { label: "ИМТ", norm: (f) => bmiFromFormForModel(f) / 45 },
  ];

  const xOf = (i: number) => {
    const n = axisDefs.length - 1 || 1;
    return padLeft + (i / n) * plotW;
  };
  const yOf = (normVal: number) => padTop + (1 - clamp01(normVal)) * plotH;

  const toPoints = (f: FormState) =>
    axisDefs.map((a, i) => ({
      x: xOf(i),
      y: yOf(a.norm(f)),
    }));

  const ref = COHORT_REFERENCE_FORM;
  const typicals: FormState[] = [
    { ...ref, age: String(clamp(parseNum(ref.age) + 8, 0, 120)), cea: String(Math.max(0, parseNum(ref.cea) - 0.7)), albumin: ref.albumin },
    { ...ref, age: String(clamp(parseNum(ref.age) - 6, 0, 120)), cea: String(parseNum(ref.cea) + 1.9), hemoglobin: String(parseNum(ref.hemoglobin) - 15) },
    { ...ref, stage: "III", pN: "N1", nodesAffected: "2", albumin: String(Math.max(0, parseNum(ref.albumin) - 10)), cea: String(parseNum(ref.cea) + 2.2) },
  ];

  const patientPts = toPoints(form);
  const typicalPts = typicals.map(toPoints);

  const polyline = (pts: Array<{ x: number; y: number }>) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-bold text-slate-800">Параллельные координаты</div>
        <div className="text-xs text-slate-500">Горизонт: {horizon} год</div>
      </div>

      <div className="mt-3 h-64 w-full min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white/60 p-2">
        <svg
          width="100%"
          height="100%"
          className="block h-full w-full max-w-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Parallel coordinates chart"
        >
          {/* axis lines */}
          {axisDefs.map((a, i) => (
            <g key={a.label}>
              <line x1={xOf(i)} x2={xOf(i)} y1={padTop} y2={padTop + plotH} stroke="#e2e8f0" strokeWidth={1} />
              <text x={xOf(i)} y={height - 22} textAnchor="middle" fontSize={11} fill="#334155" fontWeight={700}>
                {a.label}
              </text>
            </g>
          ))}

          {/* typical lines */}
          {typicalPts.map((pts, idx) => (
            <polyline key={idx} points={polyline(pts)} fill="none" stroke="rgba(100,116,139,0.45)" strokeWidth={2} />
          ))}

          {/* patient line */}
          <polyline points={polyline(patientPts)} fill="none" stroke="#2563eb" strokeWidth={3} />

          {/* patient risk mark */}
          <text x={padLeft} y={padTop - 6} fontSize={11} fill="#2563eb" fontWeight={900}>
            Пациент
          </text>
        </svg>
      </div>
    </div>
  );
}

function WrappedYAxisTick(props: { x?: number; y?: number; payload?: { value?: string } }) {
  const { x = 0, y = 0, payload } = props;
  const value = String(payload?.value ?? "").trim();
  if (!value) return null;

  const maxChars = 18;
  const words = value.split(/\s+/g);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#475569" fontSize={12} fontWeight={700}>
        {lines.slice(0, 2).map((l, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : 14}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function CohortComparisonTable({ form }: { form: FormState }) {
  const [sortAsc, setSortAsc] = useState(false);

  const coreKeys: Array<{ key: keyof FormState; label: string }> = [
    { key: "sex", label: "Пол" },
    { key: "age", label: "Возраст" },
    { key: "heightCm", label: "Рост, см" },
    { key: "weightKg", label: "Вес, кг" },
    { key: "stage", label: "Стадия" },
    { key: "pT", label: "pT" },
    { key: "pN", label: "pN" },
    { key: "pM", label: "pM" },
    { key: "gradeG", label: "G" },
    { key: "lymphovascularInvasion", label: "ЛВИ" },
    { key: "perineuralInvasion", label: "ПНИ" },
    { key: "nodesExamined", label: "ЛУ изучено" },
    { key: "nodesAffected", label: "ЛУ поражено" },
    { key: "nras", label: "NRAS" },
    { key: "braf", label: "BRAF" },
    { key: "kras", label: "KRAS" },
    { key: "operation", label: "Операция" },
    { key: "surgicalAccess", label: "Доступ" },
    { key: "adjuvantTherapy", label: "Адъювантная терапия" },
    { key: "adjuvantScheme", label: "Схема" },
    { key: "adjuvantCourses", label: "Курсы" },
    { key: "radiotherapy", label: "Лучевая терапия" },
    { key: "cea", label: "РЭА" },
    { key: "lymphocytesAbs", label: "Лимфоциты (абс.)" },
    { key: "leukocytes", label: "Лейкоциты" },
    { key: "hemoglobin", label: "Гемоглобин" },
    { key: "platelets", label: "Тромбоциты" },
    { key: "ast", label: "АСТ" },
    { key: "bilirubin", label: "Билирубин общий" },
  ];

  const protectiveBetter = new Set<keyof FormState>(["hemoglobin", "lymphocytesAbs"]);
  const schemeOptions = ["FOLFOX", "XELOX", "FLOX", "капецитабин"] as const;

  const scoreFor = (key: keyof FormState, value: string): number => {
    const v = value ?? "";
    switch (key) {
      case "sex":
        return v === "муж" ? 1 : 0;
      case "stage":
        return stageToNum(v);
      case "pN":
        return pNToNum(v);
      case "pM":
        return pMToNum(v);
      case "gradeG": {
        const m: Record<string, number> = { GX: 0, G1: 1, G2: 2, G3: 3, G4: 4 };
        return m[v] ?? 0;
      }
      case "lymphovascularInvasion":
      case "perineuralInvasion":
        return invasionToNum(v);
      case "nras":
      case "braf":
      case "kras":
        return v === "мутирован" ? 1 : 0;
      case "adjuvantTherapy":
      case "radiotherapy":
        return v === "да" ? 1 : 0;
      case "adjuvantScheme":
        return Math.max(0, schemeOptions.indexOf(v as (typeof schemeOptions)[number]));
      case "operation":
        return Math.max(0, OPERATION_OPTIONS.indexOf(v));
      case "surgicalAccess":
        return Math.max(0, ACCESS_OPTIONS.indexOf(v));
      default:
        return parseNum(v);
    }
  };

  const rangeFor = (key: keyof FormState): { min: number; max: number } => {
    switch (key) {
      case "sex":
        return { min: 0, max: 1 };
      case "stage":
        return { min: 0, max: 4 };
      case "pN":
        return { min: 0, max: 2 };
      case "pM":
        return { min: 0, max: 1 };
      case "gradeG":
        return { min: 0, max: 4 };
      case "lymphovascularInvasion":
      case "perineuralInvasion":
        return { min: 0, max: 1 };
      case "nras":
      case "braf":
      case "kras":
        return { min: 0, max: 1 };
      case "adjuvantTherapy":
      case "radiotherapy":
        return { min: 0, max: 1 };
      case "adjuvantScheme":
        return { min: 0, max: schemeOptions.length - 1 };
      case "operation":
        return { min: 0, max: Math.max(1, OPERATION_OPTIONS.length - 1) };
      case "surgicalAccess":
        return { min: 0, max: Math.max(1, ACCESS_OPTIONS.length - 1) };
      case "adjuvantCourses":
        return { min: 0, max: 20 };
      case "nodesExamined":
      case "nodesAffected":
        return { min: 0, max: 100 };
      case "age":
        return { min: 0, max: 120 };
      case "heightCm":
        return { min: 50, max: 250 };
      case "weightKg":
        return { min: 20, max: 300 };
      case "cea":
        return { min: 0, max: 200 };
      case "lymphocytesAbs":
      case "leukocytes":
        return { min: 0, max: 50 };
      case "hemoglobin":
        return { min: 0, max: 250 };
      case "platelets":
        return { min: 0, max: 1000 };
      case "ast":
        return { min: 0, max: 1000 };
      case "bilirubin":
        return { min: 0, max: 500 };
      default:
        return { min: 0, max: 1 };
    }
  };

  const computedRows = coreKeys
    .map(({ key, label }) => {
      const patientRaw = String(form[key] ?? "");
      const medianRaw = String(COHORT_REFERENCE_FORM[key] ?? "");
      const patientScore = scoreFor(key, patientRaw);
      const medianScore = scoreFor(key, medianRaw);
      const { min, max } = rangeFor(key);
      const denom = max - min || 1;
      const patientNorm = (patientScore - min) / denom;
      const medianNorm = (medianScore - min) / denom;
      const deviation = Math.abs(patientNorm - medianNorm);

      const betterIfHigher = protectiveBetter.has(key);
      const isBetter = betterIfHigher ? patientScore >= medianScore : patientScore <= medianScore;

      const percentile = Math.round(clamp(50 + (patientNorm - medianNorm) * 100, 0, 100));
      const value = patientRaw || "—";
      const median = medianRaw || "—";

      return { key, label, value, median, percentile, deviation, isBetter, patientScore, medianScore };
    })
    .sort((a, b) => (sortAsc ? a.deviation - b.deviation : b.deviation - a.deviation));

  return (
    <div>
      <div className="text-sm font-bold text-slate-800">Сравнение с когортой НМИЦ</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setSortAsc((v) => !v)}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Сортировка: отклонение ({sortAsc ? "по возрастанию" : "по убыванию"})
        </button>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr] bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          <div>Параметр</div>
          <div>Пациент</div>
          <div>Медиана</div>
          <div>Процентиль</div>
          <div />
        </div>
        {computedRows.map((r) => (
          <div key={String(r.key)} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr] border-t border-slate-100 px-3 py-2 text-sm">
            <div className="font-semibold text-slate-700">{r.label}</div>
            <div className="tabular-nums text-slate-800">{r.value}</div>
            <div className="tabular-nums text-slate-600">{r.median}</div>
            <div className="text-slate-600">выше {r.percentile}%</div>
            <div className="flex items-center justify-center">
              <span className={cn("text-lg leading-none", r.isBetter ? "text-emerald-600" : "text-red-600")} aria-label={r.isBetter ? "лучше" : "хуже"}>
                {r.isBetter ? "▲" : "▼"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
