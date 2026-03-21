# Changelog

## v1.0.2 — 2026-03-22

### ✨ New Features

- **Site Mode** — Control where the grid appears with three modes:
  - **All Sites** — Grid works on every website (default)
  - **Block List** — Grid works everywhere except listed sites
  - **Allow List** — Grid only works on listed sites
- **Separate Block & Allow Lists** — Each mode maintains its own independent site list
- **Options Page** — Dedicated full-page settings with tabbed navigation (Settings + Allowed Sites)
- **Allowed Sites Button** — Quick access from popup to the options page site management tab
- **Additional Keyboard Shortcuts**:
  - `Alt+D` — Toggle intersection dots
  - `Alt+L` — Switch between solid and dashed lines

### 🔧 Improvements

- **Grid Components Refactor** — Extracted grid overlays into dedicated component files (`StandardGrid`, `FibonacciSpiral`, `GoldenTriangle`, `IntersectionDot`)
- **Shared Settings Hook** — New `useSettings` hook with debounced saves to avoid Chrome storage rate limits
- **Smart Tab Reuse** — "Allowed Sites" button reuses existing options tab instead of opening duplicates
- **Cleaner Build Output** — Banner folder and `.DS_Store` excluded from `dist/`

### 🧹 Cleanup

- Removed dead CSS classes (`.cg-grid-wrapper`, `.site-rules-row`, `.reset-link`)
- Removed unused code from previous iterations

### 📄 Docs & Landing Page

- Updated README with new features, project structure, settings table, and keyboard shortcuts
- Landing page: updated feature cards (Site Control, Keyboard Shortcuts), added Buy Me a Coffee and Privacy links to footer
- Added Edge shortcuts URL alongside Chrome in documentation

---

## v1.0.1 — 2026-03-20

### ✨ New Features

- **Fibonacci Spiral** — New grid overlay with configurable orientation (4 directions)
- **Golden Triangle** — Diagonal composition guide overlay
- **Context Menu** — Right-click any image to toggle grid
- **Keyboard Shortcut** — `Alt+G` to toggle grid
- **Line Style** — Switch between solid and dashed lines (`Alt+L`)
- **Skip Small Images** — Configurable minimum image size threshold

### 🔧 Improvements

- Bilingual support (English & Vietnamese)
- Custom line width and dot size controls
- IntersectionObserver for efficient lazy injection

---

## v1.0.0 — Initial Release

- Rule of Thirds grid overlay
- Golden Ratio grid overlay
- Intersection dots with custom colors
- Works on all websites
- Chrome & Edge support (Manifest V3)
