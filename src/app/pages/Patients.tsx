import { motion } from "motion/react";
import { Link } from "react-router";
import { patientsData } from "../../data/mock";
import { Card } from "../components/Card";
import { Search, Filter, Eye, UserRound } from "lucide-react";

export function Patients() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">Исторические данные</h1>
          <p className="text-slate-500 mt-2 font-medium">Мониторинг всех пациентов с онкологическими заболеваниями</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
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
                <th className="pb-4 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientsData.map((patient, i) => (
                <motion.tr 
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center text-slate-500">
                        <UserRound className="size-5" aria-hidden />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{patient.name}</div>
                        <div className="text-xs text-slate-500">{patient.age} лет • {patient.gender}</div>
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
                            patient.riskLevel === "Высокий" ? "bg-red-500" :
                            patient.riskLevel === "Средний" ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${patient.riskScore}%` }}
                        />
                      </div>
                      <span className={`font-bold text-sm ${
                        patient.riskLevel === "Высокий" ? "text-red-600" :
                        patient.riskLevel === "Средний" ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {patient.riskScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      patient.status === "Ремиссия" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      patient.status === "Лечение" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      patient.status === "Паллиатив" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                      "bg-slate-50 text-slate-700 border border-slate-200"
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right">
                    {"prognosis" in patient && patient.prognosis ? (
                      <Link
                        to={`/patients/${patient.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        aria-label="Открыть профиль пациента"
                        title="Открыть профиль"
                      >
                        <Eye size={18} />
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-300 cursor-not-allowed"
                        aria-label="Профиль недоступен"
                        title="Профиль недоступен: нет данных индивидуального прогноза"
                      >
                        <Eye size={18} />
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
