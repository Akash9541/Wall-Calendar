import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";

const MAX_CHARS = 500;

export default function NotesPanel({ startDate, endDate, notes, setNotes, isDark }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  /* ── Build key for selected date / range ──────────────────────────────── */
  const key =
    startDate && endDate
      ? `${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}`
      : startDate
      ? format(startDate, "yyyy-MM-dd")
      : null;

  /* ── Load note when selection changes ──────────────────────────────────── */
  useEffect(() => {
    setText(key && notes[key] ? notes[key] : "");
    setSaved(false);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Immediate write-through persistence while typing ─────────────────── */
  const persistNoteText = (noteKey, nextValue) => {
    if (!noteKey) return;

    setNotes((prev) => {
      const current = prev[noteKey] || "";
      if (current === nextValue) return prev;

      const next = { ...prev };
      if (nextValue.trim()) {
        next[noteKey] = nextValue;
      } else {
        delete next[noteKey];
      }

      // Write-through localStorage so refresh right after typing is still safe.
      localStorage.setItem("calendar_notes", JSON.stringify(next));
      return next;
    });
  };

  /* ── Auto-save on blur ─────────────────────────────────────────────────── */
  const saveNote = () => {
    if (!key || !text.trim()) return;
    setNotes((prev) => ({ ...prev, [key]: text }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ── Delete a note ─────────────────────────────────────────────────────── */
  const deleteNote = (noteKey) => {
    setNotes((prev) => {
      const next = { ...prev };
      delete next[noteKey];
      return next;
    });

    if (noteKey === key) setText("");
  };

  /* ── Human-readable date labels ────────────────────────────────────────── */
  const keyLabel = (k) => {
    if (k.includes("_")) {
      const [s, e] = k.split("_");
      return `${format(new Date(s + "T12:00:00"), "MMM d")} → ${format(
        new Date(e + "T12:00:00"),
        "MMM d"
      )}`;
    }

    return format(new Date(k + "T12:00:00"), "MMM d, yyyy");
  };

  const allNoteKeys = Object.keys(notes).filter((k) => notes[k]?.trim());
  const charCount = text.length;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 shadow-inner ${
        isDark
          ? "bg-gradient-to-b from-slate-800/85 to-slate-800/65 border-slate-700"
          : "bg-gradient-to-b from-[#fbfaf6] to-[#f5f2eb] border-stone-200"
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 pt-4 pb-2 border-b ${
          isDark ? "border-slate-700/80" : "border-stone-200/80"
        }`}
      >
        <h3
          className={`font-bold text-base md:text-lg tracking-tight flex items-center gap-2 ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          <span>📝</span>
          <span>Notes</span>
          {key && (
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                isDark
                  ? "bg-indigo-900/60 text-indigo-300 border-indigo-800"
                  : "bg-indigo-100/80 text-indigo-700 border-indigo-200"
              }`}
            >
              {keyLabel(key)}
            </span>
          )}
        </h3>

        {saved && (
          <span className="text-xs text-emerald-500 font-semibold tracking-wide animate-pulse">
            Saved
          </span>
        )}
      </div>

      <div className="px-4 pt-3 pb-2">
        {key ? (
          <>
            <textarea
              id="notes-textarea"
              ref={textareaRef}
              className={`w-full p-3.5 text-sm rounded-xl border resize-none transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                ${
                  isDark
                    ? "bg-slate-700/90 border-slate-600 text-slate-100 placeholder-slate-500"
                    : "bg-white/90 border-stone-200 text-slate-800 placeholder-slate-400"
                }
              `}
              rows={4}
              maxLength={MAX_CHARS}
              placeholder={`Add notes for ${keyLabel(key)}...`}
              value={text}
              onChange={(e) => {
                const nextValue = e.target.value;
                setText(nextValue);
                persistNoteText(key, nextValue);
                setSaved(false);
              }}
              onBlur={saveNote}
            />

            <div className="flex items-center justify-between mt-2.5">
              <span
                className={`text-xs font-medium ${
                  charCount > MAX_CHARS * 0.9
                    ? "text-rose-500"
                    : isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {charCount} / {MAX_CHARS}
              </span>

              <button
                id="save-note-btn"
                onClick={saveNote}
                disabled={!text.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]
                  hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                  ${
                    isDark
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-[0_10px_20px_rgba(30,41,59,0.3)]"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 shadow-[0_10px_18px_rgba(99,102,241,0.25)]"
                  }
                `}
              >
                Save Note
              </button>
            </div>
          </>
        ) : (
          <p
            className={`text-sm py-4 text-center font-medium ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Select a date to add notes
          </p>
        )}
      </div>

      {allNoteKeys.length > 0 && (
        <div className="px-4 pb-4 mt-1">
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.16em] mb-2 ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Saved Notes ({allNoteKeys.length})
          </p>

          <div className="notes-scroll max-h-40 overflow-y-auto space-y-2 pr-1">
            {allNoteKeys.map((k) => (
              <div
                key={k}
                onClick={() => {
                  /* preserved behavior */
                }}
                className={`flex items-start justify-between gap-2 p-2.5 rounded-xl text-xs border transition-all duration-200 ${
                  k === key
                    ? isDark
                      ? "bg-indigo-900/45 border-indigo-700"
                      : "bg-indigo-50 border-indigo-200"
                    : isDark
                    ? "bg-slate-700/50 border-slate-700 hover:bg-slate-700/70"
                    : "bg-white/80 border-stone-200 hover:bg-white"
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`font-semibold mb-0.5 ${
                      isDark ? "text-indigo-300" : "text-indigo-700"
                    }`}
                  >
                    {keyLabel(k)}
                  </p>
                  <p
                    className={`truncate ${
                      isDark ? "text-slate-300/80" : "text-slate-500"
                    }`}
                  >
                    {notes[k]}
                  </p>
                </div>

                <button
                  id={`delete-note-${k}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(k);
                  }}
                  className={`shrink-0 p-1 rounded-lg transition-colors ${
                    isDark
                      ? "text-slate-500 hover:bg-rose-900/40 hover:text-rose-300"
                      : "text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                  }`}
                  aria-label="Delete note"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
