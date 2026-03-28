import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Package,
  Upload,
  Database,
  Play,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
  Download,
  ArrowRight,
} from "lucide-react";
import { patientsData } from "../../data/mock";
import { Card } from "../components/Card";
import { FullInfoPanel } from "../components/FullInfoPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { cn } from "../../lib/utils";

type BatchRow = {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: string;
  status: "готово" | "ошибка";
  finishedAt: string;
};

const MODEL_OPTIONS = ["Прогноз риска рецидива v4.2.1", "Прогноз риска рецидива v4.2.0 (стабильная)"];

function riskLevelFromScore(score: number): string {
  if (score >= 70) return "Высокий";
  if (score >= 40) return "Средний";
  return "Низкий";
}

function makeBatchResults(ids: string[]): BatchRow[] {
  const now = new Date().toISOString();
  return ids.map((id) => {
    const p = patientsData.find((x) => x.id === id);
    if (!p) {
      return {
        id,
        name: "—",
        riskScore: 0,
        riskLevel: "—",
        status: "ошибка" as const,
        finishedAt: now,
      };
    }
    const jitter = Math.round((Math.random() - 0.5) * 6);
    const score = Math.min(99, Math.max(1, p.riskScore + jitter));
    return {
      id: p.id,
      name: p.name,
      riskScore: score,
      riskLevel: riskLevelFromScore(score),
      status: "готово" as const,
      finishedAt: now,
    };
  });
}

/** Демо-шаблон CSV для пакетной загрузки */
function buildCsvTemplate(): string {
  const header =
    "patient_id;age;gender;stage;cea_ng_ml;albumin_g_l\nPT-001;58;М;II;12,4;42\nPT-002;64;Ж;III;38,1;36";
  return header;
}

export function BatchAnalysis() {
  const [sourceTab, setSourceTab] = useState("registry");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(patientsData.map((p) => p.id)));
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [modelVersion, setModelVersion] = useState(MODEL_OPTIONS[0]);
  const [explainability, setExplainability] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchRow[] | null>(null);
  const [lastJobSize, setLastJobSize] = useState(0);
  const runCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      runCleanup.current?.();
    };
  }, []);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(patientsData.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const runBatch = useCallback(() => {
    if (isRunning) return;

    let ids: string[] = [];
    if (sourceTab === "registry") {
      ids = [...selectedIds];
    } else {
      ids = patientsData.map((p) => p.id);
      if (!fileLabel) {
        ids = ids.slice(0, 4);
      }
    }

    if (ids.length === 0) return;

    runCleanup.current?.();
    runCleanup.current = null;

    setIsRunning(true);
    setProgress(0);
    setResults(null);
    setLastJobSize(ids.length);

    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 10));
    }, 160);

    const finish = setTimeout(() => {
      clearInterval(interval);
      const rows = makeBatchResults(ids);
      setResults(rows);
      setProgress(100);
      setIsRunning(false);
    }, 1800);

    runCleanup.current = () => {
      clearInterval(interval);
      clearTimeout(finish);
    };
  }, [fileLabel, isRunning, selectedIds, sourceTab]);

  const downloadResultsCsv = () => {
    if (!results?.length) return;
    const lines = [
      "id;name;risk_percent;risk_category;status;finished_at",
      ...results.map(
        (r) =>
          `${r.id};${r.name};${r.riskScore};${r.riskLevel};${r.status};${r.finishedAt}`,
      ),
    ];
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `batch_prognosis_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadTemplate = () => {
    const blob = new Blob(["\ufeff" + buildCsvTemplate()], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "batch_import_template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Package className="size-5" aria-hidden />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
              Пакетный анализ
            </h1>
          </div>
          <p className="mt-2 max-w-3xl text-slate-500 font-medium">
            Массовый расчёт прогноза риска рецидива для группы пациентов из регистра или по файлу импорта —
            в том же контуре данных, что и индивидуальный прогноз.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-200/70 bg-sky-50/50 p-4 sm:p-5">
        <FullInfoPanel
          summary={
            <div className="flex gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-sky-600" aria-hidden />
              <div className="min-w-0">
                <h2 className="font-semibold text-slate-800 text-sm sm:text-base">Как устроен пакетный режим</h2>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Задание ставится в очередь адаптера моделей; для каждой записи формируется прогноз и категория
                  риска. Результаты можно выгрузить в CSV и открыть карточку пациента.
                </p>
              </div>
            </div>
          }
        >
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>
              <strong>Регистр:</strong> флажки по пациентам МИС/демо-базы; удобно для контрольной когорты
              отделения.
            </li>
            <li>
              <strong>Файл:</strong> CSV с разделителем «;» (шаблон ниже). В демо после выбора файла используется
              полный прогон по учебной выборке; в продукте строки маппятся на признаки модели.
            </li>
            <li>Минимальный набор колонок для импорта: идентификатор, возраст, пол, стадия, ключевые лабораторные показатели.</li>
          </ul>
        </FullInfoPanel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <Card className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800">Источник данных</h2>

          <Tabs value={sourceTab} onValueChange={setSourceTab} className="w-full gap-3">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1.5">
              <TabsTrigger
                value="registry"
                className="gap-2 rounded-xl px-3 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 sm:text-sm"
              >
                <Database className="size-4 shrink-0" aria-hidden />
                Из регистра
              </TabsTrigger>
              <TabsTrigger
                value="file"
                className="gap-2 rounded-xl px-3 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 sm:text-sm"
              >
                <Upload className="size-4 shrink-0" aria-hidden />
                Загрузка файла
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registry" className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Выбрать всех ({patientsData.length})
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Снять выбор
                </button>
                <span className="flex items-center text-sm text-slate-500">
                  Выбрано: <strong className="ml-1 tabular-nums text-slate-800">{selectedIds.size}</strong>
                </span>
              </div>
              <div className="max-h-[min(420px,50vh)] space-y-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/40 p-3">
                {patientsData.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-white/80 px-3 py-2.5 transition-colors hover:border-indigo-100 hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleId(p.id)}
                      className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        {p.id} · {p.diagnosis}, стадия {p.stage}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-4 space-y-4">
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                <FileSpreadsheet className="mx-auto size-10 text-indigo-500" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-slate-800">CSV или XLSX с клиническими признаками</p>
                <p className="mt-1 text-xs text-slate-500">Разделитель полей в CSV — точка с запятой (;)</p>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setFileLabel(f?.name ?? null);
                    }}
                  />
                  Выбрать файл
                </label>
                {fileLabel && (
                  <p className="mt-3 text-sm text-emerald-700 font-medium">
                    <CheckCircle2 className="inline size-4 align-text-bottom" aria-hidden /> {fileLabel}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Download className="size-4" aria-hidden />
                Скачать шаблон CSV
              </button>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="space-y-5">
          <h2 className="text-lg font-bold text-slate-800">Параметры расчёта</h2>
          <div className="space-y-2">
            <label htmlFor="batch-model" className="text-sm font-semibold text-slate-700">
              Версия модели
            </label>
            <select
              id="batch-model"
              value={modelVersion}
              onChange={(e) => setModelVersion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={explainability}
              onChange={(e) => setExplainability(e.target.checked)}
              className="mt-1 rounded border-slate-300 text-indigo-600"
            />
            <span className="text-sm text-slate-700">
              Включить расчёт вкладов признаков (объяснимость) — дольше по времени, больше нагрузка на GPU.
            </span>
          </label>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Очередь адаптера</span>
                <span className="tabular-nums">{Math.min(progress, 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={runBatch}
            disabled={isRunning || (sourceTab === "registry" && selectedIds.size === 0)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition-all",
              isRunning || (sourceTab === "registry" && selectedIds.size === 0)
                ? "cursor-not-allowed bg-slate-400 shadow-none"
                : "bg-indigo-600 shadow-indigo-500/30 hover:bg-indigo-700",
            )}
          >
            <Play className="size-4" aria-hidden />
            {isRunning ? "Выполняется…" : "Запустить пакетный расчёт"}
          </button>

          {results && results.length > 0 && (
            <button
              type="button"
              onClick={downloadResultsCsv}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="size-4" aria-hidden />
              Выгрузить результаты (CSV)
            </button>
          )}
        </Card>
      </div>

      {results && (
        <Card noPadding className="overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-800">Результаты пакетного прогноза</h2>
            <p className="text-sm text-slate-500">
              Обработано записей: {lastJobSize} · модель: {modelVersion}
              {explainability ? " · с объяснимостью" : ""}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-white">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-600">ID</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Пациент</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Риск, %</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Категория</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Статус</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 whitespace-nowrap">Завершено (UTC)</th>
                  <th className="px-6 pr-6 py-3 font-semibold text-slate-600" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r, i) => (
                  <motion.tr
                    key={`${r.id}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-3.5 font-mono text-slate-700">{r.id}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">{r.name}</td>
                    <td className="px-6 py-3.5 tabular-nums font-semibold text-slate-900">{r.riskScore}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-lg px-2 py-0.5 text-xs font-bold uppercase",
                          r.riskLevel === "Высокий"
                            ? "bg-red-50 text-red-700"
                            : r.riskLevel === "Средний"
                              ? "bg-amber-50 text-amber-800"
                              : r.riskLevel === "Низкий"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {r.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {r.status === "готово" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="size-4" aria-hidden /> готово
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <AlertCircle className="size-4" aria-hidden /> ошибка
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {r.finishedAt.replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="px-6 pr-6 py-3.5 text-right">
                      <Link
                        to={`/patients/${r.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-indigo-600 font-semibold hover:bg-indigo-50"
                      >
                        Карточка
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
