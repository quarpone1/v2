import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { patientsData, survivalData, type PatientRecord } from "../../data/mock";
import { Card } from "../components/Card";
import { PatientRecommendationsAccordion } from "../components/PatientRecommendationsAccordion";
import {
  Printer,
  Download,
  FileText,
  Activity,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Database,
  UserRound,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FEATURES_ANALYZED = 14;

function ValueLine({
  label,
  value,
  suffix,
}: {
  label: string;
  value: ReactNode;
  suffix?: string;
}) {
  const isEmpty = value === null || value === undefined || value === "" || value === "—";
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-800 text-right tabular-nums">
        {isEmpty ? "—" : value}
        {!isEmpty && suffix ? <span className="ml-1 text-slate-500 font-medium">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function PatientProfile() {
  const { id } = useParams();
  const patient: PatientRecord | undefined = id ? patientsData.find((p) => p.id === id) : undefined;
  const [syncing, setSyncing] = useState<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gradId = useId().replace(/:/g, "");

  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== null) clearTimeout(syncTimerRef.current);
    };
  }, []);

  const handleSync = (source: string) => {
    setSyncing(source);
    if (syncTimerRef.current !== null) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      setSyncing(null);
    }, 1500);
  };

  if (!patient) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center space-y-4"
      >
        <h1 className="text-2xl font-bold text-slate-800">Пациент не найден</h1>
        <p className="text-slate-500 max-w-md">
          Запись с идентификатором <span className="font-mono text-slate-700">{id ?? "—"}</span> отсутствует в
          демо-данных.
        </p>
        <Link
          to="/patients"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          К списку пациентов
        </Link>
      </motion.div>
    );
  }

  const pr = (patient as any).prognosis as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-white shadow-md shrink-0 flex items-center justify-center text-slate-500">
            <UserRound className="size-8" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800 truncate">{patient.name}</h1>
            <p className="text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base">
              <span className="whitespace-nowrap">ID: {patient.id}</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" aria-hidden />
              <span>{patient.age} лет</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" aria-hidden />
              <span className="break-words">
                {patient.diagnosis} ({patient.stage} ст.)
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <div className="flex flex-wrap gap-2 xl:mr-4 xl:pr-4 xl:border-r border-slate-200">
            <button
              type="button"
              onClick={() => handleSync("remd")}
              disabled={syncing === "remd"}
              className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-semibold disabled:opacity-60"
            >
              <Database size={14} aria-hidden />
              {syncing === "remd" ? "Запрос..." : "СЭМД из РЭМД"}
            </button>
            <button
              type="button"
              onClick={() => handleSync("vimis")}
              disabled={syncing === "vimis"}
              className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-semibold disabled:opacity-60"
            >
              <RefreshCw size={14} className={syncing === "vimis" ? "animate-spin" : ""} aria-hidden />
              {syncing === "vimis" ? "Синхронизация..." : "ВИМИС Онкология"}
            </button>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/60 border border-slate-200 backdrop-blur-md rounded-xl text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm font-semibold"
          >
            <Printer size={16} aria-hidden />
            <span className="hidden sm:inline">Печать</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 border border-transparent rounded-xl text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 text-sm font-semibold"
          >
            <Download size={16} aria-hidden />
            <span className="hidden sm:inline">Выгрузить отчет</span>
          </button>
        </div>
      </div>

      {/* Сводка результата — как в эталонном интерфейсе */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="flex flex-col justify-center py-4 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Вероятность рецидива</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{patient.riskScore}%</p>
        </Card>
        <Card className="flex flex-col justify-center py-4 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Категория риска</p>
          <p
            className={`mt-1 text-2xl font-bold uppercase tracking-tight ${
              patient.riskLevel === "Высокий"
                ? "text-red-600"
                : patient.riskLevel === "Средний"
                  ? "text-amber-600"
                  : "text-emerald-600"
            }`}
          >
            {patient.riskLevel}
          </p>
        </Card>
        <Card className="flex flex-col justify-center py-4 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Признаков проанализировано</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{FEATURES_ANALYZED}</p>
          <p className="mt-0.5 text-xs text-slate-400">В полной версии — до 36+</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <h2 className="font-bold text-lg text-slate-800 mb-4">Индивидуальная оценка риска</h2>

            <div className="flex flex-col items-center py-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      patient.riskScore > 50 ? "#ef4444" : patient.riskScore > 20 ? "#f59e0b" : "#10b981"
                    }
                    strokeWidth="10"
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * patient.riskScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800">{patient.riskScore}%</span>
                  <span
                    className={`text-sm font-bold mt-1 ${
                      patient.riskLevel === "Высокий"
                        ? "text-red-500"
                        : patient.riskLevel === "Средний"
                          ? "text-amber-500"
                          : "text-emerald-500"
                    }`}
                  >
                    {patient.riskLevel} риск
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex gap-3">
                <ShieldAlert className="text-indigo-500 shrink-0" size={20} aria-hidden />
                <p className="text-sm text-slate-600 leading-relaxed">
                  На основе {FEATURES_ANALYZED} клинических параметров, ЭМК и ИИ-анализа снимков оценена
                  вероятность рецидива в горизонте наблюдения. Подробные руководства — в блоке рекомендаций ниже.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold text-lg text-slate-800 mb-4">Основные факторы (ИИ-Адаптер)</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Размер опухоли (T)</span>
                  <span className="text-red-600 font-bold">+12%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full">
                  <div className="bg-red-400 h-2 rounded-full w-[80%]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Возраст пациента</span>
                  <span className="text-amber-600 font-bold">+5%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full">
                  <div className="bg-amber-400 h-2 rounded-full w-[40%]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Маркер Ki-67 (Лаб. СЭМД)</span>
                  <span className="text-emerald-600 font-bold">-3%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full">
                  <div className="bg-emerald-400 h-2 rounded-full w-[20%]" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-6">
              <h2 className="font-bold text-lg text-slate-800">Прогноз выживаемости и мониторинг</h2>
              <p className="text-sm text-slate-500 mt-1">
                Оценка динамики на базе математических моделей НМИЦ Блохина
              </p>
            </div>
            <div className="h-64 w-full min-h-[16rem]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={survivalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(v) => `${v} год`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={-10} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [`${value}%`, "Выживаемость"]}
                    labelFormatter={(label) => `Год ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="survival"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#${gradId})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-bold text-lg text-slate-800">Клинические данные пациента</h2>
            </div>

            {!pr ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Для этого пациента клинические параметры прогноза в демо-данных не заданы.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white/60 p-4">
                  <h3 className="font-bold text-slate-800 mb-2">Паспорт</h3>
                  <ValueLine label="Пол (как в прогнозе)" value={pr.sex ?? "—"} />
                  <ValueLine label="Возраст" value={patient.age} suffix="лет" />
                  <ValueLine label="Рост" value={pr.heightCm} suffix="см" />
                  <ValueLine label="Вес" value={pr.weightKg} suffix="кг" />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white/60 p-4">
                  <h3 className="font-bold text-slate-800 mb-2">Стадирование и опухоль</h3>
                  <ValueLine label="Стадия" value={pr.stage ?? patient.stage ?? "—"} />
                  <ValueLine label="pT" value={pr.pT ?? "—"} />
                  <ValueLine label="pN" value={pr.pN ?? "—"} />
                  <ValueLine label="pM" value={pr.pM ?? "—"} />
                  <ValueLine label="G" value={pr.gradeG ?? "—"} />
                  <ValueLine label="Лимфоваск. инвазия" value={pr.lymphovascularInvasion ?? "—"} />
                  <ValueLine label="Периневральная инвазия" value={pr.perineuralInvasion ?? "—"} />
                  <ValueLine label="Л/у исследовано" value={pr.nodesExamined} />
                  <ValueLine label="Л/у поражено" value={pr.nodesAffected} />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 lg:col-span-2">
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="font-bold text-slate-800">Лаборатория и лечение</h3>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/60">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      {/* headers row */}
                      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Лабораторные показатели
                        </div>
                      </div>
                      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200 lg:border-l lg:border-slate-200">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Лечение</div>
                      </div>

                      {/* content row */}
                      <div className="p-4 sm:p-5 bg-white/70">
                        <ValueLine label="РЭА (CEA)" value={pr.cea} suffix="нг/мл" />
                        <ValueLine label="Гемоглобин" value={pr.hemoglobin} suffix="г/л" />
                        <ValueLine label="Лейкоциты" value={pr.leukocytes} suffix="×10⁹/л" />
                        <ValueLine label="Лимфоциты (абс.)" value={pr.lymphocytesAbs} suffix="×10⁹/л" />
                        <ValueLine label="Тромбоциты" value={pr.platelets} suffix="×10⁹/л" />
                        <ValueLine label="АСТ" value={pr.ast} suffix="Ед/л" />
                        <ValueLine label="Билирубин" value={pr.bilirubin} suffix="мкмоль/л" />
                        <ValueLine label="Альбумин" value={pr.albumin} suffix="г/л" />
                      </div>

                      <div className="p-4 sm:p-5 bg-white/70 lg:border-l lg:border-slate-200">
                        <ValueLine label="Операция" value={pr.operation ?? "—"} />
                        <ValueLine label="Хирургический доступ" value={pr.surgicalAccess ?? "—"} />
                        <ValueLine label="Адъювантная терапия" value={pr.adjuvantTherapy ?? "—"} />
                        <ValueLine label="Схема" value={pr.adjuvantScheme ?? "—"} />
                        <ValueLine label="Курсы" value={pr.adjuvantCourses} />
                        <ValueLine label="Лучевая терапия" value={pr.radiotherapy ?? "—"} />
                        <ValueLine label="Место лечения" value={pr.therapySite ?? "—"} />
                        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                          Молекулярные маркеры: KRAS — {pr.kras ?? "—"}, NRAS — {pr.nras ?? "—"}, BRAF —{" "}
                          {pr.braf ?? "—"}.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-bold text-lg text-slate-800 mb-4">Краткие клинические ориентиры</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                  <Activity size={20} aria-hidden />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Терапия</h3>
                <p className="text-sm text-slate-600">
                  Рассмотреть добавление таргетной терапии при подтверждённой экспрессии HER2 — по заключению
                  консилиума.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <FileText size={20} aria-hidden />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Наблюдение</h3>
                <p className="text-sm text-slate-600">
                  Согласовать интервал контрольных визуализаций с учётом уровня риска и переносимости терапии.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <PatientRecommendationsAccordion patient={patient} />

      <Card>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-bold text-lg text-slate-800">Журнал интеграций и событий</h2>
            <p className="text-sm text-slate-500 mt-1">
              СЭМД, ВИМИС, МИС и обращения к адаптеру моделей (технический аудит).
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-xs text-amber-950"
            role="note"
          >
            <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
            Служебные записи; не смешивать с клиническими рекомендациями выше.
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 -mx-1 sm:mx-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold text-slate-600 whitespace-nowrap">Дата/Время</th>
                <th className="px-4 sm:px-6 py-3 font-semibold text-slate-600">Событие / Модуль</th>
                <th className="px-4 sm:px-6 py-3 font-semibold text-slate-600">Уровень/Пользователь</th>
                <th className="px-4 sm:px-6 py-3 font-semibold text-slate-600 whitespace-nowrap">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="px-4 sm:px-6 py-4 text-slate-500 whitespace-nowrap">28.03.2026, 14:32</td>
                <td className="px-4 sm:px-6 py-4 font-medium">Запрос в адаптер моделей (Прогноз риска v4.2)</td>
                <td className="px-4 sm:px-6 py-4">Онкодиспансер / Смирнов И.А.</td>
                <td className="px-4 sm:px-6 py-4">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium">
                    Успех
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-6 py-4 text-slate-500 whitespace-nowrap">26.03.2026, 09:15</td>
                <td className="px-4 sm:px-6 py-4 font-medium">Синхронизация СЭМД «Лабораторные исследования»</td>
                <td className="px-4 sm:px-6 py-4">РЭМД (Авто-интеграция)</td>
                <td className="px-4 sm:px-6 py-4">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium">
                    Успех
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-6 py-4 text-slate-500 whitespace-nowrap">20.03.2026, 11:05</td>
                <td className="px-4 sm:px-6 py-4 font-medium">Передача данных в ВИМИС Онкология</td>
                <td className="px-4 sm:px-6 py-4">Системный процесс</td>
                <td className="px-4 sm:px-6 py-4">
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium">
                    Успех
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
