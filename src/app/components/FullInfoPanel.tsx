import { useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

type FullInfoPanelProps = {
  children: React.ReactNode;
  className?: string;
  /** Текст/блок слева от кнопки; корень панели тогда на всю ширину родителя, контент раскрывается на всю ширину */
  summary?: ReactNode;
  /** Выравнивание кнопки, если нет summary */
  align?: "start" | "end" | "stretch";
};

/** Кнопка «Полная информация» и раскрываемый блок — в стиле текущего UI */
export function FullInfoPanel({
  children,
  className,
  summary,
  align = "start",
}: FullInfoPanelProps) {
  const id = useId();

  const trigger = (
    <CollapsibleTrigger asChild>
      <button
        type="button"
        id={`${id}-trigger`}
        className="group inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100 hover:text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 data-[state=open]:border-indigo-200 data-[state=open]:bg-white"
      >
        <span className="group-data-[state=open]:hidden">Полная информация</span>
        <span className="hidden group-data-[state=open]:inline">Скрыть</span>
        <ChevronDown
          className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </button>
    </CollapsibleTrigger>
  );

  return (
    <Collapsible className={cn("w-full min-w-0", className)}>
      {summary != null ? (
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">{summary}</div>
          <div className="shrink-0 self-start sm:pt-0.5">{trigger}</div>
        </div>
      ) : (
        <div
          className={cn(
            "flex w-full min-w-0",
            align === "end" && "justify-end",
            align === "start" && "justify-start",
            align === "stretch" && "w-full [&_button]:w-full [&_button]:justify-center"
          )}
        >
          {trigger}
        </div>
      )}

      <CollapsibleContent className="w-full min-w-0 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div
          role="region"
          aria-labelledby={`${id}-trigger`}
          className="mt-3 w-full min-w-0 max-w-none rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-600 backdrop-blur-sm sm:p-5 [&_p]:break-words [&_ul]:break-words"
        >
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
