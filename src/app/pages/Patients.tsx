import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { patientsData, earlyDetectionPatientsFull } from "../../data/mock";
import { Card } from "../components/Card";
import { Search, Filter, Eye, UserRound, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

type TabKey = "oncology" | "screening";

export function Patients() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("oncology");
  const [search, setSearch] = useState("");

  const filteredOncology = patientsData.filter(
    (p) => !search || p.id.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredScreening = earlyDetectionPatientsFull.filter(
    (p) => !search || p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
            Исторические данные
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Онкологические пациенты и когорта раннего выявления
          </p>
        </div>
      </div>

      <Card>
        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("oncology")}
            className={cn(
              "rounded-2xl px-4 py-2 text-sm font-bold transition",
              activeTab === "oncology"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Онкология ({patientsData.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("screening")}
            className={cn(
              "rounded-2xl px-4 py-2 text-sm font-bold transition",
              activeTab === "screening"
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Скрининг · Раннее выявление ({earlyDetectionPatientsFull.length})
          </button>
        </div>

        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ID..."
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">
              <Filter size={16} />
              Фильтры
            </button>
          </div>
        </div>

        {/* ── Oncology tab ── */}
        {activeTab === "oncology" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-4 pl-4 font-semibold text-slate-500 text-sm">Пациент</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">ID</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Диагноз</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Стадия</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Риск (ИИ)</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Статус</th>
                  <th className="pb-4 pr-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOncology.map((patient, i) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center text-slate-500">
                          <UserRound className="size-5" aria-hidden />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{patient.name}</div>
                          <div className="text-xs text-slate-500">{patient.age} лет · {patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 font-medium text-sm">{patient.id}</td>
                    <td className="py-4 text-slate-600 text-sm">{patient.diagnosis}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                        {patient.stage}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              patient.riskLevel === "Высокий" ? "bg-red-500"
                              : patient.riskLevel === "Средний" ? "bg-amber-500"
                              : "bg-emerald-500"
                            }`}
                            style={{ width: `${patient.riskScore}%` }}
                          />
                        </div>
                        <span className={`font-bold text-sm ${
                          patient.riskLevel === "Высокий" ? "text-red-600"
                          : patient.riskLevel === "Средний" ? "text-amber-600"
                          : "text-emerald-600"
                        }`}>
                          {patient.riskScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        patient.status === "Ремиссия" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : patient.status === "Лечение" ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : patient.status === "Паллиатив" ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-slate-50 text-slate-700 border border-slate-200"
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-indigo-400 group-hover:text-indigo-600 transition">
                        <Eye size={18} />
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Screening tab ── */}
        {activeTab === "screening" && (
          <div className="overflow-x-auto">
            <div className="mb-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              Ретроспективная когорта: пациенты без онкологии на момент сбора данных. Диагноз — ретроспективная метка.
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-4 pl-4 font-semibold text-slate-500 text-sm">ID</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Возраст · Пол</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Диагноз (ретро)</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Уровень риска</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Риск 1 год</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Заполненность</th>
                  <th className="pb-4 font-semibold text-slate-500 text-sm">Дата расчёта</th>
                  <th className="pb-4 pr-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScreening.map((patient, i) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-teal-50/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/patients/early/${patient.id}`)}
                  >
                    <td className="py-3 pl-4 font-semibold text-slate-800 text-sm">{patient.id}</td>
                    <td className="py-3 text-slate-600 text-sm">{patient.age} лет · {patient.gender}</td>
                    <td className="py-3">
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold",
                        patient.eventualDiagnosis === "C34"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      )}>
                        {patient.eventualDiagnosis === "C34" ? "C34 · Рак лёгкого" : "C18-C20 · Колоректальный рак"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold",
                        patient.riskLevel === "Высокий" ? "bg-red-100 text-red-700"
                        : patient.riskLevel === "Средний" ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                      )}>
                        {patient.riskLevel}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full",
                              patient.riskLevel === "Высокий" ? "bg-red-500"
                              : patient.riskLevel === "Средний" ? "bg-amber-500"
                              : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(patient.risks[1], 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{patient.risks[1]}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full",
                              patient.completionPercent >= 90 ? "bg-emerald-500"
                              : patient.completionPercent >= 80 ? "bg-amber-500"
                              : "bg-red-400"
                            )}
                            style={{ width: `${patient.completionPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{patient.completionPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">{patient.lastCalculated}</td>
                    <td className="py-3 pr-4 text-right">
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-600 transition" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
