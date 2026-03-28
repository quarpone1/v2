import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/Card";
import { FullInfoPanel } from "../components/FullInfoPanel";
import { PrognosisDataTabs } from "../components/PrognosisDataTabs";
import {
  RefFormFillingGuide,
  RefStep1MisRemd,
  RefStep2Diagnostics,
  RefStep3Pipeline,
} from "../content/referenceContent";
import { patientsData } from "../../data/mock";
import { Check, ChevronRight, Calculator as CalculatorIcon, ShieldAlert, Database, Activity, Info, Download } from "lucide-react";
import { useNavigate } from "react-router";

/** Как на эталонном скрине «Всего пациентов в базе: 1473» */
const PROGNOSIS_DB_TOTAL = 1473;

const steps = [
  { id: 1, name: "Импорт из МИС/РЭМД", description: "Сбор ЭМК" },
  { id: 2, name: "Спец. диагностика", description: "Лаборатория" },
  { id: 3, name: "Предиктивный пайплайн", description: "Адаптер моделей" },
];

export function Calculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patientsData[0]?.id ?? "");
  const [loadedPatient, setLoadedPatient] = useState<(typeof patientsData)[number] | null>(null);
  const navigate = useNavigate();
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLoadPatientData = () => {
    const p = patientsData.find((x) => x.id === selectedPatientId);
    if (p) setLoadedPatient(p);
  };

  useEffect(() => {
    return () => {
      if (processingTimerRef.current !== null) {
        clearTimeout(processingTimerRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(s => s + 1);
      if (currentStep === 2) {
        setIsProcessing(true);
        if (processingTimerRef.current !== null) {
          clearTimeout(processingTimerRef.current);
        }
        processingTimerRef.current = setTimeout(() => {
          processingTimerRef.current = null;
          setIsProcessing(false);
        }, 2500);
      }
    } else {
      const targetId = (loadedPatient?.id ?? selectedPatientId) || "PT-001";
      navigate(`/patients/${targetId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8 py-8 px-2 sm:px-4"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
          Модуль оценки рисков
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Раннее выявление и прогнозирование рецидивов на базе математических моделей</p>
      </div>

      {/* Progress: линии и круги в одном ряду; подписи отдельным рядом снизу — без наложения на линии */}
      <nav aria-label="Progress" className="mx-auto w-full max-w-3xl px-2">
        <ol role="list" className="flex w-full items-stretch">
          {steps.map((step, stepIdx) => {
            const prevStepId = stepIdx > 0 ? steps[stepIdx - 1].id : null;
            const leftSegmentDone = prevStepId != null && currentStep > prevStepId;
            const rightSegmentDone = currentStep > step.id;
            return (
              <li key={step.name} className="flex min-w-0 flex-1 flex-col items-stretch">
                <div className="flex min-h-10 w-full items-center">
                  {stepIdx > 0 && (
                    <div
                      className={`h-0.5 min-w-2 flex-1 ${leftSegmentDone ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      aria-hidden
                    />
                  )}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      step.id < currentStep
                        ? 'bg-indigo-600'
                        : step.id === currentStep
                        ? 'bg-white border-2 border-indigo-600 shadow-md'
                        : 'bg-white/50 border-2 border-slate-200'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-6 w-6 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={`font-semibold text-sm ${
                          step.id === currentStep ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div
                      className={`h-0.5 min-w-2 flex-1 ${rightSegmentDone ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      aria-hidden
                    />
                  )}
                </div>
                <p
                  className={`mx-auto mt-4 max-w-[11rem] text-center text-xs font-semibold leading-snug text-balance sm:max-w-[13rem] sm:text-[13px] ${
                    step.id <= currentStep ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.name}
                </p>
              </li>
            );
          })}
        </ol>
      </nav>

      <Card className="mt-12 p-8 sm:p-12">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-800">Ввод данных пациента</h2>
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-2 self-start px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <Database size={16} aria-hidden />
                  Авто-импорт из МИС (ЭМК)
                </button>
              </div>

              <p className="rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm text-slate-600 backdrop-blur-sm">
                Всего пациентов в базе:{" "}
                <span className="font-bold tabular-nums text-slate-800">{PROGNOSIS_DB_TOTAL.toLocaleString("ru-RU")}</span>
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-2">
                  <label htmlFor="calc-patient-select" className="text-sm font-semibold text-slate-700">
                    Выберите пациента из базы данных:
                  </label>
                  <select
                    id="calc-patient-select"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
                  >
                    {patientsData.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleLoadPatientData}
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-colors hover:bg-indigo-700"
                >
                  <Download className="size-4" aria-hidden />
                  Загрузить данные
                </button>
              </div>

              <div className="rounded-2xl border border-sky-200/70 bg-sky-50/50 p-4 sm:p-5 space-y-5">
                <FullInfoPanel
                  summary={
                    <div className="flex gap-3">
                      <Info className="mt-0.5 size-5 shrink-0 text-sky-600" aria-hidden />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">О заполнении формы</h3>
                        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                          Поля, отмеченные звёздочкой (<span className="text-red-500 font-semibold">*</span>), обязательны для
                          расчёта прогноза; при интеграции данные можно подгрузить из МИС или файла.
                        </p>
                      </div>
                    </div>
                  }
                >
                  <RefFormFillingGuide />
                </FullInfoPanel>
                <div className="border-t border-sky-200/50 pt-5">
                  <FullInfoPanel
                    summary={
                      <p className="text-sm font-semibold text-slate-700 pr-2">
                        Импорт из МИС / сверка с РЭМД
                      </p>
                    }
                  >
                    <RefStep1MisRemd />
                  </FullInfoPanel>
                </div>
              </div>

              <PrognosisDataTabs loadedPatient={loadedPatient} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Специализированная диагностика</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors">
                  <Database size={16} />
                  Подтянуть СЭМД из РЭМД
                </button>
              </div>

              <p className="text-sm text-slate-600">
                Дополнительная специализированная диагностика после заполнения вкладок на шаге 1. Блок лечения и
                госпитализации — на вкладке «Лечение и госпитализация».
              </p>

              <div className="border-b border-slate-100 pb-4">
                <FullInfoPanel>
                  <RefStep2Diagnostics />
                </FullInfoPanel>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Индекс пролиферации Ki-67 (%)</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="0" max="100" className="w-full accent-indigo-600" />
                    <span className="w-12 text-center font-bold text-slate-700">45%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Генетические мутации (BRCA1/2)</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-white transition-colors gap-2">
                      <input type="radio" name="mutation" className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="font-medium text-sm text-slate-700">Обнаружена</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center p-3 border border-indigo-200 rounded-xl bg-indigo-50 cursor-pointer transition-colors gap-2">
                      <input type="radio" name="mutation" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="font-medium text-sm text-indigo-700">Не обнаружена</span>
                    </label>
                  </div>
                </div>
                <div className="col-span-full space-y-2 mt-4">
                  <label className="text-sm font-semibold text-slate-700">Инструментальные исследования (DICOM)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <CalculatorIcon />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Перетащите файлы КТ/МРТ/ПЭТ сюда</p>
                    <p className="text-xs text-slate-500 mt-1">или нажмите для выбора (Адаптер моделей поддерживает прямую загрузку)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="text-indigo-600 animate-pulse" size={32} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">ИИ анализирует данные...</h2>
                  <p className="text-slate-500 mt-2">Сравнение с базой из 10,000+ клинических случаев</p>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full max-w-lg mx-auto">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 shadow-lg shadow-emerald-500/20">
                    <Check size={48} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Анализ завершен!</h2>
                  <p className="text-slate-500 max-w-md mx-auto mb-4 text-center">
                    Нейросеть успешно обработала данные и сформировала предиктивную модель вероятности рецидива.
                  </p>
                  <div className="mb-8 w-full">
                    <FullInfoPanel align="stretch">
                      <RefStep3Pipeline />
                    </FullInfoPanel>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full max-w-sm mb-8 flex justify-between items-center">
                    <div className="text-left">
                      <div className="text-sm text-slate-500 font-medium">Рассчитанный риск</div>
                      <div className="text-2xl font-black text-amber-500">24% <span className="text-base font-medium">Средний</span></div>
                    </div>
                    <ShieldAlert className="text-amber-500 opacity-20" size={48} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
          <button
            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentStep === 1 || (currentStep === 3 && isProcessing)
                ? 'opacity-0 pointer-events-none'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Назад
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentStep === 3 && isProcessing}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white transition-all shadow-lg ${
              currentStep === 3 && isProcessing
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-500/30'
            }`}
          >
            {currentStep === 3 ? (isProcessing ? 'Анализ...' : 'Посмотреть полный отчет') : 'Продолжить'}
            {(!isProcessing || currentStep !== 3) && <ChevronRight size={18} />}
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
