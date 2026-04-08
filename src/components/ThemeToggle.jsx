/**
 * Sun / Moon toggle for light ↔ dark mode.
 */
export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      id="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
        transition-all duration-300 hover:scale-105 active:scale-95
        ${
          isDark
            ? "bg-slate-700 text-yellow-300 hover:bg-slate-600 border border-slate-600"
            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
        }
      `}
    >
      <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
