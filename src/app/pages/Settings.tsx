import { motion } from "motion/react";
import { Card } from "../components/Card";
import { Bell, Lock, User, Database, Globe } from "lucide-react";

export function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
          Настройки системы
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Управление профилем, уведомлениями и параметрами ИИ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {[
            { icon: User, label: "Профиль", active: true },
            { icon: Bell, label: "Уведомления" },
            { icon: Lock, label: "Безопасность" },
            { icon: Database, label: "Интеграции" },
            { icon: Globe, label: "Система ИИ" },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                item.active 
                  ? "bg-white shadow-sm border border-slate-200 text-indigo-600" 
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-800"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <h3 className="font-bold text-lg text-slate-800 mb-6">Личные данные</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-6 mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e410f624c427?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="User" 
                  className="w-20 h-20 rounded-2xl border-2 border-white shadow-md object-cover"
                />
                <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl text-sm hover:bg-indigo-100 transition-colors">
                  Изменить фото
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Имя и Фамилия</label>
                  <input type="text" defaultValue="Д-р Смирнов И.А." className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Специализация</label>
                  <input type="text" defaultValue="Врач-онколог, д.м.н." className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input type="email" defaultValue="smirnov@clinic.med" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Телефон</label>
                  <input type="tel" defaultValue="+7 (999) 123-45-67" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all text-sm">
                  Сохранить изменения
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-lg text-slate-800 mb-6">Настройки предиктивной модели</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Версия модели ИИ</h4>
                  <p className="text-sm text-slate-500 mt-1">Используется последняя версия Онко Ассистент v4.2 (от 15.03.2026)</p>
                </div>
                <button className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors">
                  Проверить обновления
                </button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Авто-загрузка данных из МИС</h4>
                  <p className="text-sm text-slate-500 mt-1">Автоматически подтягивать результаты анализов пациентов</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
