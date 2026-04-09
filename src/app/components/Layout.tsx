import { NavLink, Outlet, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  UserRound,
  History,
  Package,
  LineChart,
  TrendingUp,
  MapPin,
  Share2,
  Microscope,
  Award,
  Database,
  Settings,
  Search,
  Bell,
  Menu,
  Stethoscope,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useRef, useState } from "react";
import blohinLogo from "../assets/logo.svg";

const ROLES = [
  { id: "regional_primary", name: "Первичное звено", desc: "МИС МО (Общий профиль)" },
  { id: "regional_special", name: "Онкодиспансер", desc: "Спец. диагностика" },
  { id: "federal", name: "НМИЦ Блохина", desc: "Федеральный уровень" },
];

type NavLinkItem = {
  kind: "link";
  to: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

type NavDisabledItem = {
  kind: "disabled";
  label: string;
  icon: LucideIcon;
  hint: string;
};

type NavItem = NavLinkItem | NavDisabledItem;

const navItems: NavItem[] = [
  {
    kind: "link",
    to: "/",
    label: "Главная",
    icon: LayoutDashboard,
    isActive: (p) => p === "/",
  },
  {
    kind: "link",
    to: "/calculator",
    label: "Индивидуальный прогноз",
    icon: UserRound,
    isActive: (p) => p === "/calculator" || p.startsWith("/calculator/"),
  },
  {
    kind: "link",
    to: "/patients",
    label: "Исторические данные",
    icon: History,
    isActive: (p) => p === "/patients" || p.startsWith("/patients/"),
  },
  {
    kind: "link",
    to: "/batch-analysis",
    label: "Пакетный анализ",
    icon: Package,
    isActive: (p) => p === "/batch-analysis" || p.startsWith("/batch-analysis/"),
  },
  {
    kind: "link",
    to: "/analytics",
    label: "Расширенная аналитика",
    icon: LineChart,
    isActive: (p) => p === "/analytics" || p.startsWith("/analytics/"),
  },
  {
    kind: "disabled",
    label: "Прогнозирование",
    icon: TrendingUp,
    hint: "Раздел в разработке",
  },
  {
    kind: "disabled",
    label: "Геоаналитика",
    icon: MapPin,
    hint: "Раздел в разработке",
  },
  {
    kind: "disabled",
    label: "Сетевой анализ",
    icon: Share2,
    hint: "Раздел в разработке",
  },
  {
    kind: "link",
    to: "/models",
    label: "Анализ модели",
    icon: Microscope,
    isActive: (p) => p === "/models" || p.startsWith("/models/"),
  },
  {
    kind: "disabled",
    label: "Качество модели",
    icon: Award,
    hint: "Раздел в разработке",
  },
  {
    kind: "link",
    to: "/integrations",
    label: "Интеграции",
    icon: Database,
    isActive: (p) => p === "/integrations" || p.startsWith("/integrations/"),
  },
];

export function Layout() {
  const location = useLocation();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [currentRole, setCurrentRole] = useState(ROLES[1]);
  const [isDoctorTooltipVisible, setIsDoctorTooltipVisible] = useState(false);
  const doctorTooltipRef = useRef<HTMLDivElement | null>(null);

  const updateDoctorTooltipPosition = (x: number, y: number) => {
    if (!doctorTooltipRef.current) return;
    doctorTooltipRef.current.style.left = `${x + 12}px`;
    doctorTooltipRef.current.style.top = `${y - 10}px`;
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-sans relative selection:bg-indigo-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-400/10 blur-[90px] pointer-events-none" />

      <aside className="w-[280px] h-full p-6 flex flex-col z-10 border-r border-white/60 bg-white/40 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3 mb-6 px-2 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Stethoscope size={22} aria-hidden />
          </div>
          <div className="font-semibold text-xl tracking-tight text-slate-900">
            Онко <span className="text-indigo-600">Ассистент</span>
          </div>
        </div>

        <p className="mb-5 rounded-2xl border border-indigo-100/80 bg-white/50 px-3 py-2.5 text-xs leading-relaxed text-slate-600 backdrop-blur-sm shrink-0">
          Комплексная поддержка клинических решений на всех этапах онкологической помощи: от первичной
          диагностики до динамического наблюдения.
        </p>

        <div className="relative mb-4 z-50 shrink-0">
          <button
            type="button"
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="w-full flex items-center justify-between bg-white/60 border border-indigo-100 p-3 rounded-2xl hover:bg-white/80 transition-all text-left shadow-sm backdrop-blur-md"
          >
            <div>
              <div className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-0.5">
                Текущий доступ
              </div>
              <div className="text-sm font-semibold text-slate-800 leading-tight">{currentRole.name}</div>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${showRoleSelector ? "rotate-180" : ""}`} />
          </button>

          {showRoleSelector && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white/90 backdrop-blur-xl border border-indigo-50 rounded-2xl shadow-xl p-2 space-y-1 z-50">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setCurrentRole(role);
                    setShowRoleSelector(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    currentRole.id === role.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="font-semibold text-sm">{role.name}</div>
                  <div className="text-xs opacity-70 mt-0.5">{role.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="relative mb-4 flex items-center gap-3 px-2 py-3 bg-white/40 border border-white/50 rounded-2xl backdrop-blur-md shrink-0"
          onMouseEnter={(e) => {
            updateDoctorTooltipPosition(e.clientX, e.clientY);
            setIsDoctorTooltipVisible(true);
          }}
          onMouseMove={(e) => updateDoctorTooltipPosition(e.clientX, e.clientY)}
          onMouseLeave={() => setIsDoctorTooltipVisible(false)}
        >
          <img
            src="https://images.unsplash.com/photo-1612349317150-e410f624c427?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
            className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-900 leading-snug whitespace-normal break-words">Смирнов В.Д., врач-онколог</span>
          </div>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 shrink-0">
          Навигация
        </p>

        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-1 pr-1 -mr-1" aria-label="Основное меню">
          {navItems.map((item) => {
            if (item.kind === "disabled") {
              return (
                <div
                  key={item.label}
                  title={item.hint}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 cursor-not-allowed select-none"
                  aria-disabled="true"
                >
                  <item.icon size={20} className="opacity-50 shrink-0" aria-hidden />
                  <span className="text-sm">{item.label}</span>
                </div>
              );
            }

            const isActive = item.isActive(location.pathname);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group",
                  isActive ? "text-indigo-700 font-medium" : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/80 border border-white/60 shadow-sm rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  size={20}
                  className={cn(
                    "relative z-10 shrink-0 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"
                  )}
                  aria-hidden
                />
                <span className="relative z-10 leading-snug">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-white/50 shrink-0 space-y-3">
          <p className="text-center text-[11px] text-slate-400 font-medium">Версия 1.0.2</p>
          <NavLink
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group",
              location.pathname.startsWith("/settings")
                ? "text-indigo-700 font-medium bg-white/80 shadow-sm border border-white/60"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Settings size={20} className="text-slate-400 group-hover:text-indigo-500 shrink-0" aria-hidden />
            <span>Настройки</span>
          </NavLink>

          <div
            ref={doctorTooltipRef}
            className={cn(
              "pointer-events-none fixed z-[100] w-max max-w-[260px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg transition-opacity",
              isDoctorTooltipVisible ? "opacity-100" : "opacity-0"
            )}
          >
            Смирнов В.Д.
            <br />
            Врач-онколог
          </div>
        </div>
        <div className="mt-auto pt-4 shrink-0">
          <div className="rounded-2xl border border-white/60 bg-white/50 px-3 py-3 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <img
                src={blohinLogo}
                alt="НМИЦ онкологии им. Н.Н. Блохина"
                className="h-8 w-auto shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold leading-snug text-slate-700">
                  Клиническая база: ФГБУ &quot;НМИЦ онкологии им. Н.Н. Блохина&quot; Минздрава России
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full min-w-0 z-10 relative">
        <header className="h-[80px] px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-4 z-20 border-b border-white/20 bg-white/10 backdrop-blur-md shrink-0">
          <div className="flex-1 max-w-md min-w-0 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} aria-hidden />
            <label htmlFor="global-search" className="sr-only">
              Поиск по пациентам
            </label>
            <input
              id="global-search"
              type="search"
              placeholder="Поиск по пациентам (ID, диагноз)..."
              className="w-full h-11 pl-11 pr-4 bg-white/50 border border-white/60 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-sm backdrop-blur-sm"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              type="button"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white/50 border border-white/60 hover:bg-white/80 transition-all text-slate-600 shadow-sm relative"
              aria-label="Уведомления"
            >
              <Bell size={18} aria-hidden />
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" aria-hidden />
            </button>
            <button
              type="button"
              className="md:hidden w-11 h-11 rounded-full flex items-center justify-center bg-white/50 border border-white/60 text-slate-600 shadow-sm"
              aria-label="Меню"
            >
              <Menu size={18} aria-hidden />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-5 relative min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
