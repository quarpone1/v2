import { useMemo, useState, useCallback, type ComponentType, type ReactNode } from "react";
import { motion } from "motion/react";
import { Card } from "../components/Card";
import { patientsData } from "../../data/mock";
import {
  User,
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
} from "recharts";
import { cn } from "../../lib/utils";

type Horizon = 1 | 3 | 5;

type FormState = {
  patientId: string;
  age: string;
  heightCm: string;
  weightKg: string;
  stage: string;
  pT: string;
  nodesExamined: string;
  nodesAffected: string;
  nras: string;
  operation: string;
  surgicalAccess: string;
  therapySite: string;
  cea: string;
  lymphocytesAbs: string;
  leukocytes: string;
  hemoglobin: string;
  platelets: string;
  ast: string;
  bilirubin: string;
};

const emptyForm = (): FormState => ({
  patientId: "",
  age: "",
  heightCm: "",
  weightKg: "",
  stage: "",
  pT: "",
  nodesExamined: "",
  nodesAffected: "",
  nras: "",
  operation: "",
  surgicalAccess: "",
  therapySite: "",
  cea: "",
  lymphocytesAbs: "",
  leukocytes: "",
  hemoglobin: "",
  platelets: "",
  ast: "",
  bilirubin: "",
});

const CE_ANORM_HINT = "норма ≤ 5 нг/мл";

function parseNum(s: string): number {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
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

const FACTOR_PLACEHOLDERS: Record<Horizon, { name: string; widthPct: number; signed: string }[]> = {
  1: [
    { name: "Фактор 1", widthPct: 100, signed: "+12%" },
    { name: "Фактор 2", widthPct: 80, signed: "+9%" },
    { name: "Фактор 3", widthPct: 60, signed: "-4%" },
    { name: "Фактор 4", widthPct: 40, signed: "+3%" },
    { name: "Фактор 5", widthPct: 20, signed: "-2%" },
  ],
  3: [
    { name: "Фактор 1", widthPct: 100, signed: "+18%" },
    { name: "Фактор 2", widthPct: 75, signed: "+11%" },
    { name: "Фактор 3", widthPct: 55, signed: "+7%" },
    { name: "Фактор 4", widthPct: 35, signed: "-5%" },
  ],
  5: [
    { name: "Фактор 1", widthPct: 100, signed: "+22%" },
    { name: "Фактор 2", widthPct: 70, signed: "+14%" },
    { name: "Фактор 3", widthPct: 50, signed: "+8%" },
    { name: "Фактор 4", widthPct: 30, signed: "-6%" },
    { name: "Фактор 5", widthPct: 15, signed: "+2%" },
  ],
};

function demoProbsFromForm(f: FormState): { y1: number; y3: number; y5: number } {
  const seed =
    parseNum(f.age) * 1.1 +
    parseNum(f.cea) * 0.4 +
    parseNum(f.nodesAffected) * 3 +
    parseNum(f.ast) * 0.05;
  const base = 8 + (seed % 40);
  const y1 = Math.min(95, Math.max(2, base * 0.45));
  const y3 = Math.min(96, Math.max(y1 + 2, base * 0.85));
  const y5 = Math.min(97, Math.max(y3 + 2, base * 1.05));
  return {
    y1: Math.round(y1 * 10) / 10,
    y3: Math.round(y3 * 10) / 10,
    y5: Math.round(y5 * 10) / 10,
  };
}

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
const labelCls = "text-xs font-semibold text-slate-600";

export function Calculator() {
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [factorHorizon, setFactorHorizon] = useState<Horizon>(1);
  const [hasResult, setHasResult] = useState(false);

  const bmi = useMemo(() => {
    const h = parseNum(form.heightCm);
    const w = parseNum(form.weightKg);
    if (h <= 0 || w <= 0) return null;
    const m = h / 100;
    const v = w / (m * m);
    return Math.round(v * 10) / 10;
  }, [form.heightCm, form.weightKg]);

  const probs = useMemo(() => demoProbsFromForm(form), [form]);
  const traj = useMemo(() => trajectoryFromProbs(probs.y1, probs.y3, probs.y5), [probs]);

  const cohortBands = useMemo(
    () => [
      { x: 1, patient: probs.y1, median: Math.max(5, probs.y1 - 2 + (probs.y3 % 5)), q1: Math.max(2, probs.y1 - 8), q3: Math.min(92, probs.y1 + 10) },
      { x: 3, patient: probs.y3, median: Math.max(8, probs.y3 - 3 + (probs.y5 % 4)), q1: Math.max(3, probs.y3 - 12), q3: Math.min(94, probs.y3 + 12) },
      { x: 5, patient: probs.y5, median: Math.max(10, probs.y5 - 4 + (probs.y1 % 6)), q1: Math.max(4, probs.y5 - 14), q3: Math.min(96, probs.y5 + 14) },
    ],
    [probs]
  );

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleLoad = () => {
    const p = patientsData[0];
    if (!p) return;
    setForm({
      ...emptyForm(),
      patientId: p.id,
      age: String(p.age ?? 62),
      heightCm: "172",
      weightKg: "78",
      stage: "III",
      pT: "T3",
      nodesExamined: "18",
      nodesAffected: p.stage === "III" || p.stage === "IV" ? "3" : "1",
      nras: "не мутирован",
      operation: OPERATION_OPTIONS[3] ?? "",
      surgicalAccess: ACCESS_OPTIONS[1] ?? "",
      therapySite: SITE_OPTIONS[1] ?? "",
      cea: "18.2",
      lymphocytesAbs: "1.2",
      leukocytes: "6.8",
      hemoglobin: "118",
      platelets: "240",
      ast: "32",
      bilirubin: "14",
    });
  };

  const handleClear = () => {
    setHasResult(false);
    setForm(emptyForm());
  };

  const handleCalculate = () => {
    setHasResult(true);
  };

  const riskCards: { h: Horizon; pct: number }[] = [
    { h: 1, pct: probs.y1 },
    { h: 3, pct: probs.y3 },
    { h: 5, pct: probs.y5 },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-1 py-4 sm:px-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-4"
      >
        {/* Верхняя зона ~20% */}
        <section
          className="flex min-h-[18vh] flex-shrink-0 flex-col justify-center rounded-[28px] border border-white/70 bg-white/55 px-5 py-5 shadow-sm backdrop-blur-md sm:px-8"
          aria-labelledby="blohin-prognosis-title"
        >
          <h1 id="blohin-prognosis-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Индивидуальный прогноз при колоректальном раке
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Инструмент для врачей-онкологов на основе модели машинного обучения, обученной на данных более 500 пациентов
            НМИЦ им. Н.Н. Блохина. Введите 18 клинических параметров и получите оценку риска на горизонтах 1, 3 и 5 лет.
          </p>
          <div className="mt-4 max-w-md">
            <label htmlFor="patient-ident" className={labelCls}>
              Идентификация пациента
            </label>
            <input
              id="patient-ident"
              type="text"
              autoComplete="off"
              placeholder="ID / условный номер / ФИО"
              value={form.patientId}
              onChange={(e) => setField("patientId", e.target.value)}
              className={cn(inputCls, "mt-1.5")}
            />
          </div>
        </section>

        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-4 lg:grid-rows-none">
          {/* Центральная зона ~50% — форма */}
          <section
            className="min-h-[42vh] flex-shrink-0 lg:min-h-[48vh]"
            aria-label="Форма ввода параметров"
          >
            <Card className="flex h-full flex-col overflow-hidden p-5 sm:p-7">
              <h2 className="text-lg font-bold text-slate-800">Параметры для расчёта</h2>
              <p className="mt-1 text-sm text-slate-500">
                18 полей в 6 логических группах. Минимизируйте клики: используйте Tab и готовые списки значений.
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <FormGroup icon={User} title="Демография">
                  <Field label="Возраст, лет">
                    <input className={inputCls} inputMode="numeric" value={form.age} onChange={(e) => setField("age", e.target.value)} />
                  </Field>
                  <Field label="Рост, см">
                    <input className={inputCls} inputMode="decimal" value={form.heightCm} onChange={(e) => setField("heightCm", e.target.value)} />
                  </Field>
                  <Field label="Вес, кг">
                    <input className={inputCls} inputMode="decimal" value={form.weightKg} onChange={(e) => setField("weightKg", e.target.value)} />
                  </Field>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
                    <span className="font-semibold text-slate-600">ИМТ: </span>
                    <span className="tabular-nums font-bold">{bmi != null ? `${bmi} кг/м²` : "—"}</span>
                  </div>
                </FormGroup>

                <FormGroup icon={Layers} title="Стадия и pT">
                  <Field label="Стадия заболевания">
                    <select className={inputCls} value={form.stage} onChange={(e) => setField("stage", e.target.value)}>
                      <option value="">— выберите —</option>
                      <option value="0">0</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </Field>
                  <Field label="pT">
                    <select className={inputCls} value={form.pT} onChange={(e) => setField("pT", e.target.value)}>
                      <option value="">— выберите —</option>
                      <option value="Tis">Tis</option>
                      <option value="T1">T1</option>
                      <option value="T2">T2</option>
                      <option value="T3">T3</option>
                      <option value="T4">T4</option>
                    </select>
                  </Field>
                </FormGroup>

                <FormGroup icon={Share2} title="Лимфоузлы и NRAS">
                  <Field label="Изучено лимфоузлов">
                    <input className={inputCls} inputMode="numeric" value={form.nodesExamined} onChange={(e) => setField("nodesExamined", e.target.value)} />
                  </Field>
                  <Field label="Поражено лимфоузлов">
                    <input className={inputCls} inputMode="numeric" value={form.nodesAffected} onChange={(e) => setField("nodesAffected", e.target.value)} />
                  </Field>
                  <Field label="Статус NRAS">
                    <select className={inputCls} value={form.nras} onChange={(e) => setField("nras", e.target.value)}>
                      <option value="">— выберите —</option>
                      <option value="мутирован">мутирован</option>
                      <option value="не мутирован">не мутирован</option>
                    </select>
                  </Field>
                </FormGroup>

                <FormGroup icon={Scissors} title="Лечение">
                  <Field label="Название операции">
                    <select className={inputCls} value={form.operation} onChange={(e) => setField("operation", e.target.value)}>
                      {OPERATION_OPTIONS.map((o) => (
                        <option key={o} value={o === "— выберите —" ? "" : o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Хирургический доступ">
                    <select className={inputCls} value={form.surgicalAccess} onChange={(e) => setField("surgicalAccess", e.target.value)}>
                      {ACCESS_OPTIONS.map((o) => (
                        <option key={o} value={o === "— выберите —" ? "" : o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Место терапии">
                    <select className={inputCls} value={form.therapySite} onChange={(e) => setField("therapySite", e.target.value)}>
                      {SITE_OPTIONS.map((o) => (
                        <option key={o} value={o === "— выберите —" ? "" : o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                </FormGroup>

                <FormGroup icon={FlaskConical} title="Онкомаркеры">
                  <Field label={`РЭА до лечения, нг/мл (${CE_ANORM_HINT})`}>
                    <input className={inputCls} inputMode="decimal" value={form.cea} onChange={(e) => setField("cea", e.target.value)} />
                  </Field>
                </FormGroup>

                <FormGroup icon={TestTube} title="Лабораторные показатели" className="sm:col-span-2 xl:col-span-3">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Лимфоциты (абс.), ×10⁹/л">
                      <input className={inputCls} inputMode="decimal" value={form.lymphocytesAbs} onChange={(e) => setField("lymphocytesAbs", e.target.value)} />
                    </Field>
                    <Field label="Лейкоциты, ×10⁹/л">
                      <input className={inputCls} inputMode="decimal" value={form.leukocytes} onChange={(e) => setField("leukocytes", e.target.value)} />
                    </Field>
                    <Field label="Гемоглобин, г/л">
                      <input className={inputCls} inputMode="numeric" value={form.hemoglobin} onChange={(e) => setField("hemoglobin", e.target.value)} />
                    </Field>
                    <Field label="Тромбоциты, ×10⁹/л">
                      <input className={inputCls} inputMode="numeric" value={form.platelets} onChange={(e) => setField("platelets", e.target.value)} />
                    </Field>
                    <Field label="АСТ, Ед/л">
                      <input className={inputCls} inputMode="numeric" value={form.ast} onChange={(e) => setField("ast", e.target.value)} />
                    </Field>
                    <Field label="Билирубин общий, мкмоль/л">
                      <input className={inputCls} inputMode="decimal" value={form.bilirubin} onChange={(e) => setField("bilirubin", e.target.value)} />
                    </Field>
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
                  Загрузить
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <Eraser className="size-4" aria-hidden />
                  Очистить
                </button>
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-colors hover:bg-indigo-700 sm:flex-none min-w-[200px]"
                >
                  <CalculatorIcon className="size-4" aria-hidden />
                  Рассчитать прогноз
                </button>
              </div>
            </Card>
          </section>

          {/* Нижняя зона ~30% — результаты */}
          <section
            className={cn(
              "min-h-[32vh] flex-shrink-0 transition-opacity",
              hasResult ? "opacity-100" : "pointer-events-none opacity-40"
            )}
            aria-label="Результаты прогноза"
            aria-hidden={!hasResult}
          >
            <Card className="space-y-8 p-5 sm:p-7">
              {!hasResult && (
                <p className="text-center text-sm text-slate-500">
                  Нажмите «Рассчитать прогноз», чтобы увидеть риски, график когорты и факторы.
                </p>
              )}

              {hasResult && (
                <>
                  <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                    <TrajectoryIcon kind={traj.kind} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Траектория риска</p>
                      <p className="text-sm text-slate-600">{traj.label}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-800">Вероятность неблагоприятного исхода</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      {riskCards.map(({ h, pct }) => {
                        const cat = riskCategoryFromPct(pct);
                        const c = riskColors(cat.tone);
                        return (
                          <div
                            key={h}
                            className={cn("rounded-2xl border bg-white p-4 shadow-sm ring-1", c.ring)}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{h} год</p>
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

                  <div>
                    <h3 className="text-base font-bold text-slate-800">Сравнение с когортой</h3>
                    <p className="mt-1 text-xs text-slate-500">На основе анализа 500+ пациентов</p>
                    <div className="mt-4 h-64 w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={cohortBands} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                          <XAxis dataKey="x" tickFormatter={(v) => `${v} г`} type="number" domain={[0.6, 5.4]} ticks={[1, 3, 5]} />
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
                          <Line type="monotone" dataKey="patient" name="Текущий пациент" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <span className="inline-block size-2.5 rounded-full bg-blue-600" /> Пациент
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-slate-500" /> Медиана когорты
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="inline-block size-2.5 rounded bg-slate-400/40" /> Интерквартильный размах
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-800">Ключевые факторы риска</h3>
                    <div className="mt-3 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                      {([1, 3, 5] as const).map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setFactorHorizon(y)}
                          className={cn(
                            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                            factorHorizon === y ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                          )}
                        >
                          {y} год
                        </button>
                      ))}
                    </div>
                    <ul className="mt-4 space-y-3">
                      {FACTOR_PLACEHOLDERS[factorHorizon].map((row, idx) => (
                        <li key={`${factorHorizon}-${idx}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm">
                          <span className="w-6 tabular-nums text-slate-400">{idx + 1}.</span>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800">{row.name}</div>
                            <div className="mt-1 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-indigo-500/80" style={{ width: `${row.widthPct}%` }} />
                            </div>
                          </div>
                          <span className="font-mono tabular-nums font-semibold text-slate-700">{row.signed}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm text-slate-600">
                      Модифицируемые факторы: фактор 1, фактор 2
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-800">Клинические рекомендации</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                      <li>Сопоставить прогноз с клинической картиной и визуализацией; при высоком риске — обсудить усиление адъювантной стратегии в МДК.</li>
                      <li>Повторно оценить онкомаркеры и лабораторный профиль динамически после завершения активного лечения.</li>
                      <li>Интерпретация носит ориентировочный характер до финальной калибровки порогов по обучающей выборке (N=500+).</li>
                    </ul>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
