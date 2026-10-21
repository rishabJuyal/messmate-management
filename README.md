# Mess Manager — React Demo

A frontend-only mess management demo built with React + Vite. All changes are saved in the browser's `localStorage`; no backend or account is required.

## Run locally

Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). To create a production build:

```bash
npm run build
npm run preview
```

## Included features

- Daily attendance marking for active students, with re-marking and clear-by-clicking-again.
- Record, edit and delete full or partial payments with date, billing month, method and note.
- Add, edit and delete students; activate/deactivate via the student form.
- Absence streak display for the last consecutive absent days.
- Responsive layout and seeded sample data.

## Demo business rules

- Monthly fee: ₹2,800.
- Deleting a student also removes their attendance and payment records.

## Important limitations

- This is a demo, not production-ready accounting software. Data is stored only in the current browser/device and can be lost if site data is cleared.
- No authentication, role permissions, server sync, backups, or multi-device access.
# messmate-management
