import { useState } from "react";
import { motion } from "motion/react";
import { Card } from "../components/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  riskDistributionData,
  earlyDetectionRiskDistributionData,
  earlyDetectionAgeData,
  patientsData,
  earlyDetectionPatientsData,
} from "../../data/mock";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ComposedChart,
  ReferenceLine,
  LabelList,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// ── Static aggregate data ───────────────────────────────────────────────────

// Overview age distribution (aggregate)
const ageData = [
  { range: "30-40", пациентов: 45 },
  { range: "41-50", пациентов: 85 },
  { range: "51-60", пациентов: 150 },
  { range: "61-70", пациентов: 210 },
  { range: "71-80", пациентов: 120 },
  { range: "81+", пациентов: 40 },
];

// ── Derived from patientsData (6 records) ──────────────────────────────────

const stageData = ["I", "II", "III", "IV"].map((s) => ({
  stage: `Стадия ${s}`,
  пациентов: patientsData.filter((p) => p.stage === s).length,
}));

const genderDataPrognosis = [
  { name: "Мужской", value: patientsData.filter((p) => p.gender === "Мужской").length, fill: "#6366f1" },
  { name: "Женский", value: patientsData.filter((p) => p.gender === "Женский").length, fill: "#ec4899" },
];

const STATUS_META: { name: string; fill: string; icon: string }[] = [
  { name: "Ремиссия", fill: "#10b981", icon: "✓" },
  { name: "Лечение", fill: "#6366f1", icon: "⊕" },
  { name: "Наблюдение", fill: "#f59e0b", icon: "◉" },
  { name: "Паллиатив", fill: "#ef4444", icon: "◌" },
];
const statusCounts = STATUS_META.map((s) => ({
  ...s,
  count: patientsData.filter((p) => p.status === s.name).length,
}));

// Age groups + avg riskScore — computed from 6 real patients
const ageRiskData = [
  { group: "30–40", средний_риск: 8, fill: "#10b981" },
  { group: "41–50", средний_риск: 12, fill: "#10b981" },
  { group: "51–60", средний_риск: Math.round((89 + 24) / 2), fill: "#ef4444" },
  { group: "61–70", средний_риск: 68, fill: "#ef4444" },
  { group: "71–80", средний_риск: 45, fill: "#f59e0b" },
];

// ── Derived from earlyDetectionPatientsData (9 records) ────────────────────

const genderDataEarly = [
  { name: "Мужской", value: earlyDetectionPatientsData.filter((p) => p.gender === "Мужской").length, fill: "#6366f1" },
  { name: "Женский", value: earlyDetectionPatientsData.filter((p) => p.gender === "Женский").length, fill: "#ec4899" },
];

// Horizontal stacked bar: gender × riskLevel
const genderRiskData = ["Мужской", "Женский"].map((gender) => {
  const pts = earlyDetectionPatientsData.filter((p) => p.gender === gender);
  return {
    gender,
    Низкий: pts.filter((p) => p.riskLevel === "Низкий").length,
    Средний: pts.filter((p) => p.riskLevel === "Средний").length,
    Высокий: pts.filter((p) => p.riskLevel === "Высокий").length,
  };
});

// Age × riskLevel grouped bar
const ageGroups = [
  { label: "40–50", min: 40, max: 50 },
  { label: "51–60", min: 51, max: 60 },
  { label: "61–70", min: 61, max: 70 },
  { label: "71–80", min: 71, max: 80 },
];
const ageRiskEarlyData = ageGroups.map(({ label, min, max }) => {
  const pts = earlyDetectionPatientsData.filter((p) => p.age >= min && p.age <= max);
  return {
    group: label,
    Низкий: pts.filter((p) => p.riskLevel === "Низкий").length,
    Средний: pts.filter((p) => p.riskLevel === "Средний").length,
    Высокий: pts.filter((p) => p.riskLevel === "Высокий").length,
  };
});

// ── Completeness tab ────────────────────────────────────────────────────────

const completenessPerPatient = [...earlyDetectionPatientsData]
  .sort((a, b) => a.completionPercent - b.completionPercent)
  .map((p) => ({
    id: p.id,
    полнота: p.completionPercent,
    fill: p.completionPercent >= 90 ? "#10b981" : p.completionPercent >= 80 ? "#f59e0b" : "#ef4444",
  }));

// 100 % normalised completeness-groups × riskLevel
const completenessGroupData = [
  { group: "< 80%", Низкий: 0, Средний: 50, Высокий: 50 },
  { group: "80–89%", Низкий: 33, Средний: 67, Высокий: 0 },
  { group: "≥ 90%", Низкий: 50, Средний: 0, Высокий: 50 },
];

// ── Helpers ────────────────────────────────────────────────────────────────

type RegistryState = { open: boolean; riskLevel: string | null; source: "prognosis" | "early" };
const RISK_COLORS = { Низкий: "#10b981", Средний: "#f59e0b", Высокий: "#ef4444" };
const tooltipStyle = { borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-slate-700 border-l-4 border-indigo-400 pl-3">
      {children}
    </h2>
  );
}

// ── Overview RiskDashboard ─────────────────────────────────────────────────

function RiskDashboard({
  title, pieData, barData, barColor, onPieClick,
}: {
  title: string;
  pieData: typeof riskDistributionData;
  barData: typeof ageData;
  barColor: string;
  onPieClick: (level: string) => void;
}) {
  return (
    <div className="space-y-3">
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-lg text-slate-800 mb-1">Распределение по группам риска</h3>
          <p className="text-xs text-slate-500 mb-4">Нажмите на сегмент, чтобы открыть реестр</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData} cx="50%" cy="50%"
                  innerRadius={65} outerRadius={105}
                  paddingAngle={5} dataKey="value"
                  stroke="none" style={{ cursor: "pointer" }}
                  onClick={(entry) => onPieClick(entry.name as string)}
                >
                  {pieData.map((e, i) => <Cell key={i} fill={e.fill} className="hover:opacity-80 transition-opacity" />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Доля"]} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            {pieData.map((item, i) => (
              <button key={i} type="button" onClick={() => onPieClick(item.name)}
                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-xs text-slate-600 font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-lg text-slate-800 mb-6">Демографическое распределение</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={tooltipStyle} />
                <Bar dataKey="пациентов" fill={barColor} radius={[6, 6, 0, 0]} barSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export function Analytics() {
  const [registry, setRegistry] = useState<RegistryState>({ open: false, riskLevel: null, source: "prognosis" });

  const riskKey = registry.riskLevel?.split(" ")[0] ?? "";
  const registryPatients =
    registry.source === "prognosis"
      ? patientsData.filter((p) => p.riskLevel.startsWith(riskKey))
      : earlyDetectionPatientsData.filter((p) => p.riskLevel.startsWith(riskKey));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
          Аналитика и статистика
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Сводные данные по когорте пациентов клиники</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/60 border border-slate-200 shadow-sm h-10 px-1 gap-1">
          <TabsTrigger value="overview" className="text-sm px-4">Обзор</TabsTrigger>
          <TabsTrigger value="demographics" className="text-sm px-4">Демография</TabsTrigger>
          <TabsTrigger value="completeness" className="text-sm px-4">Полнота данных</TabsTrigger>
        </TabsList>

        {/* ══ Обзор ══════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-8">
          <RiskDashboard title="Прогноз рецидива и летальности" pieData={riskDistributionData} barData={ageData} barColor="#6366f1"
            onPieClick={(l) => setRegistry({ open: true, riskLevel: l, source: "prognosis" })} />
          <RiskDashboard title="Раннее выявление" pieData={earlyDetectionRiskDistributionData} barData={earlyDetectionAgeData} barColor="#0d9488"
            onPieClick={(l) => setRegistry({ open: true, riskLevel: l, source: "early" })} />

          {/* Banner */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Генерация отчета за месяц</h3>
                <p className="text-indigo-100 max-w-xl">Полный отчет по динамике рисков, количеству проведенных анализов ИИ и статистике выживаемости.</p>
              </div>
              <button className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition-colors whitespace-nowrap">
                Скачать PDF
              </button>
            </div>
          </Card>
        </TabsContent>

        {/* ══ Демография ════════════════════════════════════════════════════ */}
        <TabsContent value="demographics" className="space-y-10">

          {/* ── Прогноз рецидива ── */}
          <div className="space-y-4">
            <SectionTitle>Прогноз рецидива и летальности · Демографические срезы</SectionTitle>
  

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 1. Stage — вертикальный BarChart с перезаливкой по стадии */}
              <Card>
                <h3 className="font-bold text-slate-800 mb-1">Распределение по стадиям</h3>
                <p className="text-xs text-slate-500 mb-4">Какая стадия диагноза преобладает?</p>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stageData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={8} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="пациентов" radius={[6, 6, 0, 0]} barSize={48}>
                        {stageData.map((_, i) => (
                          <Cell key={i} fill={["#a5b4fc", "#6366f1", "#4338ca", "#1e1b4b"][i]} />
                        ))}
                        <LabelList dataKey="пациентов" position="top" style={{ fill: "#64748b", fontSize: 13, fontWeight: 700 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 2. Gender — Donut pie */}
              <Card>
                <h3 className="font-bold text-slate-800 mb-1">Гендерный состав</h3>
                <p className="text-xs text-slate-500 mb-4">Соотношение мужчин и женщин</p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={genderDataPrognosis} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value" stroke="none">
                        {genderDataPrognosis.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} чел.`, ""]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {genderDataPrognosis.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                      <span className="text-sm text-slate-400">{item.value} чел.</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 3. Status — stat cards (HTML, без recharts) */}
              <Card>
                <h3 className="font-bold text-slate-800 mb-1">Статус наблюдения</h3>
                <p className="text-xs text-slate-500 mb-5">Распределение по этапу лечения</p>
                <div className="space-y-3">
                  {statusCounts.map((s) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold" style={{ backgroundColor: s.fill }}>
                        {s.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex justify-between text-sm font-semibold text-slate-700">
                          <span>{s.name}</span>
                          <span>{s.count} чел.</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-full rounded-full transition-all" style={{ width: `${(s.count / 6) * 100}%`, backgroundColor: s.fill }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 4. Age × avg risk — ComposedChart с цветными барами + порог */}
              <Card>
                <h3 className="font-bold text-slate-800 mb-1">Средний риск по возрастным группам</h3>
                <p className="text-xs text-slate-500 mb-4">Цвет: зелёный &lt;25%, жёлтый 25–50%, красный &gt;50%</p>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={ageRiskData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={8} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Средний риск"]} />
                      <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: "Порог 50%", fill: "#ef4444", fontSize: 11, position: "right" }} />
                      <Bar dataKey="средний_риск" radius={[6, 6, 0, 0]} barSize={44}>
                        {ageRiskData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        <LabelList dataKey="средний_риск" position="top" formatter={(v: number) => `${v}%`} style={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} />
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          {/* ── Раннее выявление ── */}
          <div className="space-y-4">
            <SectionTitle>Раннее выявление · Демографические срезы</SectionTitle>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 5. Gender ED — Donut */}
              <Card>
                <h3 className="font-bold text-slate-800 mb-1">Гендерный состав</h3>
                <p className="text-xs text-slate-500 mb-4">Соотношение в скрининговой когорте</p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={genderDataEarly} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value" stroke="none">
                        {genderDataEarly.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} чел.`, ""]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {genderDataEarly.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                      <span className="text-sm text-slate-400">{item.value} чел.</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 6. Gender × risk — горизонтальный стек */}
              <Card>
                <h3 className="font-bold text-slate-800 mb-1">Пол × Уровень риска</h3>
                <p className="text-xs text-slate-500 mb-4">Гендерные различия в распределении онкориска</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genderRiskData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis type="category" dataKey="gender" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 13 }} width={70} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Низкий" stackId="a" fill={RISK_COLORS["Низкий"]} />
                      <Bar dataKey="Средний" stackId="a" fill={RISK_COLORS["Средний"]} />
                      <Bar dataKey="Высокий" stackId="a" fill={RISK_COLORS["Высокий"]} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 7. Age × risk — grouped vertical bar */}
              <Card className="lg:col-span-2">
                <h3 className="font-bold text-slate-800 mb-1">Возрастная группа × Уровень риска</h3>
                <p className="text-xs text-slate-500 mb-4">Распределение групп онкориска внутри каждого возрастного диапазона</p>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageRiskEarlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 13 }} dy={8} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Низкий" fill={RISK_COLORS["Низкий"]} radius={[4, 4, 0, 0]} barSize={22} />
                      <Bar dataKey="Средний" fill={RISK_COLORS["Средний"]} radius={[4, 4, 0, 0]} barSize={22} />
                      <Bar dataKey="Высокий" fill={RISK_COLORS["Высокий"]} radius={[4, 4, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══ Полнота данных ════════════════════════════════════════════════ */}
        <TabsContent value="completeness" className="space-y-6">
          <div className="space-y-4">
            <SectionTitle>Раннее выявление · Достаточность данных</SectionTitle>
            <p className="text-xs text-slate-400">Анализ полноты заполнения форм — 9 пациентов скрининговой когорты</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 8. Per-patient completeness — горизонтальный бар с цветом */}
              <Card>
                <h3 className="font-bold text-slate-800 mb-1">Полнота данных по пациентам</h3>
                <p className="text-xs text-slate-500 mb-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />≥90% &nbsp;
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />80–89% &nbsp;
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />&lt;80%
                </p>
                <div className="h-[310px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completenessPerPatient} layout="vertical" margin={{ top: 0, right: 40, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis type="category" dataKey="id" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} width={58} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Полнота"]} />
                      <Bar dataKey="полнота" radius={[0, 6, 6, 0]} barSize={18}>
                        {completenessPerPatient.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        <LabelList dataKey="полнота" position="right" formatter={(v: number) => `${v}%`} style={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* 9. Completeness groups × risk — нормированный 100% стек */}
              <Card>
                <h3 className="font-bold text-slate-800 mb-1">Группы полноты → Уровень риска</h3>
                <p className="text-xs text-slate-500 mb-4">Структура риска внутри каждой группы полноты (100%)</p>
                <div className="h-[310px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completenessGroupData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={8} />
                      <YAxis tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, ""]} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Низкий" stackId="a" fill={RISK_COLORS["Низкий"]}>
                        <LabelList dataKey="Низкий" position="inside" formatter={(v: number) => v > 0 ? `${v}%` : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 700 }} />
                      </Bar>
                      <Bar dataKey="Средний" stackId="a" fill={RISK_COLORS["Средний"]}>
                        <LabelList dataKey="Средний" position="inside" formatter={(v: number) => v > 0 ? `${v}%` : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 700 }} />
                      </Bar>
                      <Bar dataKey="Высокий" stackId="a" fill={RISK_COLORS["Высокий"]} radius={[6, 6, 0, 0]}>
                        <LabelList dataKey="Высокий" position="inside" formatter={(v: number) => v > 0 ? `${v}%` : ""} style={{ fill: "#fff", fontSize: 11, fontWeight: 700 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Missing cuts notice */}
            {/*  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold mb-2">Срезы из cuts.docx, которые не реализованы — в mock-реестре нет нужных полей:</p>
              <ul className="space-y-1 list-disc list-inside text-amber-800">
                <li><b>Клинико-лабораторные</b> (глюкоза, HGB, частота дыхания, визиты к терапевту) — нет полей в earlyDetectionPatientsData</li>
                <li><b>Поведенческие</b> (курение, контроль гипертонии/диабета, тревожность) — нет в earlyDetectionPatientsData</li>
                <li><b>Динамика риска 1→3 года на пациента</b> — нет risk1y/risk2y/risk3y на запись</li>
                <li><b>Сравнительные</b> (точность модели, ложно+/−) — нет поля actualOutcome</li>
                <li><b>Регион / тип учреждения</b> — нет поля region/institutionType</li>
              </ul>
            </div> */}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Registry Dialog ── */}
      <Dialog open={registry.open} onOpenChange={(open) => setRegistry((s) => ({ ...s, open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Пациенты — {registry.source === "prognosis" ? "Прогноз рецидива и летальности" : "Раннее выявление"}
              {registry.riskLevel ? ` · ${registry.riskLevel}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            {registryPatients.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Пациенты не найдены.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Возраст</th>
                    <th className="pb-3 pr-4">Пол</th>
                    <th className="pb-3 pr-4">Уровень риска</th>
                    <th className="pb-3">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registryPatients.map((p) => {
                    const isEarly = registry.source === "early";
                    const date = isEarly
                      ? (p as (typeof earlyDetectionPatientsData)[0]).lastCalculated
                      : (p as (typeof patientsData)[0]).lastVisit;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4 font-semibold text-slate-800">{p.id}</td>
                        <td className="py-3 pr-4 text-slate-600">{p.age}</td>
                        <td className="py-3 pr-4 text-slate-600">{p.gender}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            p.riskLevel === "Высокий" ? "bg-red-100 text-red-700"
                            : p.riskLevel === "Средний" ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {p.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
