import { useMemo, useState } from "react";
import { generateCalendar, getHolidayName } from "../utils/dateUtils";
import { isSameDay, isWithinInterval, isToday, isSameMonth } from "date-fns";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({
  currentDate,
  startDate,
  endDate,
  onDateClick,
  isDark,
}) {
  const [hoverDate, setHoverDate] = useState(null);
  const days = generateCalendar(currentDate);

  const selectedRange = useMemo(() => {
    if (!startDate || !endDate) return null;
    return startDate <= endDate
      ? { start: startDate, end: endDate }
      : { start: endDate, end: startDate };
  }, [startDate, endDate]);

  const previewRange = useMemo(() => {
    if (!startDate || endDate || !hoverDate || isSameDay(startDate, hoverDate)) {
      return null;
    }

    return hoverDate < startDate
      ? { start: hoverDate, end: startDate }
      : { start: startDate, end: hoverDate };
  }, [startDate, endDate, hoverDate]);

  const isInSpan = (day, span) =>
    !!span && isWithinInterval(day, { start: span.start, end: span.end });

  /* ── Cell class logic ──────────────────────────────────────────────────── */
  const getCellClasses = (day) => {
    const inCurrMonth = isSameMonth(day, currentDate);

    if (!inCurrMonth) {
      return "opacity-20 pointer-events-none cursor-default";
    }

    const isStart = startDate && isSameDay(day, startDate);
    const isEnd = endDate && isSameDay(day, endDate);
    const isPreviewEnd = !endDate && previewRange?.end && isSameDay(day, previewRange.end);
    const inSelectedRange = isInSpan(day, selectedRange);
    const inPreviewRange = !inSelectedRange && isInSpan(day, previewRange);
    const isRangeStart = isStart;
    const isRangeEnd = isEnd || isPreviewEnd;
    const isHovered = hoverDate && isSameDay(day, hoverDate);

    let classes =
      "relative cursor-pointer select-none group transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97]";

    if (isStart && isEnd) {
      classes +=
        " rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_0_1px_rgba(129,140,248,0.38),0_10px_24px_rgba(79,70,229,0.38)]";
      return classes;
    }

    if (inSelectedRange || inPreviewRange) {
      classes +=
        " range-fill shadow-[0_0_0_1px_rgba(129,140,248,0.14),0_7px_18px_rgba(99,102,241,0.15)]";

      if (inSelectedRange) {
        classes +=
          " bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-200 dark:from-indigo-900/85 dark:via-indigo-800/75 dark:to-indigo-900/85";
      } else {
        classes +=
          " bg-gradient-to-r from-indigo-100/80 via-indigo-50/80 to-indigo-100/80 dark:from-indigo-900/45 dark:via-indigo-800/35 dark:to-indigo-900/45";
      }

      if (isRangeStart) classes += " day-range-start";
      if (isRangeEnd) classes += " day-range-end";
      if (!isRangeStart && !isRangeEnd) classes += " day-in-range";

      return classes;
    }

    if (isHovered) {
      classes +=
        " rounded-full bg-slate-100 dark:bg-slate-700/90 scale-[1.03] shadow-[0_8px_16px_rgba(15,23,42,0.16)]";
      return classes;
    }

    classes +=
      " rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/90 hover:scale-[1.03] hover:shadow-[0_8px_16px_rgba(15,23,42,0.12)]";
    return classes;
  };

  /* ── Number circle classes ─────────────────────────────────────────────── */
  const getNumberClasses = (day) => {
    const isStart = startDate && isSameDay(day, startDate);
    const isEnd = endDate && isSameDay(day, endDate);
    const isPreviewEnd = !endDate && previewRange?.end && isSameDay(day, previewRange.end);
    const today = isToday(day);

    if (isStart || isEnd) {
      return "w-9 h-9 flex items-center justify-center mx-auto rounded-full bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold text-sm shadow-xl scale-[1.08] transition-transform duration-200";
    }

    if (isPreviewEnd) {
      return "w-9 h-9 flex items-center justify-center mx-auto rounded-full bg-indigo-500/90 dark:bg-indigo-400 text-white font-bold text-sm shadow-lg scale-[1.04] transition-transform duration-200";
    }

    if (today) {
      return "w-9 h-9 flex items-center justify-center mx-auto rounded-full ring-2 ring-indigo-500 dark:ring-indigo-400 text-indigo-700 dark:text-indigo-300 font-bold text-sm bg-white/60 dark:bg-slate-700/60";
    }

    return "w-9 h-9 flex items-center justify-center mx-auto rounded-full text-slate-700 dark:text-slate-200 text-sm font-medium transition-all duration-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 group-hover:scale-[1.05]";
  };

  return (
    <div
      className={`rounded-2xl border p-1.5 overflow-hidden ${
        isDark
          ? "bg-slate-800/70 border-slate-700"
          : "bg-white/70 border-stone-200"
      }`}
    >
      <div className="will-change-transform">
        <div className="grid grid-cols-7">
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="py-2.5 text-center text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]"
            >
              {name}
            </div>
          ))}

          {days.map((day, idx) => {
            const holiday = getHolidayName(day);
            const inCurrMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={idx}
                id={`day-${day.toISOString().slice(0, 10)}`}
                onClick={() => inCurrMonth && onDateClick(day)}
                onMouseEnter={() => setHoverDate(inCurrMonth ? day : null)}
                onMouseLeave={() => setHoverDate(null)}
                title={holiday || undefined}
                className={`py-1.5 ${getCellClasses(day)}`}
              >
                <span className={getNumberClasses(day)}>{day.getDate()}</span>

                {holiday && inCurrMonth && (
                  <span
                    className="block w-1.5 h-1.5 bg-rose-500 rounded-full mx-auto mt-0.5"
                    aria-label={holiday}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
