import type { PatientRecord } from "../../data/mock";
import { RefInterpretationGuide } from "../content/referenceContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { BookOpen, Stethoscope, Building2, UserRound, Library } from "lucide-react";

const triggerClass =
  "rounded-xl px-3 py-3.5 text-left text-base font-semibold text-slate-800 hover:no-underline [&[data-state=open]]:bg-indigo-50/60";

const innerTriggerClass =
  "py-3 pl-1 text-sm font-medium text-slate-700 hover:no-underline [&[data-state=open]]:text-indigo-800";

type Props = { patient: PatientRecord };

function NestedBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-600">
      <h4 className="mb-2 font-semibold text-slate-800">{title}</h4>
      {children}
    </div>
  );
}

export function PatientRecommendationsAccordion({ patient }: Props) {
  return (
    <section className="space-y-4" aria-labelledby="rec-heading">
      <div>
        <h2 id="rec-heading" className="text-xl font-bold text-slate-800">
          Персонализированные рекомендации
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Выберите аудиторию — внутри: клинический прогноз, руководства по интерпретации и план наблюдения.
          Несколько блоков можно раскрыть одновременно.
        </p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["doctors"]}
        className="rounded-[28px] border border-white/70 bg-white/50 shadow-sm backdrop-blur-md"
      >
        {/* Врачи */}
        <AccordionItem value="doctors" className="border-b border-slate-100 px-2 sm:px-4">
          <AccordionTrigger className={triggerClass}>
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Stethoscope className="size-4" aria-hidden />
              </span>
              Врачи
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-4 sm:px-4">
            <Accordion type="single" collapsible className="space-y-1 border-l-2 border-indigo-200/80 pl-4">
              <AccordionItem value="d-prognosis">
                <AccordionTrigger className={innerTriggerClass}>
                  Клинический прогноз и стратификация риска
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Сводка по пациенту">
                    <ul className="list-disc space-y-1 pl-4">
                      <li>
                        Возраст: <strong>{patient.age}</strong> лет
                      </li>
                      <li>
                        Стадия: <strong>{patient.stage}</strong>
                      </li>
                      <li>
                        Категория риска:{" "}
                        <strong className="uppercase tracking-wide">{patient.riskLevel}</strong> (
                        {patient.riskScore}%)
                      </li>
                      <li>Признаков учтено в демо-режиме: 14 (в продукте — до 36+)</li>
                    </ul>
                    <p className="mt-3 text-slate-600">
                      Стратификация согласуется с порогами: низкий (&lt;40%), средний (40–70%), высокий (≥70%) —
                      как в эталонном руководстве; при необходимости пороги калибруются локально.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="d-guide">
                <AccordionTrigger className={innerTriggerClass}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0 text-indigo-500" aria-hidden />
                    Руководство по интерпретации клинического прогноза
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-[min(70vh,520px)] overflow-y-auto pr-1">
                    <RefInterpretationGuide />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="d-plan">
                <AccordionTrigger className={innerTriggerClass}>
                  Детальный план наблюдения
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Предложения по мониторингу">
                    <ul className="list-disc space-y-2 pl-4">
                      <li>
                        Учитывая профиль риска, рассмотреть сокращение интервала контрольных визуализаций (ПЭТ-КТ
                        / КТ) согласно локальному протоколу.
                      </li>
                      <li>Контроль онкомаркеров и ОАК — по графику лечащего врача; при росте — внеплановый визит.</li>
                      <li>Согласовать с пациентом понятные триггеры обращения (лихорадка, боль, кровотечение).</li>
                    </ul>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="d-plan-guide">
                <AccordionTrigger className={innerTriggerClass}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0 text-indigo-500" aria-hidden />
                    Руководство по интерпретации плана наблюдения
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Как читать план">
                    <p>
                      Интервалы указаны ориентировочно и должны быть согласованы с клиническими рекомендациями
                      МЗ РФ, возможностями МО и сопутствующей патологией. Изменение тактики не является
                      автоматическим назначением — финальное решение за врачом.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>

        {/* Администраторы */}
        <AccordionItem value="admins" className="border-b border-slate-100 px-2 sm:px-4">
          <AccordionTrigger className={triggerClass}>
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Building2 className="size-4" aria-hidden />
              </span>
              Администраторы
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-4 sm:px-4">
            <Accordion type="single" collapsible className="space-y-1 border-l-2 border-violet-200/80 pl-4">
              <AccordionItem value="a-prognosis">
                <AccordionTrigger className={innerTriggerClass}>
                  Клинический прогноз и стратификация риска
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Операционные метрики">
                    <ul className="list-disc space-y-1 pl-4">
                      <li>
                        Категория риска для МО: <strong>{patient.riskLevel.toUpperCase()}</strong>
                      </li>
                      <li>Вероятность рецидива (модель): {patient.riskScore}%</li>
                      <li>
                        Коррекция стандартного протокола:{" "}
                        <strong>{patient.riskLevel === "Высокий" ? "рекомендуется обсуждение" : "не требуется"}</strong>
                      </li>
                    </ul>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="a-guide">
                <AccordionTrigger className={innerTriggerClass}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0 text-violet-500" aria-hidden />
                    Руководство по интерпретации клинического прогноза
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Для планирования ресурсов">
                    <p className="mb-3">
                      Высокая доля пациентов с риском выше порога увеличивает нагрузку на диагностику и
                      консилиумы. Используйте агрегированную аналитику по отделению для баланса потоков.
                    </p>
                    <ul className="list-disc space-y-2 pl-4">
                      <li>Организационные мероприятия и маршрутизация.</li>
                      <li>Ресурсное планирование (коечный фонд, аппараты).</li>
                      <li>Связка с КСГ и KPI качества помощи.</li>
                    </ul>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="a-plan">
                <AccordionTrigger className={innerTriggerClass}>
                  Детальный план наблюдения
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="На уровне МО">
                    <p>
                      Заложите резерв слотов на внеплановые визиты для группы повышенного риска. Синхронизируйте
                      графики с поликлиникой первичного звена и диспансерным учётом.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="a-plan-guide">
                <AccordionTrigger className={innerTriggerClass}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0 text-violet-500" aria-hidden />
                    Руководство по интерпретации плана наблюдения
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Административная интерпретация">
                    <p>
                      План наблюдения отражает клиническую логику модели и не заменяет приказы и стандарты МО.
                      При расхождении приоритет у локальных клинических протоколов.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>

        {/* Пациенты */}
        <AccordionItem value="patients" className="border-b border-slate-100 px-2 sm:px-4">
          <AccordionTrigger className={triggerClass}>
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <UserRound className="size-4" aria-hidden />
              </span>
              Пациенты
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-4 sm:px-4">
            <Accordion type="single" collapsible className="space-y-1 border-l-2 border-sky-200/80 pl-4">
              <AccordionItem value="p-prognosis">
                <AccordionTrigger className={innerTriggerClass}>Ваше состояние простыми словами</AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Что показывает система">
                    <p>
                      Врач оценил ваши данные с помощью программы-помощника. Указанный уровень риска помогает
                      планировать обследования и лечение — он <strong>не является приговором</strong> и всегда
                      обсуждается с лечащим врачом.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="p-guide">
                <AccordionTrigger className={innerTriggerClass}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0 text-sky-500" aria-hidden />
                    Как читать прогноз
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Пояснение">
                    <p>
                      «Риск» здесь означает статистическую оценку похожих клинических ситуаций, а не точное
                      предсказание для вас лично. Чем ниже процент в категории «низкий», тем спокойнее обычно
                      план наблюдения — но только врач принимает решения.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="p-plan">
                <AccordionTrigger className={innerTriggerClass}>Что делать дальше</AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Рекомендации для вас">
                    <ul className="list-disc space-y-2 pl-4">
                      <li>Соблюдайте режим питания и назначения, которые дал врач.</li>
                      <li>Не пропускайте запланированные анализы и визиты.</li>
                      <li>При ухудшении самочувствия обращайтесь в клинику без ожидания следующего визита.</li>
                    </ul>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="p-plan-guide">
                <AccordionTrigger className={innerTriggerClass}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0 text-sky-500" aria-hidden />
                    О графике наблюдения
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Зачем нужны повторные визиты">
                    <p>
                      Регулярный контроль позволяет заметить изменения на ранней стадии. Сроки между визитами
                      подбирает врач; система лишь подсказывает интенсивность мониторинга.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>

        {/* Источники */}
        <AccordionItem value="sources" className="px-2 sm:px-4">
          <AccordionTrigger className={triggerClass}>
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-slate-200/80 text-slate-700">
                <Library className="size-4" aria-hidden />
              </span>
              Источники
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-4 sm:px-4">
            <Accordion type="single" collapsible className="space-y-1 border-l-2 border-slate-200 pl-4">
              <AccordionItem value="s-prognosis">
                <AccordionTrigger className={innerTriggerClass}>Модель и версия</AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Технические сведения">
                    <ul className="list-disc space-y-1 pl-4">
                      <li>Продукт: Онко Ассистент, модуль прогноза риска рецидива.</li>
                      <li>Версия модели (демо): v4.2, дата среза: 15.03.2026.</li>
                      <li>Разработка и методология: НМИЦ онкологии им. Н.Н. Блохина (пример привязки).</li>
                    </ul>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="s-guide">
                <AccordionTrigger className={innerTriggerClass}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0 text-slate-600" aria-hidden />
                    Литература и методические материалы
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Библиография (пример)">
                    <p className="text-xs text-slate-500">
                      В продуктивной среде здесь указываются DOI клинических рекомендаций МЗ РФ, публикации по
                      валидации модели и внутренние регламенты МО. В демо-интерфейсе список сокращён.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="s-plan">
                <AccordionTrigger className={innerTriggerClass}>Источники данных пациента</AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Интеграции">
                    <ul className="list-disc space-y-1 pl-4">
                      <li>МИС МО — первичная ЭМК.</li>
                      <li>РЭМД — СЭМД лабораторных и инструментальных исследований.</li>
                      <li>ВИМИС Онкология — учёт и обмен в рамках федерального контура (при подключении).</li>
                    </ul>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="s-plan-guide">
                <AccordionTrigger className={innerTriggerClass}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0 text-slate-600" aria-hidden />
                    Актуальность отчёта
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <NestedBlock title="Метаданные">
                    <p>
                      Отчёт сформирован на основе данных, доступных на момент последней синхронизации с МИС.
                      При подгрузке новых СЭМД показатели могут измениться — выполните пересчёт прогноза.
                    </p>
                  </NestedBlock>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
