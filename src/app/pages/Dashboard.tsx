import { motion } from "motion/react";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Activity,
  UserRound,
  Brain,
  RefreshCw,
  Search,
  FolderOpen,
  Stethoscope,
  BarChart3,
  Package,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import { patientsData } from "../../data/mock";
import { Card } from "../components/Card";
import { FullInfoPanel } from "../components/FullInfoPanel";
import {
  RefAudienceAdmins,
  RefAudienceAnalysts,
  RefAudienceDoctors,
  RefAudiencePatients,
  RefKeyData,
  RefKeyExplain,
  RefKeyIntellectual,
  RefKeySelfLearn,
} from "../content/referenceContent";

export function Dashboard() {
  const stats = [
    { title: "Пациенты в регистре", value: "1248", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Группа высокого риска", value: "18%", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Точность предикции", value: "94.2%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div
        role="note"
        className="flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950 backdrop-blur-sm"
      >
        <AlertTriangle className="size-5 shrink-0 text-amber-600" aria-hidden />
        <p>
          Система предназначена для <strong>поддержки</strong> принятия клинических решений и{' '}
          <strong>не заменяет</strong> суждение врача. Интерпретация результатов остаётся за специалистом.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
            Единая платформа поддержки онкологических решений
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Два взаимодополняющих сервиса: прогноз для онкопациентов и раннее выявление для групп риска.
          </p>
        </div>
        
        <Link 
          to="/calculator"
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-white transition-all bg-indigo-600 border border-transparent rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden shadow-lg shadow-indigo-500/30"
        >
          <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
          <Activity size={18} />
          <span>Новый прогноз риска</span>
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Выбор сервиса</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Link
            to="/calculator"
            className="group rounded-[32px] border border-indigo-100 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <Activity size={24} aria-hidden />
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Прогноз рецидива и летальности</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Для пациентов с уже установленным колоректальным раком. Горизонты прогноза: 1, 3 и 5 лет.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Врачи-онкологи</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">30 онкоспецифичных параметров</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Лечебные рекомендации</span>
            </div>
          </Link>

          <Link
            to="/early-detection"
            className="group rounded-[32px] border border-teal-100 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <ScanSearch size={24} aria-hidden />
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                Новое
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Раннее выявление C34 / C18-C20</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Для пациентов без диагноза рак. Оценка вероятности заболевания на 1, 2 и 3 года.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Первичное звено</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">20-25 рутинных параметров</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Скрининговые рекомендации</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Для кого предназначена система</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Stethoscope size={22} />
              </div>
              <h3 className="font-bold text-slate-800">Врачи-онкологи</h3>
            </div>
            <p className="text-sm text-slate-600">Объективная оценка риска, объяснимость и экономия времени.</p>
            <FullInfoPanel>
              <RefAudienceDoctors />
            </FullInfoPanel>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-bold text-slate-800">Первичное звено</h3>
            </div>
            <p className="text-sm text-slate-600">Раннее выявление групп риска и маршрутизация на скрининг.</p>
            <FullInfoPanel>
              <RefAudiencePatients />
            </FullInfoPanel>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <BarChart3 size={22} />
              </div>
              <h3 className="font-bold text-slate-800">Администраторы</h3>
            </div>
            <p className="text-sm text-slate-600">Ресурсы, стандартизация наблюдения и планирование нагрузки.</p>
            <FullInfoPanel>
              <RefAudienceAdmins />
            </FullInfoPanel>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Users size={22} />
              </div>
              <h3 className="font-bold text-slate-800">Аналитики</h3>
            </div>
            <p className="text-sm text-slate-600">Закономерности, валидация моделей и качество данных.</p>
            <FullInfoPanel>
              <RefAudienceAnalysts />
            </FullInfoPanel>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Ключевые характеристики</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <Brain className="text-indigo-600" size={24} />
              <h3 className="font-bold text-slate-800">Интеллектуальная основа</h3>
            </div>
            <p className="text-sm text-slate-600">Бустинг, нейросети с вниманием и байесовские модели.</p>
            <FullInfoPanel>
              <RefKeyIntellectual />
            </FullInfoPanel>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-indigo-600" size={24} />
              <h3 className="font-bold text-slate-800">Способность к дообучению</h3>
            </div>
            <p className="text-sm text-slate-600">Переобучение на обезличенных данных с контролем качества.</p>
            <FullInfoPanel>
              <RefKeySelfLearn />
            </FullInfoPanel>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <Search className="text-indigo-600" size={24} />
              <h3 className="font-bold text-slate-800">Объяснимость решений</h3>
            </div>
            <p className="text-sm text-slate-600">Отчёты с вкладом признаков в итоговый риск.</p>
            <FullInfoPanel>
              <RefKeyExplain />
            </FullInfoPanel>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <FolderOpen className="text-amber-600" size={24} />
              <h3 className="font-bold text-slate-800">Работа с данными</h3>
            </div>
            <p className="text-sm text-slate-600">Объём выборки, структура полей и производные признаки.</p>
            <FullInfoPanel>
              <RefKeyData />
            </FullInfoPanel>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Быстрый доступ</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Link
            to="/calculator"
            className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-colors hover:border-indigo-200 hover:bg-white/80"
          >
            <span className="font-semibold text-slate-800">Прогноз рецидива и летальности</span>
            <span className="text-xs text-slate-500">Оценка риска для одного пациента</span>
          </Link>
          <Link
            to="/batch-analysis"
            className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-colors hover:border-violet-200 hover:bg-white/80"
          >
            <span className="flex items-center gap-2 font-semibold text-slate-800">
              <Package className="size-4 text-violet-600 shrink-0" aria-hidden />
              Пакетный анализ
            </span>
            <span className="text-xs text-slate-500">Обработка группы пациентов</span>
          </Link>
          <Link
            to="/patients"
            className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-colors hover:border-indigo-200 hover:bg-white/80"
          >
            <span className="font-semibold text-slate-800">База пациентов</span>
            <span className="text-xs text-slate-500">Список и карточки (аналог истории прогнозов)</span>
          </Link>
          <Link
            to="/models"
            className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-colors hover:border-indigo-200 hover:bg-white/80"
          >
            <span className="font-semibold text-slate-800">Анализ модели</span>
            <span className="text-xs text-slate-500">Версии, метрики и адаптер ИИ</span>
          </Link>
          <Link
            to="/analytics"
            className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-colors hover:border-indigo-200 hover:bg-white/80"
          >
            <span className="font-semibold text-slate-800">Расширенная аналитика</span>
            <span className="text-xs text-slate-500">Сводки по когорте</span>
          </Link>
        </div>
      </section>

      <h2 className="text-lg font-bold text-slate-800 pt-2">Оперативные показатели</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="flex items-center gap-5 hover:scale-[1.02] transition-transform">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <div className="text-slate-500 text-sm font-medium mb-1">{stat.title}</div>
                <div className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="h-full" noPadding>
            <div className="p-6 sm:p-8 border-b border-slate-200/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Недавние прогнозы</h3>
                <p className="text-sm text-slate-500 mt-1">Пациенты с обновленными данными риска</p>
              </div>
              <Link to="/patients" className="text-indigo-600 text-sm font-semibold flex items-center hover:text-indigo-700 group">
                Все пациенты
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="divide-y divide-slate-200/50">
              {patientsData.slice(0, 4).map((patient) => (
                <div key={patient.id} className="p-4 sm:px-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center text-slate-500">
                      <UserRound className="size-6" aria-hidden />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{patient.name}</div>
                      <div className="text-sm text-slate-500 flex gap-2">
                        <span>{patient.id}</span>
                        <span>•</span>
                        <span>{patient.diagnosis}, стадия {patient.stage}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm text-slate-500">Вероятность риска</div>
                      <div className={`font-bold text-lg ${
                        patient.riskLevel === "Высокий" ? "text-red-500" :
                        patient.riskLevel === "Средний" ? "text-amber-500" : "text-emerald-500"
                      }`}>
                        {patient.riskScore}%
                      </div>
                    </div>
                    
                    <span
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 cursor-not-allowed"
                      aria-label="Профиль недоступен"
                      title="Вход в профиль пациента отключен"
                    >
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="h-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <h3 className="text-xl font-bold mb-4 relative z-10">ИИ Рекомендации</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-md">
                <div className="flex gap-3 mb-2">
                  <AlertTriangle className="text-amber-300" size={20} />
                  <span className="font-semibold text-sm">Внимание</span>
                </div>
                <p className="text-sm text-indigo-50/90 leading-relaxed">
                  Замечен рост риска рецидива у 3 пациентов из группы А. Рекомендуется назначить внеплановое обследование.
                </p>
                <button className="mt-3 text-xs bg-white text-indigo-700 px-4 py-2 rounded-full font-bold hover:bg-indigo-50 transition-colors">
                  Посмотреть список
                </button>
              </div>

              <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-md">
                <p className="text-sm text-indigo-50/90 leading-relaxed">
                  Система ИИ обновлена. Точность предсказания для колоректального рака увеличена на 2.4%.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
