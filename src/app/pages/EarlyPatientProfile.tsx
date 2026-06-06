import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Activity, UserRound, Calendar, BarChart3, FlaskConical, HeartPulse, Stethoscope } from "lucide-react";
import { earlyDetectionPatientsFull } from "../../data/mock";
import { Card } from "../components/Card";
import { cn } from "../../lib/utils";

const RISK_COLOR = {
  Высокий: { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500" },
  Средний:  { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500" },
  Низкий:   { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500" },
};

function RiskBadge({ level }: { level: "Низкий" | "Средний" | "Высокий" }) {
  const c = RISK_COLOR[level];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border", c.bg, c.text, c.border)}>
      {level}
    </span>
  );
}

function DiagnosisBadge({ diag }: { diag: "C34" | "C18-C20" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-sm font-bold",
      diag === "C34" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
    )}>
      {diag === "C34" ? "C34 · Рак лёгкого" : "C18-C20 · Колоректальный рак"}
    </span>
  );
}

function RiskYearCard({ year, value }: { year: 1 | 2 | 3; value: number }) {
  const level: "Низкий" | "Средний" | "Высокий" = value > 40 ? "Высокий" : value >= 20 ? "Средний" : "Низкий";
  const c = RISK_COLOR[level];
  return (
    <div className={cn("rounded-2xl border p-4 text-center", c.bg, c.border)}>
      <div className="text-xs font-semibold text-slate-500 mb-1">{year} год</div>
      <div className={cn("text-3xl font-bold", c.text)}>{value}%</div>
      <div className="mt-2">
        <RiskBadge level={level} />
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/60 overflow-hidden">
        <div className={cn("h-full rounded-full", c.bar)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function SnapshotRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={cn("text-xs font-semibold", highlight ? "text-amber-700" : "text-slate-800")}>{value || "—"}</span>
    </div>
  );
}

export function EarlyPatientProfile() {
  const { id } = useParams<{ id: string }>();
  const patient = earlyDetectionPatientsFull.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <UserRound className="size-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-600">Пациент не найден</h2>
        <p className="text-slate-400 text-sm">ID: {id}</p>
        <Link to="/patients" className="mt-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
          ← Исторические данные
        </Link>
      </div>
    );
  }

  const s = patient.snapshot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/patients"
            className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={14} />
            Исторические данные
          </Link>
        </div>
        <Link
          to="/early-detection"
          className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 transition"
        >
          Рассчитать прогноз
        </Link>
      </div>

      {/* Patient header card */}
      <Card className="rounded-3xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <UserRound size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-lg font-bold text-slate-900">{patient.id}</span>
              <DiagnosisBadge diag={patient.eventualDiagnosis} />
              <RiskBadge level={patient.riskLevel} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <UserRound size={13} />
                {patient.age} лет · {patient.gender}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                Расчёт: {patient.lastCalculated}
              </span>
              <span className="flex items-center gap-1">
                <Activity size={13} />
                Заполненность: {patient.completionPercent}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk scores */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          <BarChart3 className="inline mr-1.5 size-4" aria-hidden />
          Прогноз риска (1 / 2 / 3 года)
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <RiskYearCard year={1} value={patient.risks[1]} />
          <RiskYearCard year={2} value={patient.risks[2]} />
          <RiskYearCard year={3} value={patient.risks[3]} />
        </div>
      </div>

      {/* Per-diagnosis risk */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-3xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">C34</span>
            <h3 className="text-sm font-bold text-slate-800">Рак лёгкого</h3>
          </div>
          <RiskBadge level={patient.riskLevelC34} />
          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full", RISK_COLOR[patient.riskLevelC34].bar)}
              style={{ width: patient.riskLevelC34 === "Высокий" ? "80%" : patient.riskLevelC34 === "Средний" ? "50%" : "20%" }}
            />
          </div>
        </Card>
        <Card className="rounded-3xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">C18-C20</span>
            <h3 className="text-sm font-bold text-slate-800">Колоректальный рак</h3>
          </div>
          <RiskBadge level={patient.riskLevelC18C20} />
          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full", RISK_COLOR[patient.riskLevelC18C20].bar)}
              style={{ width: patient.riskLevelC18C20 === "Высокий" ? "80%" : patient.riskLevelC18C20 === "Средний" ? "50%" : "20%" }}
            />
          </div>
        </Card>
      </div>

      {/* Snapshot data */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-3xl">
          <div className="mb-3 flex items-center gap-2 text-slate-600">
            <UserRound size={15} aria-hidden />
            <h3 className="text-xs font-bold uppercase tracking-wide">Образ жизни</h3>
          </div>
          <SnapshotRow label="Курение" value={s.smoking} highlight={s.smoking === "да"} />
          <SnapshotRow label="Гипертония" value={s.hypertension} highlight={s.hypertension === "да"} />
          <SnapshotRow label="Диабет" value={s.diabetes} highlight={s.diabetes === "да"} />
          <SnapshotRow label="Препараты от давления" value={s.antihypertensiveMeds} />
          <SnapshotRow label="Колоноскопия (5 лет)" value={s.colonoscopy} highlight={s.colonoscopy === "нет"} />
        </Card>

        <Card className="rounded-3xl">
          <div className="mb-3 flex items-center gap-2 text-slate-600">
            <HeartPulse size={15} aria-hidden />
            <h3 className="text-xs font-bold uppercase tracking-wide">Витальные показатели</h3>
          </div>
          <SnapshotRow label="АД систолическое" value={s.systolicBp ? `${s.systolicBp} мм рт. ст.` : ""} highlight={Number(s.systolicBp) >= 140} />
          <SnapshotRow label="АД диастолическое" value={s.diastolicBp ? `${s.diastolicBp} мм рт. ст.` : ""} />
          <SnapshotRow label="Пульс" value={s.pulse ? `${s.pulse} уд/мин` : ""} />
          <SnapshotRow label="Частота дыхания" value={s.respirationRate ? `${s.respirationRate} /мин` : ""} highlight={Number(s.respirationRate) > 20} />
        </Card>

        <Card className="rounded-3xl">
          <div className="mb-3 flex items-center gap-2 text-slate-600">
            <FlaskConical size={15} aria-hidden />
            <h3 className="text-xs font-bold uppercase tracking-wide">Лабораторные данные</h3>
          </div>
          <SnapshotRow label="Глюкоза" value={s.glucose ? `${s.glucose} ммоль/л` : ""} highlight={Number(s.glucose) > 6.1} />
          <SnapshotRow label="Лейкоциты (WBC)" value={s.wbc ? `${s.wbc} ×10⁹/л` : ""} highlight={Number(s.wbc) > 8} />
          <SnapshotRow label="Гемоглобин" value={s.hgb ? `${s.hgb} г/л` : ""} highlight={Number(s.hgb) < 120 && Number(s.hgb) > 0} />
        </Card>

        <Card className="rounded-3xl">
          <div className="mb-3 flex items-center gap-2 text-slate-600">
            <Stethoscope size={15} aria-hidden />
            <h3 className="text-xs font-bold uppercase tracking-wide">Визиты и скрининг</h3>
          </div>
          <SnapshotRow label="Визиты к терапевту" value={s.therapistVisits ? `${s.therapistVisits} посещений` : ""} highlight={Number(s.therapistVisits) >= 10} />
          <SnapshotRow label="Визиты к эндокринологу" value={s.endocrinologistVisits ? `${s.endocrinologistVisits} посещений` : ""} />
          <SnapshotRow label="Визиты к неврологу" value={s.neurologistVisits ? `${s.neurologistVisits} посещений` : ""} />
          <SnapshotRow label="Визиты к хирургу" value={s.surgeonVisits ? `${s.surgeonVisits} посещений` : ""} />
          <SnapshotRow label="Флюорография (3 года)" value={s.fluorographyCount ? `${s.fluorographyCount} раз` : "0 раз"} highlight={Number(s.fluorographyCount) === 0} />
        </Card>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Данные получены ретроспективно: на момент расчёта пациент не имел онкологических эпизодов в анамнезе.
        Окончательный диагноз (<strong>{patient.eventualDiagnosis}</strong>) установлен впоследствии.
        Отображаемый риск — результат работы модели раннего выявления, а не клинического заключения.
      </div>
    </motion.div>
  );
}
