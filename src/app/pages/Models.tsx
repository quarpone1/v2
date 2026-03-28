import { motion } from "motion/react";
import { Card } from "../components/Card";
import { Brain, Activity, ArrowUpRight, CheckCircle2, ShieldAlert } from "lucide-react";

export function Models() {
  const models = [
    { name: "Оценка риска рецидива (РМЖ)", version: "v4.2.1", accuracy: "94.2%", status: "Активна", dev: "НМИЦ онкологии им. Блохина" },
    { name: "Раннее выявление (Легкие)", version: "v2.0.5", accuracy: "89.8%", status: "Активна", dev: "НМИЦ онкологии им. Блохина" },
    { name: "Анализ DICOM снимков (МРТ)", version: "v1.9.0", accuracy: "96.5%", status: "Тестирование", dev: "Сторонняя лаборатория" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
            Адаптер моделей ИИ
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Управление математическими моделями и вычислительным ядром</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors">
          Подключить новую модель
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {models.map((model, i) => (
          <Card key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 hover:border-indigo-200 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Brain size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 text-lg">{model.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-mono">{model.version}</span>
                </div>
                <p className="text-sm text-slate-500">Разработчик: {model.dev}</p>
              </div>
            </div>

            <div className="flex items-center gap-8 w-full sm:w-auto mt-4 sm:mt-0">
              <div className="text-center sm:text-right">
                <div className="text-xs text-slate-500 mb-1">Точность (AUC-ROC)</div>
                <div className="font-bold text-emerald-600 text-lg">{model.accuracy}</div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className="text-xs text-slate-500 mb-1">Статус</div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${
                  model.status === 'Активна' ? 'text-emerald-600' : 'text-amber-500'
                }`}>
                  {model.status === 'Активна' ? <CheckCircle2 size={16} /> : <Activity size={16} />}
                  {model.status}
                </div>
              </div>

              <button className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                <ArrowUpRight size={20} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 text-white border-none mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-start gap-4">
          <ShieldAlert className="text-amber-400 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-lg mb-2">Методологическое сопровождение (НМИЦ Блохина)</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Архитектура позволяет встраивать сторонние библиотеки (Python, R, C++) без изменения внутренней логики. Данные из хранилища автоматически проходят валидацию и препроцессинг перед подачей в предиктивные пайплайны.
            </p>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-semibold transition-colors backdrop-blur-md">
              Спецификация API Адаптера
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
