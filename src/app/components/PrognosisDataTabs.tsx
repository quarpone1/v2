import { useEffect, useMemo, useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import type { PatientRecord } from "../../data/mock";
import { cn } from "../../lib/utils";

function FieldHint({ text }: { text: string }) {
  return (
    <span className="inline-flex align-middle text-slate-400" title={text}>
      <HelpCircle className="size-4" aria-hidden />
      <span className="sr-only">{text}</span>
    </span>
  );
}

function Req() {
  return <span className="text-red-500 font-semibold">*</span>;
}

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all";
const selectClass = inputClass + " appearance-none cursor-pointer";
const labelClass = "text-sm font-semibold text-slate-700 flex items-center gap-1.5";

const TNM_OPTIONS = ["0", "1", "2", "3", "4", "X"] as const;

export type PrognosisFormSnapshot = {
  age: number;
  gender: string;
  disability: string;
  stageTnm: string;
  pN: string;
  pM: string;
  pT: string;
  cea: number;
  ca199: number;
  lymphocytesPct: number;
  neutrophilsPct: number;
  leukocytes: number;
  hemoglobin: number;
  mcv: number;
  mch: number;
  rdwCv: number;
  rdwSd: number;
  platelets: number;
  mpv: number;
  pdw: number;
  albumin: number;
  creatinine: number;
  glucose: number;
  urea: number;
  ast: number;
  alt: number;
  bilirubinTotal: number;
  bilirubinDirect: number;
  totalProtein: number;
  fibrinogen: number;
  inr: number;
  heightCm: number;
  weightKg: number;
  heartRate: number;
  chemoCourses: number;
  neoadjuvant: boolean;
  adjuvant: boolean;
  radiation: boolean;
  bloodTransfusion: boolean;
  hospitalDays: number;
};

const DEFAULT_FORM: PrognosisFormSnapshot = {
  age: 65,
  gender: "М",
  disability: "Нет",
  stageTnm: "I",
  pN: "2",
  pM: "0",
  pT: "2",
  cea: 15.5,
  ca199: 45.2,
  lymphocytesPct: 18.5,
  neutrophilsPct: 72.3,
  leukocytes: 7.0,
  hemoglobin: 115,
  mcv: 90.0,
  mch: 30.0,
  rdwCv: 13.5,
  rdwSd: 45.0,
  platelets: 250,
  mpv: 10.0,
  pdw: 16.0,
  albumin: 40.0,
  creatinine: 80,
  glucose: 5.5,
  urea: 6.0,
  ast: 25,
  alt: 25,
  bilirubinTotal: 10.0,
  bilirubinDirect: 2.0,
  totalProtein: 70.0,
  fibrinogen: 3.5,
  inr: 1.0,
  heightCm: 170,
  weightKg: 70,
  heartRate: 75,
  chemoCourses: 1,
  neoadjuvant: false,
  adjuvant: false,
  radiation: false,
  bloodTransfusion: false,
  hospitalDays: 10,
};

function bmiLabel(heightCm: number, weightKg: number): { value: string; category: string } {
  if (heightCm <= 0 || weightKg <= 0) {
    return { value: "—", category: "" };
  }
  const m = heightCm / 100;
  const bmi = weightKg / (m * m);
  const rounded = Math.round(bmi * 10) / 10;
  let category = "";
  if (bmi < 18.5) category = "недостаточная масса";
  else if (bmi < 25) category = "норма";
  else if (bmi < 30) category = "избыточная масса";
  else category = "ожирение";
  return { value: `${rounded} кг/м²`, category: `(${category})` };
}

type Props = {
  /** После «Загрузить данные» — подставить возраст, пол, стадию из карточки */
  loadedPatient: PatientRecord | null;
};

export function PrognosisDataTabs({ loadedPatient }: Props) {
  const [form, setForm] = useState<PrognosisFormSnapshot>(DEFAULT_FORM);

  useEffect(() => {
    if (!loadedPatient) return;
    setForm((prev) => ({
      ...prev,
      age: loadedPatient.age,
      gender: loadedPatient.gender === "Мужской" ? "М" : "Ж",
      stageTnm: loadedPatient.stage,
    }));
  }, [loadedPatient]);

  const patch = <K extends keyof PrognosisFormSnapshot>(key: K, value: PrognosisFormSnapshot[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const bmi = useMemo(() => bmiLabel(form.heightCm, form.weightKg), [form.heightCm, form.weightKg]);

  const section = (title: string, children: ReactNode) => (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <Tabs defaultValue="demo" className="w-full gap-4">
      <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1.5 sm:p-2">
        <TabsTrigger
          value="demo"
          className="rounded-xl px-3 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:text-sm"
        >
          Демография и стадия
        </TabsTrigger>
        <TabsTrigger
          value="markers"
          className="rounded-xl px-3 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:text-sm"
        >
          Онкомаркеры и ОАК
        </TabsTrigger>
        <TabsTrigger
          value="bioch"
          className="rounded-xl px-3 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:text-sm"
        >
          Биохимия крови
        </TabsTrigger>
        <TabsTrigger
          value="extra"
          className="rounded-xl px-3 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:text-sm"
        >
          Дополнительные показатели
        </TabsTrigger>
        <TabsTrigger
          value="treat"
          className="rounded-xl px-3 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm sm:text-sm"
        >
          Лечение и госпитализация
        </TabsTrigger>
      </TabsList>

      <TabsContent value="demo" className="mt-4 space-y-8">
        {section("Демографические данные", (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className={labelClass}>
                Возраст (лет) <Req />
              </label>
              <input
                type="number"
                min={0}
                max={120}
                step={1}
                value={form.age}
                onChange={(e) => patch("age", Number(e.target.value))}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>
                Пол <Req />
              </label>
              <select value={form.gender} onChange={(e) => patch("gender", e.target.value)} className={selectClass} required>
                <option value="М">М</option>
                <option value="Ж">Ж</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Инвалидность</label>
              <select value={form.disability} onChange={(e) => patch("disability", e.target.value)} className={selectClass}>
                <option value="Нет">Нет</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
              </select>
            </div>
          </div>
        ))}

        {section("Клиническая стадия", (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className={labelClass}>
                Стадия (TNM) <Req />
                <FieldHint text="Клиническая классификация по TNM (обязательное поле для расчёта)." />
              </label>
              <select
                value={form.stageTnm}
                onChange={(e) => patch("stageTnm", e.target.value)}
                className={selectClass}
                required
              >
                {["I", "II", "III", "IV"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>
                pN (лимфоузлы)
                <FieldHint text="Категория регионарных лимфоузлов (pathological N)." />
              </label>
              <select value={form.pN} onChange={(e) => patch("pN", e.target.value)} className={selectClass}>
                {TNM_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>
                pM (метастазы)
                <FieldHint text="Наличие отдалённых метастазов (pathological M)." />
              </label>
              <select value={form.pM} onChange={(e) => patch("pM", e.target.value)} className={selectClass}>
                {TNM_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>
                pT (опухоль)
                <FieldHint text="Размер и распространённость первичной опухоли (pathological T)." />
              </label>
              <select value={form.pT} onChange={(e) => patch("pT", e.target.value)} className={selectClass}>
                {TNM_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="markers" className="mt-4 space-y-8">
        {section("Онкомаркеры", (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClass}>
                РЭА (нг/мл) <Req />
                <FieldHint text="Раково-эмбриональный антиген." />
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.cea}
                onChange={(e) => patch("cea", Number(e.target.value))}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>
                CA 19.9 (Ед/мл) <Req />
                <FieldHint text="Углеводный антиген 19-9." />
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.ca199}
                onChange={(e) => patch("ca199", Number(e.target.value))}
                className={inputClass}
                required
              />
            </div>
          </div>
        ))}

        {section("Общий анализ крови", (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Лейкоцитарная формула</p>
              <div className="space-y-2">
                <label className={labelClass}>
                  Лимфоциты % <Req />
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={form.lymphocytesPct}
                  onChange={(e) => patch("lymphocytesPct", Number(e.target.value))}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>
                  Нейтрофилы % <Req />
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={form.neutrophilsPct}
                  onChange={(e) => patch("neutrophilsPct", Number(e.target.value))}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>
                  Лейкоциты (×10⁹/л) <Req />
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.leukocytes}
                  onChange={(e) => patch("leukocytes", Number(e.target.value))}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Эритроциты</p>
              <div className="space-y-2">
                <label className={labelClass}>
                  Гемоглобин (г/л) <Req />
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.hemoglobin}
                  onChange={(e) => patch("hemoglobin", Number(e.target.value))}
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>MCV (фл)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.mcv}
                  onChange={(e) => patch("mcv", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>MCH (пг)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.mch}
                  onChange={(e) => patch("mch", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Эритроцитарные индексы</p>
              <div className="space-y-2">
                <label className={labelClass}>RDW-CV (%)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.rdwCv}
                  onChange={(e) => patch("rdwCv", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>RDW-SD (фл)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.rdwSd}
                  onChange={(e) => patch("rdwSd", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Тромбоциты</p>
              <div className="space-y-2">
                <label className={labelClass}>Тромбоциты (×10⁹/л)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.platelets}
                  onChange={(e) => patch("platelets", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>MPV (фл)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.mpv}
                  onChange={(e) => patch("mpv", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>PDW (фл)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.pdw}
                  onChange={(e) => patch("pdw", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="bioch" className="mt-4">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            Биохимический анализ крови
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Основные показатели</p>
            <div className="space-y-2">
              <label className={labelClass}>
                Альбумин (г/л) <Req />
                <FieldHint text="Сывороточный альбумин." />
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.albumin}
                onChange={(e) => patch("albumin", Number(e.target.value))}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Креатинин (мкмоль/л)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.creatinine}
                onChange={(e) => patch("creatinine", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Глюкоза (ммоль/л)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.glucose}
                onChange={(e) => patch("glucose", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Мочевина (ммоль/л)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.urea}
                onChange={(e) => patch("urea", Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Печеночные ферменты</p>
            <div className="space-y-2">
              <label className={labelClass}>
                АСТ (Ед/л)
                <FieldHint text="Аспартатаминотрансфераза." />
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.ast}
                onChange={(e) => patch("ast", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>
                АЛТ (Ед/л)
                <FieldHint text="Аланинаминотрансфераза." />
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.alt}
                onChange={(e) => patch("alt", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 pt-2">Билирубин</p>
            <div className="space-y-2">
              <label className={labelClass}>Билирубин общий (мкмоль/л)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.bilirubinTotal}
                onChange={(e) => patch("bilirubinTotal", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Билирубин прямой (мкмоль/л)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.bilirubinDirect}
                onChange={(e) => patch("bilirubinDirect", Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Белки и коагулограмма</p>
            <div className="space-y-2">
              <label className={labelClass}>Белок общий (г/л)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.totalProtein}
                onChange={(e) => patch("totalProtein", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Фибриноген (г/л)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.fibrinogen}
                onChange={(e) => patch("fibrinogen", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>
                МНО (INR)
                <FieldHint text="Международное нормализованное отношение (протромбиновый индекс)." />
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.inr}
                onChange={(e) => patch("inr", Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="extra" className="mt-4 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            Антропометрия и витальные признаки
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className={labelClass}>Рост (см)</label>
              <input
                type="number"
                min={50}
                max={250}
                step={1}
                value={form.heightCm}
                onChange={(e) => patch("heightCm", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Вес (кг)</label>
              <input
                type="number"
                min={20}
                max={300}
                step={0.1}
                value={form.weightKg}
                onChange={(e) => patch("weightKg", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>ЧСС (уд/мин)</label>
              <input
                type="number"
                min={30}
                max={220}
                step={1}
                value={form.heartRate}
                onChange={(e) => patch("heartRate", Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-slate-700">
          <p className="font-bold text-sky-900">Индекс массы тела (ИМТ)</p>
          <p className="mt-1">
            <span className="font-semibold tabular-nums">{bmi.value}</span>{" "}
            <span className="text-slate-600">{bmi.category}</span>
          </p>
        </div>
      </TabsContent>

      <TabsContent value="treat" className="mt-4 space-y-8">
        {section("Лечение", (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className={labelClass}>Количество курсов химиотерапии</label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  step={1}
                  value={form.chemoCourses}
                  onChange={(e) => patch("chemoCourses", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-3 pt-1">
                <label className={cn(labelClass, "cursor-pointer items-start gap-2")}>
                  <input
                    type="checkbox"
                    checked={form.neoadjuvant}
                    onChange={(e) => patch("neoadjuvant", e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-indigo-600"
                  />
                  <span className="flex items-center gap-1.5 font-medium">
                    Неоадъювантная химиотерапия
                    <FieldHint text="Лечение до основной локальной терапии (операции)." />
                  </span>
                </label>
                <label className={cn(labelClass, "cursor-pointer items-start gap-2")}>
                  <input
                    type="checkbox"
                    checked={form.adjuvant}
                    onChange={(e) => patch("adjuvant", e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-indigo-600"
                  />
                  <span className="flex items-center gap-1.5 font-medium">
                    Адъювантная химиотерапия
                    <FieldHint text="Лечение после радикального вмешательства." />
                  </span>
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-1 lg:pt-8">
              <label className={cn(labelClass, "cursor-pointer items-center gap-2")}>
                <input
                  type="checkbox"
                  checked={form.radiation}
                  onChange={(e) => patch("radiation", e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                Лучевая терапия
              </label>
              <label className={cn(labelClass, "cursor-pointer items-center gap-2")}>
                <input
                  type="checkbox"
                  checked={form.bloodTransfusion}
                  onChange={(e) => patch("bloodTransfusion", e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                Переливание крови
              </label>
            </div>
          </div>
        ))}

        {section("Госпитализация", (
          <div className="max-w-md space-y-2">
            <label className={labelClass}>Длительность госпитализации (дней)</label>
            <input
              type="number"
              min={0}
              max={365}
              step={1}
              value={form.hospitalDays}
              onChange={(e) => patch("hospitalDays", Number(e.target.value))}
              className={inputClass}
            />
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}
