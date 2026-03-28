import { motion } from "motion/react";
import { Card } from "../components/Card";
import { riskDistributionData } from "../../data/mock";
import { 
  PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const ageData = [
  { range: "30-40", пациентов: 45 },
  { range: "41-50", пациентов: 85 },
  { range: "51-60", пациентов: 150 },
  { range: "61-70", пациентов: 210 },
  { range: "71-80", пациентов: 120 },
  { range: "81+", пациентов: 40 },
];

export function Analytics() {
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
            Аналитика и статистика
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Сводные данные по когорте пациентов клиники</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-lg text-slate-800 mb-6">Распределение пациентов по группам риска</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Доля пациентов']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {riskDistributionData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                <span className="text-sm text-slate-600 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-lg text-slate-800 mb-6">Демографическое распределение</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="пациентов" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-1 lg:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Генерация отчета за месяц</h3>
              <p className="text-indigo-100 max-w-xl">
                Полный отчет по динамике рисков, количеству проведенных анализов ИИ и статистике выживаемости по отделению онкологии.
              </p>
            </div>
            <button className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition-colors whitespace-nowrap">
              Скачать PDF
            </button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
