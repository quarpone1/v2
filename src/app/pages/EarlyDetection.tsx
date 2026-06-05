import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Calculator as CalculatorIcon,
  CheckCircle2,
  ChevronDown,
  Database,
  Eye,
  FlaskConical,
  HeartPulse,
  LineChart,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  UserRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../components/Card";
import { cn } from "../../lib/utils";

type Horizon = 1 | 2 | 3;
type ZoneKey = "summary" | "input" | "results";
type TabKey = "trend" | "heatmap" | "radar" | "factors" | "cohort" | "waterfall" | "table";

type EarlyDetectionForm = {
  patientId: string;
  age: string;
  sex: string;
  heightCm: string;
  weightKg: string;
  smoking: string;
  hypertension: string;
  diabetes: string;
  anxiety: string;
  antihypertensiveMeds: string;
  glucoseMeds: string;
  statins: string;
  systolicBp: string;
  diastolicBp: string;
  pulse: string;
  respirationRate: string;
  systolicIqr: string;
  glucose: string;
  creatinine: string;
  bilirubin: string;
  wbc: string;
  hgb: string;
  plt: string;
  mch: string;
  rdw: string;
  therapistVisits: string;
  endocrinologistVisits: string;
  neurologistVisits: string;
  surgeonVisits: string;
  fluorographyCount: string;
  chestCtCount: string;
  colonoscopy: string;
};

type FieldKey = keyof EarlyDetectionForm;

type FieldConfig = {
  key: FieldKey;
  label: string;
  required?: boolean;
  kind?: "number" | "select";
  placeholder?: string;
  unit?: string;
  options?: string[];
};

type FieldSection = {
  title: string;
  subtitle: string;
  icon: typeof UserRound;
  fields: FieldConfig[];
};

type RiskCalculation = ReturnType<typeof calculateRisk>;

type CalculatedSnapshot = {
  form: EarlyDetectionForm;
  simulateEffect: boolean;
  result: RiskCalculation;
  calculatedAt: number;
};

const STORAGE_KEY = "blohin_early_detection_v1";
const REQUIRED_MIN_FIELDS = 15;
const YES_NO = ["да", "нет"];

const defaultForm: EarlyDetectionForm = {
  patientId: "306968",
  age: "67",
  sex: "муж",
  heightCm: "176",
  weightKg: "88",
  smoking: "да",
  hypertension: "да",
  diabetes: "да",
  anxiety: "",
  antihypertensiveMeds: "да",
  glucoseMeds: "нет",
  statins: "",
  systolicBp: "148",
  diastolicBp: "92",
  pulse: "84",
  respirationRate: "21",
  systolicIqr: "",
  glucose: "7.4",
  creatinine: "91",
  bilirubin: "14",
  wbc: "8.7",
  hgb: "126",
  plt: "318",
  mch: "",
  rdw: "",
  therapistVisits: "12",
  endocrinologistVisits: "3",
  neurologistVisits: "",
  surgeonVisits: "",
  fluorographyCount: "0",
  chestCtCount: "",
  colonoscopy: "нет",
};

const sections: FieldSection[] = [
  {
    title: "Демография и идентификация",
    subtitle: "Цифровой ID, возраст, пол и расчет ИМТ",
    icon: UserRound,
    fields: [
      { key: "patientId", label: "Цифровой ID пациента", placeholder: "306968" },
      { key: "age", label: "Возраст", required: true, kind: "number", unit: "лет", placeholder: "18-110" },
      { key: "sex", label: "Пол", required: true, kind: "select", options: ["муж", "жен"] },
      { key: "heightCm", label: "Рост", kind: "number", unit: "см" },
      { key: "weightKg", label: "Вес", kind: "number", unit: "кг" },
    ],
  },
  {
    title: "Образ жизни и анамнез",
    subtitle: "Анкетные факторы и терапия хронических состояний",
    icon: HeartPulse,
    fields: [
      { key: "smoking", label: "Курение >=1 сигареты в день", required: true, kind: "select", options: YES_NO },
      { key: "hypertension", label: "Гипертоническая болезнь", required: true, kind: "select", options: YES_NO },
      { key: "diabetes", label: "Сахарный диабет", required: true, kind: "select", options: YES_NO },
      { key: "anxiety", label: "Тревожность / депрессия", kind: "select", options: YES_NO },
      { key: "antihypertensiveMeds", label: "Препараты для снижения давления", required: true, kind: "select", options: YES_NO },
      { key: "glucoseMeds", label: "Препараты для снижения сахара", required: true, kind: "select", options: YES_NO },
      { key: "statins", label: "Препараты для снижения холестерина", kind: "select", options: YES_NO },
    ],
  },
  {
    title: "Витальные показатели",
    subtitle: "Медианные значения за последние 12 месяцев",
    icon: Stethoscope,
    fields: [
      { key: "systolicBp", label: "Давление систолическое", required: true, kind: "number", unit: "мм рт. ст." },
      { key: "diastolicBp", label: "Давление диастолическое", required: true, kind: "number", unit: "мм рт. ст." },
      { key: "pulse", label: "Частота пульса", required: true, kind: "number", unit: "уд/мин" },
      { key: "respirationRate", label: "Частота дыхания", required: true, kind: "number", unit: "вдохов/мин" },
      { key: "systolicIqr", label: "Вариабельность давления", kind: "number", unit: "IQR" },
    ],
  },
  {
    title: "Лабораторные показатели",
    subtitle: "Медианы анализов за последние 24 месяца",
    icon: FlaskConical,
    fields: [
      { key: "glucose", label: "Глюкоза крови", required: true, kind: "number", unit: "ммоль/л" },
      { key: "creatinine", label: "Креатинин", required: true, kind: "number", unit: "мкмоль/л" },
      { key: "bilirubin", label: "Общий билирубин", required: true, kind: "number", unit: "мкмоль/л" },
      { key: "wbc", label: "WBC, лейкоциты", required: true, kind: "number", unit: "x10^9/л" },
      { key: "hgb", label: "HGB, гемоглобин", required: true, kind: "number", unit: "г/л" },
      { key: "plt", label: "PLT, тромбоциты", required: true, kind: "number", unit: "x10^9/л" },
      { key: "mch", label: "MCH", kind: "number", unit: "пг" },
      { key: "rdw", label: "RDW-CV", kind: "number", unit: "%" },
    ],
  },
  {
    title: "Обращения и исследования",
    subtitle: "Частота контактов с врачами и скрининг",
    icon: Database,
    fields: [
      { key: "therapistVisits", label: "Визиты к терапевту", required: true, kind: "number", unit: "за 3 года" },
      { key: "endocrinologistVisits", label: "Визиты к эндокринологу", required: true, kind: "number", unit: "за 3 года" },
      { key: "neurologistVisits", label: "Визиты к неврологу", kind: "number", unit: "за 3 года" },
      { key: "surgeonVisits", label: "Визиты к хирургу", kind: "number", unit: "за 3 года" },
      { key: "fluorographyCount", label: "Количество флюорографий", required: true, kind: "number", unit: "за 3 года" },
      { key: "chestCtCount", label: "КТ органов грудной клетки", kind: "number", unit: "за 3 года" },
      { key: "colonoscopy", label: "Колоноскопия за 5 лет", kind: "select", options: YES_NO },
    ],
  },
];

const requiredKeys = sections.flatMap((section) => section.fields.filter((field) => field.required).map((field) => field.key));
const trackedKeys = sections.flatMap((section) => section.fields.map((field) => field.key));
const visibleKeys = new Set<FieldKey>([
  "patientId",
  "age",
  "sex",
  "heightCm",
  "weightKg",
  "smoking",
  "hypertension",
  "diabetes",
  "antihypertensiveMeds",
  "glucoseMeds",
  "systolicBp",
  "diastolicBp",
  "pulse",
  "respirationRate",
  "glucose",
  "creatinine",
  "bilirubin",
  "wbc",
  "hgb",
  "plt",
  "therapistVisits",
  "endocrinologistVisits",
  "fluorographyCount",
  "colonoscopy",
]);

function numberValue(value: string, fallback = 0) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function getRiskLevel(risk: number) {
  if (risk < 30) {
    return { label: "Низкий", className: "text-emerald-600", bar: "bg-emerald-500", chip: "bg-emerald-50" };
  }
  if (risk <= 60) {
    return { label: "Средний", className: "text-amber-600", bar: "bg-amber-500", chip: "bg-amber-50" };
  }
  return { label: "Высокий", className: "text-red-600", bar: "bg-red-500", chip: "bg-red-50" };
}

function getTrajectory(horizon: Horizon, risks: Record<Horizon, number>) {
  if (horizon === 1) return "исходная оценка";
  const delta = risks[horizon] - risks[(horizon - 1) as Horizon];
  if (delta > 8) return "резкий рост";
  if (delta > 2) return "плавный рост";
  if (delta < -2) return "снижение";
  return "стабильный";
}

function getInitialForm() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultForm, ...JSON.parse(saved) } as EarlyDetectionForm : defaultForm;
  } catch {
    return defaultForm;
  }
}

function calculateBmi(form: EarlyDetectionForm) {
  const height = numberValue(form.heightCm);
  const weight = numberValue(form.weightKg);
  if (!height || !weight) return null;
  return weight / ((height / 100) ** 2);
}

function calculateRisk(form: EarlyDetectionForm, simulateEffect: boolean) {
  const age = numberValue(form.age, 60);
  const systolic = numberValue(form.systolicBp);
  const respiration = numberValue(form.respirationRate);
  const glucose = numberValue(form.glucose);
  const wbc = numberValue(form.wbc);
  const hgb = numberValue(form.hgb);
  const therapistVisits = numberValue(form.therapistVisits);
  const endocrinologistVisits = numberValue(form.endocrinologistVisits);
  const fluorographyCount = numberValue(form.fluorographyCount);

  const ageImpact = clamp((age - 45) * 0.55, 0, 20);
  const visitImpact = clamp(therapistVisits * 0.8 + endocrinologistVisits * 0.6, 0, 14);
  const glucoseImpact = clamp((glucose - 5.8) * 4, 0, 14);
  const respirationImpact = clamp((respiration - 18) * 2.2, 0, 12);
  const sexImpact = form.sex === "муж" ? 4 : 2;
  const smokingImpact = form.smoking === "да" ? 8 : 0;
  const hypertensionImpact = form.hypertension === "да" || systolic >= 140 ? 5 : 0;
  const diabetesImpact = form.diabetes === "да" ? 4 : 0;
  const labsImpact = (wbc > 8 ? 3 : 0) + (hgb > 0 && hgb < 120 ? 5 : 0);
  const screeningGapImpact = fluorographyCount === 0 ? 4 : 0;

  const baseRisk = clamp(
    6 + ageImpact + visitImpact + glucoseImpact + respirationImpact + sexImpact + smokingImpact +
      hypertensionImpact + diabetesImpact + labsImpact + screeningGapImpact
  );

  const effectReduction =
    (simulateEffect && form.smoking === "да" ? 15 : 0) +
    (simulateEffect && hypertensionImpact > 0 ? 10 : 0) +
    (simulateEffect && glucoseImpact > 0 ? 12 : 0);
  const adjusted = baseRisk * (1 - Math.min(effectReduction, 27) / 100);

  return {
    risks: {
      1: clamp(adjusted),
      2: clamp(adjusted * 0.48 + (age > 65 ? 2 : 0)),
      3: clamp(adjusted * 0.58 + (form.smoking === "да" ? 3 : 0)),
    } satisfies Record<Horizon, number>,
    factorContribs: [
      { name: "Возраст", value: ageImpact, fill: "#0f766e" },
      { name: "Визиты к терапевту", value: visitImpact, fill: "#2563eb" },
      { name: "Глюкоза, медиана", value: glucoseImpact, fill: "#ea580c" },
      { name: "Частота дыхания", value: respirationImpact, fill: "#dc2626" },
      { name: "Пол", value: sexImpact, fill: "#7c3aed" },
    ],
    effectReduction,
  };
}

function Zone({
  title,
  subtitle,
  icon: Icon,
  zoneKey,
  openZones,
  setOpenZones,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof UserRound;
  zoneKey: ZoneKey;
  openZones: Record<ZoneKey, boolean>;
  setOpenZones: React.Dispatch<React.SetStateAction<Record<ZoneKey, boolean>>>;
  children: ReactNode;
}) {
  const isOpen = openZones[zoneKey];

  return (
    <Card noPadding>
      <button
        type="button"
        onClick={() => setOpenZones((current) => ({ ...current, [zoneKey]: !current[zoneKey] }))}
        className="flex w-full items-center justify-between gap-4 border-b border-slate-200/60 px-5 py-4 text-left sm:px-6"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <Icon size={20} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-slate-900">{title}</span>
            <span className="block truncate text-sm font-normal text-slate-500">{subtitle}</span>
          </span>
        </span>
        <ChevronDown className={cn("size-5 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && <div className="p-5 sm:p-6">{children}</div>}
    </Card>
  );
}

function Field({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (key: FieldKey, value: string) => void }) {
  const id = `early-${field.key}`;

  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </span>
      <span className="relative block">
        {field.kind === "select" ? (
          <select
            id={id}
            value={value}
            onChange={(event) => onChange(field.key, event.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          >
            <option value="">Не указано</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            value={value}
            onChange={(event) => onChange(field.key, event.target.value)}
            inputMode={field.kind === "number" ? "decimal" : "text"}
            placeholder={field.placeholder}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 pr-20 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          />
        )}
        {field.unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {field.unit}
          </span>
        )}
      </span>
    </label>
  );
}

function RiskCard({ horizon, risk, risks }: { horizon: Horizon; risk: number; risks: Record<Horizon, number> }) {
  const level = getRiskLevel(risk);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-500">{horizon} год</div>
          <div className={cn("mt-1 text-4xl font-bold tracking-tight", level.className)}>{formatPercent(risk)}</div>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold", level.className, level.chip)}>
          {level.label}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", level.bar)} style={{ width: `${clamp(risk)}%` }} />
      </div>
      <div className="mt-3 text-xs font-medium text-slate-500">Траектория: {getTrajectory(horizon, risks)}</div>
    </div>
  );
}

function StatusPill({ kind, children }: { kind: "good" | "warn" | "bad" | "neutral"; children: ReactNode }) {
  const className = {
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-700",
    bad: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
  }[kind];

  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", className)}>{children}</span>;
}

export function EarlyDetection() {
  const [form, setForm] = useState<EarlyDetectionForm>(getInitialForm);
  const [showAllParams, setShowAllParams] = useState(false);
  const [openZones, setOpenZones] = useState<Record<ZoneKey, boolean>>({ summary: true, input: true, results: true });
  const [activeTab, setActiveTab] = useState<TabKey>("trend");
  const [calculatedSnapshot, setCalculatedSnapshot] = useState<CalculatedSnapshot | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [simulateEffect, setSimulateEffect] = useState(false);
  const calculationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    return () => {
      if (calculationTimerRef.current) {
        window.clearTimeout(calculationTimerRef.current);
      }
    };
  }, []);

  const bmi = useMemo(() => calculateBmi(form), [form]);
  const filledRequired = useMemo(() => requiredKeys.filter((key) => Boolean(form[key])).length, [form]);
  const filledAll = useMemo(() => trackedKeys.filter((key) => Boolean(form[key])).length, [form]);
  const completion = Math.round((filledAll / trackedKeys.length) * 100);
  const loadedEvents = 126 + filledAll * 3;
  const availableEvents = 216;
  const enoughData = filledRequired >= REQUIRED_MIN_FIELDS;
  const qualityKind = completion >= 80 ? "good" : completion >= 70 ? "warn" : "bad";
  const resultForm = calculatedSnapshot?.form ?? form;
  const risks = calculatedSnapshot?.result.risks ?? ({ 1: 0, 2: 0, 3: 0 } satisfies Record<Horizon, number>);
  const factorContribs = calculatedSnapshot?.result.factorContribs ?? [];
  const effectReduction = calculatedSnapshot?.result.effectReduction ?? 0;

  const trendData = useMemo(
    () => [
      { horizon: "1 год", patient: Number(risks[1].toFixed(1)), reference: 28 },
      { horizon: "2 года", patient: Number(risks[2].toFixed(1)), reference: 24 },
      { horizon: "3 года", patient: Number(risks[3].toFixed(1)), reference: 31 },
    ],
    [risks]
  );

  const heatmapRows = useMemo(
    () => factorContribs.map((factor) => ({
      name: factor.name,
      values: [
        clamp(factor.value * 1.0, 0, 18),
        clamp(factor.value * 0.72, 0, 18),
        clamp(factor.value * 0.86, 0, 18),
      ],
    })),
    [factorContribs]
  );

  const radarData = useMemo(() => [
    { metric: "Возраст", patient: clamp(numberValue(resultForm.age) / 0.9), reference: 63 },
    { metric: "Курение", patient: resultForm.smoking === "да" ? 82 : 18, reference: 34 },
    { metric: "Глюкоза", patient: clamp(numberValue(resultForm.glucose) * 10), reference: 58 },
    { metric: "Визиты", patient: clamp(numberValue(resultForm.therapistVisits) * 7), reference: 38 },
    { metric: "Давление", patient: clamp(numberValue(resultForm.systolicBp) / 1.7), reference: 72 },
    { metric: "Скрининг", patient: resultForm.fluorographyCount === "0" ? 18 : 68, reference: 56 },
  ], [resultForm]);

  const histogramData = useMemo(() => [
    { bucket: "0-10", count: 14 },
    { bucket: "10-20", count: 28 },
    { bucket: "20-30", count: 46 },
    { bucket: "30-40", count: 58 },
    { bucket: "40-50", count: 42 },
    { bucket: "50-60", count: 31 },
    { bucket: "60-70", count: 18 },
    { bucket: "70+", count: 9 },
  ], []);

  const referenceRows = useMemo(() => [
    { label: "Возраст", patient: `${resultForm.age || "-"} лет`, median: "63", percentile: "72", status: "warn" as const },
    { label: "Пол", patient: resultForm.sex || "-", median: "жен", percentile: "58", status: "neutral" as const },
    { label: "Курение", patient: resultForm.smoking || "-", median: "нет", percentile: resultForm.smoking === "да" ? "84" : "32", status: resultForm.smoking === "да" ? "bad" as const : "good" as const },
    { label: "Глюкоза", patient: `${resultForm.glucose || "-"} ммоль/л`, median: "5.6", percentile: numberValue(resultForm.glucose) > 6.1 ? "78" : "44", status: numberValue(resultForm.glucose) > 6.1 ? "bad" as const : "good" as const },
    { label: "Частота дыхания", patient: `${resultForm.respirationRate || "-"} вдохов/мин`, median: "17", percentile: numberValue(resultForm.respirationRate) > 19 ? "81" : "48", status: numberValue(resultForm.respirationRate) > 19 ? "bad" as const : "neutral" as const },
    { label: "Визиты к терапевту", patient: resultForm.therapistVisits || "-", median: "5", percentile: numberValue(resultForm.therapistVisits) > 8 ? "88" : "52", status: numberValue(resultForm.therapistVisits) > 8 ? "bad" as const : "neutral" as const },
    { label: "Флюорография", patient: resultForm.fluorographyCount || "-", median: "1", percentile: resultForm.fluorographyCount === "0" ? "22" : "64", status: resultForm.fluorographyCount === "0" ? "warn" as const : "good" as const },
  ], [resultForm]);

  const updateField = (key: FieldKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (calculatedSnapshot) setIsDirty(true);
  };

  const toggleSimulateEffect = () => {
    setSimulateEffect((value) => !value);
    if (calculatedSnapshot) setIsDirty(true);
  };

  const handleCalculate = () => {
    if (!enoughData || isCalculating) return;
    setIsCalculating(true);
    setOpenZones((current) => ({ ...current, results: true }));
    if (calculationTimerRef.current) {
      window.clearTimeout(calculationTimerRef.current);
    }

    calculationTimerRef.current = window.setTimeout(() => {
      setCalculatedSnapshot({
        form: { ...form },
        simulateEffect,
        result: calculateRisk(form, simulateEffect),
        calculatedAt: Date.now(),
      });
      setIsDirty(false);
      setIsCalculating(false);
      calculationTimerRef.current = null;
    }, 700);
  };

  const resetForm = () => {
    if (calculationTimerRef.current) {
      window.clearTimeout(calculationTimerRef.current);
      calculationTimerRef.current = null;
    }
    setForm(defaultForm);
    setSimulateEffect(false);
    setIsDirty(false);
    setCalculatedSnapshot(null);
    setIsCalculating(false);
  };

  const tabs: { key: TabKey; label: string; icon: typeof LineChart }[] = [
    { key: "trend", label: "Динамика", icon: LineChart },
    { key: "heatmap", label: "Тепловая карта", icon: Target },
    { key: "radar", label: "Профиль", icon: Sparkles },
    { key: "factors", label: "Вклад", icon: BarChart3 },
    { key: "cohort", label: "Когорта", icon: Database },
    { key: "waterfall", label: "Водопад", icon: RefreshCw },
    { key: "table", label: "Датасет", icon: Brain },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-5"
    >
      <Zone
        title="Раннее выявление рака легкого и колоректального рака"
        subtitle="Оценка риска у пациентов без установленного онкологического диагноза"
        icon={Eye}
        zoneKey="summary"
        openZones={openZones}
        setOpenZones={setOpenZones}
      >
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <StatusPill kind="neutral">Пациент ID {form.patientId || "не задан"}</StatusPill>
              <StatusPill kind={enoughData ? "good" : "warn"}>
                {filledRequired}/{requiredKeys.length} обязательных полей
              </StatusPill>
              <StatusPill kind={qualityKind}>
                Полнота {completion}%
              </StatusPill>
              {isDirty && <StatusPill kind="warn">Данные изменены, требуется пересчет</StatusPill>}
            </div>
            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900">
              Сервис раннего выявления для пациентов групп риска
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
              Оценка вероятности выявления диагнозов C34 и C18-C20 на горизонтах 1, 2 и 3 года по
              данным амбулаторной карты: демографии, витальным показателям, лаборатории, обращениям и скринингу.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-3xl border border-teal-100 bg-teal-50/70 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-teal-700">Объем данных</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{loadedEvents}/{availableEvents}</div>
              <div className="text-xs text-slate-500">событий загружено / доступно</div>
            </div>
            <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-sky-700">Качество данных</div>
              <div className="mt-1 flex items-center gap-2">
                {qualityKind === "good" ? <ShieldCheck className="text-emerald-600" /> : <ShieldAlert className="text-amber-600" />}
                <span className="text-2xl font-bold text-slate-900">{completion}%</span>
              </div>
              <div className="text-xs text-slate-500">точность снижена при полноте ниже 70%</div>
            </div>
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">ИМТ</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{bmi ? bmi.toFixed(1) : "-"}</div>
              <div className="text-xs text-slate-500">авторасчет по росту и весу</div>
            </div>
          </div>
        </div>
      </Zone>

      <Zone
        title="Ввод медицинских параметров"
        subtitle={`Минимум ${REQUIRED_MIN_FIELDS} обязательных полей; опциональные параметры скрываются`}
        icon={CalculatorIcon}
        zoneKey="input"
        openZones={openZones}
        setOpenZones={setOpenZones}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="h-3 min-w-[220px] flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                qualityKind === "good" ? "bg-emerald-500" : qualityKind === "warn" ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${completion}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowAllParams((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-700"
          >
            {showAllParams ? "Скрыть опциональные" : "Показать все параметры"}
            <ChevronDown className={cn("size-4 transition-transform", showAllParams && "rotate-180")} />
          </button>
        </div>

        <div className="space-y-5">
          {sections.map((section) => {
            const fields = showAllParams ? section.fields : section.fields.filter((field) => visibleKeys.has(field.key));
            if (!fields.length) return null;
            return (
              <section key={section.title} className="rounded-3xl border border-slate-200/70 bg-white/55 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <section.icon size={20} aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{section.title}</h2>
                    <p className="text-xs text-slate-500">{section.subtitle}</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {fields.map((field) => (
                    <Field key={field.key} field={field} value={form[field.key]} onChange={updateField} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!enoughData || isCalculating}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition",
              enoughData && !isCalculating ? "bg-teal-600 hover:bg-teal-700" : "cursor-not-allowed bg-slate-300 shadow-none"
            )}
          >
            {isCalculating ? (
              <RefreshCw size={18} className="animate-spin" aria-hidden />
            ) : (
              <CalculatorIcon size={18} aria-hidden />
            )}
            {isCalculating ? "Расчёт прогноза..." : calculatedSnapshot && !isDirty ? "Прогноз рассчитан" : "Рассчитать прогноз"}
          </button>
          {!enoughData && (
            <span className="text-sm font-medium text-amber-700">
              Для расчёта нужно минимум {REQUIRED_MIN_FIELDS} обязательных полей.
            </span>
          )}
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300"
          >
            <RefreshCw size={18} aria-hidden />
            Вернуть пример пациента
          </button>
        </div>
      </Zone>

      <Zone
        title="Результаты прогноза и клинические действия"
        subtitle="Риски на 1, 2, 3 года, вклад факторов, сравнение с датасетом и скрининг"
        icon={BarChart3}
        zoneKey="results"
        openZones={openZones}
        setOpenZones={setOpenZones}
      >
        {isCalculating ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-teal-100 bg-teal-50/70 p-6 text-sm text-teal-800"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="size-5 animate-spin" aria-hidden />
              <span className="font-bold">Модель обрабатывает введённые параметры...</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
              <motion.div
                className="h-full rounded-full bg-teal-600"
                initial={{ width: "12%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.68, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : !calculatedSnapshot ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
            Заполните обязательные поля и запустите расчет прогноза.
          </div>
        ) : (
          <motion.div
            key={calculatedSnapshot.calculatedAt}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            className="space-y-5"
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {([1, 2, 3] as Horizon[]).map((horizon) => (
                <RiskCard key={horizon} horizon={horizon} risk={risks[horizon]} risks={risks} />
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
              <Card noPadding className="rounded-3xl">
                <div className="flex gap-2 overflow-x-auto border-b border-slate-200/60 p-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition",
                        activeTab === tab.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <tab.icon size={15} aria-hidden />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="min-h-[360px] p-5">
                  {activeTab === "trend" && (
                    <ResponsiveContainer width="100%" height={330}>
                      <ComposedChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="horizon" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Line type="monotone" name="Пациент" dataKey="patient" stroke="#0f766e" strokeWidth={3} dot={{ r: 5 }} />
                        <Line type="monotone" name="Референсная когорта" dataKey="reference" stroke="#94a3b8" strokeDasharray="6 5" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}

                  {activeTab === "heatmap" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <span>Фактор</span>
                        <span>1 год</span>
                        <span>2 года</span>
                        <span>3 года</span>
                      </div>
                      {heatmapRows.map((row) => (
                        <div key={row.name} className="grid grid-cols-[1.2fr_repeat(3,1fr)] gap-2">
                          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">{row.name}</div>
                          {row.values.map((value, index) => (
                            <div
                              key={`${row.name}-${index}`}
                              className="rounded-2xl px-3 py-3 text-center text-sm font-bold text-white"
                              style={{ backgroundColor: `rgba(15, 118, 110, ${0.25 + value / 22})` }}
                            >
                              +{value.toFixed(1)}%
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "radar" && (
                    <ResponsiveContainer width="100%" height={330}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Пациент" dataKey="patient" stroke="#0f766e" fill="#0f766e" fillOpacity={0.28} />
                        <Radar name="Условно здоровая когорта" dataKey="reference" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.18} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}

                  {activeTab === "factors" && (
                    <ResponsiveContainer width="100%" height={330}>
                      <BarChart data={factorContribs} layout="vertical" margin={{ left: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tickFormatter={(value) => `+${value}%`} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(value) => `+${Number(value).toFixed(1)}% к базовому риску`} />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                          {factorContribs.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeTab === "cohort" && (
                    <ResponsiveContainer width="100%" height={330}>
                      <BarChart data={histogramData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="bucket" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                        <ReferenceLine x={risks[1] >= 70 ? "70+" : `${Math.floor(risks[1] / 10) * 10}-${Math.floor(risks[1] / 10) * 10 + 10}`} stroke="#dc2626" strokeWidth={2} label="Пациент" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeTab === "waterfall" && (
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                          <span>Средний начальный риск</span>
                          <span>6.0%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200" />
                      </div>
                      {factorContribs.map((factor) => (
                        <div key={factor.name} className="rounded-2xl border border-slate-100 bg-white p-4">
                          <div className="mb-2 flex justify-between text-sm font-bold text-slate-700">
                            <span>{factor.name}</span>
                            <span>+{factor.value.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full" style={{ width: `${clamp(factor.value * 4)}%`, backgroundColor: factor.fill }} />
                          </div>
                        </div>
                      ))}
                      <div className="rounded-2xl bg-teal-50 p-4 text-teal-800">
                        <div className="flex justify-between text-sm font-bold">
                          <span>Итоговый риск пациента на 1 год</span>
                          <span>{formatPercent(risks[1])}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "table" && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                            <th className="py-3 pr-3">Параметр</th>
                            <th className="py-3 pr-3">Пациент</th>
                            <th className="py-3 pr-3">Медиана датасета</th>
                            <th className="py-3 pr-3">Процентиль</th>
                            <th className="py-3">Индикатор</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referenceRows.map((row) => (
                            <tr key={row.label} className="border-b border-slate-100">
                              <td className="py-3 pr-3 font-semibold text-slate-800">{row.label}</td>
                              <td className="py-3 pr-3 text-slate-600">{row.patient}</td>
                              <td className="py-3 pr-3 text-slate-600">{row.median}</td>
                              <td className="py-3 pr-3 text-slate-600">{row.percentile}%</td>
                              <td className="py-3">
                                <StatusPill kind={row.status}>{row.status === "bad" ? "выше риска" : row.status === "warn" ? "погранично" : row.status === "good" ? "лучше" : "средне"}</StatusPill>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="rounded-3xl">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-amber-600" size={20} aria-hidden />
                    <h2 className="font-bold text-slate-900">Ключевые факторы риска</h2>
                  </div>
                  <div className="space-y-3">
                    {factorContribs.map((factor, index) => (
                      <div key={factor.name} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                        <span className="text-sm font-semibold text-slate-700">{index + 1}. {factor.name}</span>
                        <span className="text-sm font-bold text-slate-900">+{factor.value.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-3xl">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900">Модифицируемые факторы</h2>
                      <p className="text-xs text-slate-500">Курение, давление, глюкоза и приверженность скринингу</p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSimulateEffect}
                      className={cn(
                        "rounded-full px-3 py-2 text-xs font-bold transition",
                        simulateEffect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                    >
                      Смоделировать эффект
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span>Отказ от курения: предполагаемое снижение риска 15%.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span>Достижение целевого давления: снижение риска 10%.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span>Компенсация гипергликемии: снижение риска 12%.</span>
                    </div>
                  </div>
                  {simulateEffect !== calculatedSnapshot.simulateEffect && (
                    <div className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
                      Сценарий изменён. Нажмите «Рассчитать прогноз», чтобы применить моделирование к результатам.
                    </div>
                  )}
                  {calculatedSnapshot.simulateEffect && (
                    <div className="mt-4 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                      Применён сценарий: суммарное снижение {effectReduction}%.
                    </div>
                  )}
                </Card>

                <Card className="rounded-3xl">
                  <h2 className="mb-4 font-bold text-slate-900">Рекомендации по дообследованию</h2>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-red-50 p-3 text-red-800">
                      Высокий риск C34: КТ ОГК с низкой дозой облучения.
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3 text-amber-800">
                      Повышенная глюкоза: контроль диабета, РЭА и CA 19-9.
                    </div>
                    <div className="rounded-2xl bg-sky-50 p-3 text-sky-800">
                      Частые визиты неясной этиологии: расширенный скрининг.
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
              <Card className="rounded-3xl">
                <h2 className="mb-4 font-bold text-slate-900">Расширение скрининга</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="pb-3 pr-3">Горизонт</th>
                        <th className="pb-3 pr-3">Обследование</th>
                        <th className="pb-3">Частота</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 pr-3 font-bold">1 год</td>
                        <td className="py-3 pr-3">КТ ОГК, колоноскопия, РЭА</td>
                        <td className="py-3">Каждые 6 мес</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-3 font-bold">2 года</td>
                        <td className="py-3 pr-3">КТ ОГК, анализ кала на скрытую кровь</td>
                        <td className="py-3">Ежегодно</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-3 font-bold">3 года</td>
                        <td className="py-3 pr-3">Флюорография, контроль глюкозы</td>
                        <td className="py-3">Ежегодно</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="rounded-3xl">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="text-teal-700" size={20} aria-hidden />
                  <h2 className="font-bold text-slate-900">Научная обоснованность</h2>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Модель раннего выявления разработана на основе ретроспективного анализа данных пациентов с впервые
                  установленным диагнозом рака легкого (C34) и колоректального рака (C18-C20), проходивших лечение
                  в НМИЦ им. Н.Н. Блохина. Использована продольная история медицинских событий за 3-5 лет до диагноза.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xl font-bold text-slate-900">5 тысяч</div>
                    <div className="text-xs text-slate-500">пациентов</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xl font-bold text-slate-900">25</div>
                    <div className="text-xs text-slate-500">значимых параметров</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xl font-bold text-slate-900">1/2/3</div>
                    <div className="text-xs text-slate-500">года прогноза</div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Окончательное решение о дообследовании принимает лечащий врач. При полноте данных ниже 70%
                  точность прогноза снижена.
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </Zone>
    </motion.div>
  );
}
