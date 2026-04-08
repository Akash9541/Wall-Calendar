# Interactive Wall Calendar (Frontend Engineering Challenge)

A polished React + Tailwind CSS interactive calendar component designed to replicate a real-world wall calendar experience, with a strong focus on UI/UX, responsiveness, and interaction design.

---

##  Challenge Alignment

###  Core Requirements

**1. Wall Calendar Aesthetic**
- Realistic wall-calendar design with top binding rings
- Integrated hero image and calendar layout
- Layered shadows and subtle page-depth effects to simulate physical paper

**2. Day Range Selector**
- Click once to select start date
- Click again to select end date
- Third click resets selection
- Clear visual states for:
  - Start date
  - End date
  - In-range dates
  - Hover preview

**3. Integrated Notes Section**
- Notes can be attached to a single date or a date range
- Manual save + auto-save on blur
- Editable and deletable notes
- Persistent storage using `localStorage`

**4. Fully Responsive Design**
- Desktop: side-by-side layout (image + calendar + notes)
- Mobile: stacked layout with full interaction support

---

##  Creative Enhancements

- Smooth month transition animation (slide + fade + subtle 3D effect)
- Theme toggle (light/dark mode) with persistence
- Holiday indicators with tooltips
- Monday-first calendar layout
- “Today” quick navigation
- Micro-interactions and animation for improved UX

---
## Tech Stack

- React 19 (CRA)
- Tailwind CSS v3
- date-fns v4
- localStorage

## Run Locally

```bash
npm install
npm start
```

Open [http://localhost:3000].

### Production Build

```bash
npm run build
```

### Tests

```bash
CI=true npm test -- --watchAll=false
```

## Project Structure

```text
src/
├── components/
│   ├── Calendar.jsx
│   ├── CalendarGrid.jsx
│   ├── HeroImage.jsx
│   ├── NotesPanel.jsx
│   └── ThemeToggle.jsx
├── utils/
│   └── dateUtils.jsx
├── App.js
├── App.test.js
└── index.css
```
