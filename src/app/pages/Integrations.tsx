import { motion } from "motion/react";
import { Card } from "../components/Card";
import { Database, Server, Link as LinkIcon, CheckCircle2, RefreshCw } from "lucide-react";

export function Integrations() {
  const systems = [
    { name: "МИС МО (ЭМК пациента)", status: "connected", lastSync: "10 минут назад", type: "Входящие данные" },
    { name: "РЭМД (СЭМДы)", status: "connected", lastSync: "1 час назад", type: "Лабораторные и инструментальные исследования" },
    { name: "Национальный канцер-регистр", status: "syncing", lastSync: "Обновляется...", type: "Статистика и учет" },
    { name: "ВИМИС Онкология", status: "connected", lastSync: "Вчера, 23:00", type: "Двусторонний обмен" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
          Сервисы интеграции
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Управление потоками первичных клинических данных</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systems.map((sys, i) => (
          <Card key={i} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                {sys.name.includes("МИС") ? <Server size={24} /> : <Database size={24} />}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                sys.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {sys.status === 'connected' ? <CheckCircle2 size={14} /> : <RefreshCw size={14} className="animate-spin" />}
                {sys.status === 'connected' ? 'Подключено' : 'Синхронизация'}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{sys.name}</h3>
            <p className="text-sm text-slate-500 mb-4 flex-1">{sys.type}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
              <span className="text-xs text-slate-400">Последняя синхронизация: {sys.lastSync}</span>
              <button className="text-indigo-600 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                <LinkIcon size={18} />
              </button>
            </div>
          </Card>
        ))}
      </div>
      
      <Card>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Статус хранилища данных</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Сырые данные (Data Lake)</span>
            <span className="font-semibold text-slate-800">4.2 ТБ / 10 ТБ</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[42%]"></div>
          </div>
          
          <div className="flex justify-between items-center text-sm pt-4">
            <span className="text-slate-600">Нормализованные данные (Готовые для ИИ)</span>
            <span className="font-semibold text-slate-800">1.8 ТБ</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[18%]"></div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
