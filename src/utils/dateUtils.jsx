import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
} from "date-fns";

/* ─── Calendar grid generator (week starts Monday — Indian standard) ────── */
export const generateCalendar = (currentDate) => {
  const startMonth = startOfMonth(currentDate);
  const endMonth = endOfMonth(currentDate);

  // weekStartsOn: 1 = Monday (Indian / ISO standard)
  const startDate = startOfWeek(startMonth, { weekStartsOn: 1 });
  const endDate = endOfWeek(endMonth, { weekStartsOn: 1 });

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }
  return days;
};

export const formatDate = (date) => format(date, "yyyy-MM-dd");

/* ─── Fixed-date Indian public holidays (MM-DD) ─────────────────────────── */
const FIXED_HOLIDAYS = {
  "01-14": "Makar Sankranti / Pongal",
  "01-26": "Republic Day 🇮🇳",
  "04-14": "Dr. Ambedkar Jayanti",
  "05-01": "Labour Day / Maharashtra Day",
  "08-15": "Independence Day 🇮🇳",
  "10-02": "Gandhi Jayanti",
  "12-25": "Christmas Day",
};

/* ─── Floating Indian holidays for 2025 & 2026 (yyyy-MM-dd) ────────────── */
const FLOATING_HOLIDAYS = {
  // 2025
  "2025-02-26": "Maha Shivaratri",
  "2025-03-14": "Holi 🎨",
  "2025-03-31": "Eid-ul-Fitr 🌙",
  "2025-04-06": "Ram Navami",
  "2025-04-10": "Mahavir Jayanti",
  "2025-04-18": "Good Friday",
  "2025-05-12": "Buddha Purnima",
  "2025-06-07": "Eid-ul-Adha 🌙",
  "2025-08-16": "Janmashtami",
  "2025-10-20": "Dussehra",
  "2025-11-01": "Diwali 🪔",
  "2025-11-05": "Bhai Dooj",
  "2025-11-24": "Guru Nanak Jayanti",

  // 2026
  "2026-02-15": "Maha Shivaratri",
  "2026-03-19": "Holi 🎨",
  "2026-03-20": "Eid-ul-Fitr 🌙",
  "2026-04-02": "Ram Navami",
  "2026-04-03": "Good Friday",
  "2026-05-02": "Buddha Purnima",
  "2026-06-16": "Eid-ul-Adha 🌙",
  "2026-09-03": "Janmashtami",
  "2026-10-09": "Dussehra",
  "2026-11-14": "Diwali 🪔",
  "2026-11-03": "Guru Nanak Jayanti",
};

/**
 * Returns the Indian holiday name for a given date, or null.
 * @param {Date} date
 * @returns {string|null}
 */
export const getHolidayName = (date) => {
  const mmdd = format(date, "MM-dd");
  const yyyymmdd = format(date, "yyyy-MM-dd");
  return FIXED_HOLIDAYS[mmdd] || FLOATING_HOLIDAYS[yyyymmdd] || null;
};