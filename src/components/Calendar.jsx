import { useState, useEffect, useCallback, useRef } from "react";
import { format, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import CalendarGrid from "./CalendarGrid";
import NotesPanel from "./NotesPanel";
import HeroImage from "./HeroImage";
import ThemeToggle from "./ThemeToggle";

const OUT_MS = 220;
const IN_MS = 260;

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState({});
  const [isDark, setIsDark] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState(""); // '' | 'out' | 'in'
  const [notesHydrated, setNotesHydrated] = useState(false);

  const navTimersRef = useRef([]);

  const clearNavTimers = useCallback(() => {
    navTimersRef.current.forEach((timer) => clearTimeout(timer));
    navTimersRef.current = [];
  }, []);

  /* ── Persist notes & theme ─────────────────────────────────────────────── */
  useEffect(() => {
    const storedNotes = localStorage.getItem("calendar_notes");
    if (storedNotes) {
      try {
        setNotes(JSON.parse(storedNotes));
      } catch (_) {}
    }

    const storedTheme = localStorage.getItem("calendar_theme");
    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    // Mark hydration complete only after initial reads are queued.
    setNotesHydrated(true);
  }, []);

  useEffect(() => {
    // Prevent startup race that can overwrite stored notes with {} on refresh.
    if (!notesHydrated) return;
    localStorage.setItem("calendar_notes", JSON.stringify(notes));
  }, [notes, notesHydrated]);

  useEffect(() => () => clearNavTimers(), [clearNavTimers]);

  /* ── Theme toggle ──────────────────────────────────────────────────────── */
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("calendar_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("calendar_theme", "light");
      }
      return next;
    });
  }, []);

  /* ── Month navigation with vertical page movement ─────────────────────── */
  const animateMonthChange = useCallback(
    (computeNextDate) => {
      if (transitionPhase !== "") return;

      clearNavTimers();
      setTransitionPhase("out");

      const outTimer = setTimeout(() => {
        setCurrentDate((prev) => computeNextDate(prev));
        setTransitionPhase("in");

        const inTimer = setTimeout(() => {
          setTransitionPhase("");
        }, IN_MS);

        navTimersRef.current.push(inTimer);
      }, OUT_MS);

      navTimersRef.current.push(outTimer);
    },
    [clearNavTimers, transitionPhase]
  );

  const navigateMonth = useCallback(
    (direction) => {
      animateMonthChange((prev) =>
        direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
      );
    },
    [animateMonthChange]
  );

  /* ── Jump to today ─────────────────────────────────────────────────────── */
  const goToToday = useCallback(() => {
    const today = new Date();

    if (!isSameMonth(today, currentDate)) {
      animateMonthChange(() => today);
    }

    setStartDate(today);
    setEndDate(null);
  }, [animateMonthChange, currentDate]);

  /* ── Date click — range selection logic ────────────────────────────────── */
  const handleDateClick = useCallback(
    (date) => {
      if (!startDate) {
        setStartDate(date);
      } else if (!endDate) {
        if (isSameDay(date, startDate)) {
          setStartDate(null);
        } else if (date < startDate) {
          setEndDate(startDate);
          setStartDate(date);
        } else {
          setEndDate(date);
        }
      } else {
        setStartDate(date);
        setEndDate(null);
      }
    },
    [startDate, endDate]
  );

  /* ── Selection summary label ───────────────────────────────────────────── */
  const selectionLabel = (() => {
    if (startDate && endDate) {
      const days =
        Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")} · ${days} day${days > 1 ? "s" : ""}`;
    }
    if (startDate) return format(startDate, "EEEE, MMMM d, yyyy");
    return null;
  })();

  const navDisabled = transitionPhase !== "";
  const today = new Date();
  const isViewingCurrentMonth = isSameMonth(today, currentDate);
  const isTodaySelected =
    !!startDate && !endDate && isSameDay(startDate, today);

  /* ── Reusable button classes ───────────────────────────────────────────── */
  const navBtnCls = `
    w-10 h-10 flex items-center justify-center rounded-2xl font-semibold text-lg
    transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]
    hover:-translate-y-0.5 hover:scale-[1.05] active:scale-95
    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
    ${
      isDark
        ? "bg-slate-700/90 hover:bg-slate-600 text-slate-100 border border-slate-600 shadow-sm hover:shadow-lg hover:shadow-slate-950/35"
        : "bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-300/75"
    }
  `;

  return (
    <div
      className={`min-h-screen calendar-paper-noise transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
          : "bg-gradient-to-br from-stone-100 via-amber-50 to-slate-200"
      }`}
    >
      <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-start justify-center">
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📅</span>
              <span
                className={`font-extrabold tracking-tight text-lg md:text-xl ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                Wall Calendar
              </span>
            </div>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>

          <div className="relative pt-6 md:pt-7">
            {/* Stacked page depth */}
            <div
              className={`absolute inset-x-3 top-5 bottom-0 rounded-[30px] -z-20 ${
                isDark
                  ? "bg-slate-900/80 shadow-[0_28px_55px_rgba(2,6,23,0.6)]"
                  : "bg-stone-200/70 shadow-[0_24px_45px_rgba(71,85,105,0.24)]"
              }`}
            />
            <div
              className={`absolute inset-x-5 top-3 bottom-1 rounded-[30px] -z-10 ${
                isDark
                  ? "bg-slate-800/80 shadow-[0_16px_35px_rgba(2,6,23,0.45)]"
                  : "bg-stone-100/90 shadow-[0_12px_25px_rgba(100,116,139,0.2)]"
              }`}
            />

            <div className="relative rounded-[30px] rotate-[0.18deg] wall-mounted-calendar">
              {/* Binding spine */}
              <div
                className={`absolute left-6 right-6 -top-3 h-7 rounded-full z-30 border ${
                  isDark
                    ? "bg-slate-700/95 border-slate-600"
                    : "bg-stone-200 border-stone-300"
                }`}
              />
              <div className="absolute left-8 right-8 -top-[22px] z-40 flex items-center justify-between px-1.5 pointer-events-none">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-4 rounded-b-full border shadow-sm ${
                      isDark
                        ? "bg-slate-500 border-slate-400"
                        : "bg-slate-300 border-slate-400"
                    }`}
                  />
                ))}
              </div>

              <div
                className={`rounded-[30px] overflow-hidden border shadow-[0_30px_60px_rgba(2,6,23,0.28)] transition-shadow duration-300 hover:shadow-[0_34px_68px_rgba(2,6,23,0.33)] ${
                  isDark
                    ? "bg-slate-800/95 border-slate-700"
                    : "bg-[#f8f6f1] border-stone-200"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-[2.1fr_2.9fr]">
                  {/* Left: Image page */}
                  <div className="relative h-64 md:h-auto md:min-h-[560px] z-10">
                    <HeroImage
                      currentDate={currentDate}
                      isDark={isDark}
                      transitionPhase={transitionPhase}
                    />

                    <div
                      className={`absolute inset-x-0 bottom-0 h-24 md:hidden pointer-events-none ${
                        isDark
                          ? "bg-gradient-to-b from-transparent via-slate-800/45 to-slate-800"
                          : "bg-gradient-to-b from-transparent via-[#f8f6f1]/75 to-[#f8f6f1]"
                      }`}
                    />
                    {/* Desktop seam overlay removed for cleaner image-to-calendar edge */}
                  </div>

                  {/* Right: Calendar page */}
                  <div
                    className={`relative z-20 p-4 md:p-6 lg:p-7 flex flex-col gap-4 rounded-2xl md:rounded-none md:rounded-r-[30px] border md:border-l md:border-y-0 md:border-r-0 shadow-inner md:shadow-none ${
                      isDark
                        ? "bg-slate-800/92 border-slate-700/80 md:bg-transparent md:border-l-slate-700/70"
                        : "bg-[#f8f6f1] border-stone-200 md:bg-transparent md:border-l-stone-200/90"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        id="prev-month-btn"
                        onClick={() => navigateMonth("prev")}
                        className={navBtnCls}
                        aria-label="Previous month"
                        disabled={navDisabled}
                      >
                        ‹
                      </button>

                      <div className="text-center flex-1 min-w-0 px-1">
                        <h2
                          className={`text-2xl md:text-[1.7rem] font-extrabold tracking-tight truncate ${
                            isDark ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          {format(currentDate, "MMMM yyyy")}
                        </h2>
                        {selectionLabel && (
                          <p
                            className={`text-xs md:text-sm mt-0.5 truncate font-medium ${
                              isDark ? "text-indigo-300" : "text-indigo-700"
                            }`}
                          >
                            {selectionLabel}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id="today-btn"
                          onClick={goToToday}
                          disabled={navDisabled}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 disabled:opacity-65 disabled:cursor-not-allowed disabled:transform-none ${
                            isDark
                              ? isTodaySelected || isViewingCurrentMonth
                                ? "bg-indigo-700 text-indigo-100 border-indigo-500"
                                : "bg-indigo-900/70 text-indigo-200 border-indigo-700 hover:bg-indigo-900"
                              : isTodaySelected || isViewingCurrentMonth
                              ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                              : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          }`}
                        >
                          Today
                        </button>

                        <button
                          id="next-month-btn"
                          onClick={() => navigateMonth("next")}
                          className={navBtnCls}
                          aria-label="Next month"
                          disabled={navDisabled}
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    <CalendarGrid
                      currentDate={currentDate}
                      startDate={startDate}
                      endDate={endDate}
                      onDateClick={handleDateClick}
                      isDark={isDark}
                      transitionPhase={transitionPhase}
                    />

                    <div
                      className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                        Start / End
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-200 dark:from-indigo-900/80 dark:via-indigo-800/70 dark:to-indigo-900/80 inline-block border border-indigo-200/70 dark:border-indigo-700/70" />
                        In Range
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full ring-2 ring-indigo-500 inline-block" />
                        Today
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        Holiday
                      </span>
                    </div>

                    <NotesPanel
                      startDate={startDate}
                      endDate={endDate}
                      notes={notes}
                      setNotes={setNotes}
                      isDark={isDark}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
