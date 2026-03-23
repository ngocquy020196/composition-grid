# Changelog

## v1.0.4 — 2026-03-23

### ✨ New Features

- **Quick Color Toggle** — Instantly swap grid color between two presets with `Alt+C`
  - Customizable color pair — pick any two colors in the popup (default: white ↔ black)
  - Toggles both line color and dot color simultaneously

### 🐛 Bug Fixes

- **Grid injection on lazy-loaded sites** — Fixed images not getting grids on sites like 35awards.com that swap `src` from placeholder to real URL via JavaScript
- **Background-image photo support** — Fixed grid not appearing on lightbox images that use `src="spacer.gif"` + CSS `background-image` for the real photo
- **Spacer image context menu** — Right-click now correctly finds the real image even when a spacer overlay intercepts the click
- **Duplicate grid prevention** — Skip injection if the parent already has a grid overlay (e.g. lightbox with multiple `<img>` tags)
- **Object-fit aware overlay** — Grid now correctly matches the visible photo area when images use `object-fit: contain/cover/scale-down`
- **Stacking context isolation** — Grid overlays no longer escape above modal/lightbox backdrops using `isolation: isolate`

### 🔧 Improvements

- **Better Color Swatch Visibility** — Increased border contrast on color pickers so dark colors are visible in dark mode
- Added `--swatch-border` CSS variable for consistent swatch styling across themes
- **MutationObserver watches `src` attribute** — Detects lazy-loaded images that swap their `src` dynamically
- **Deferred injection** — `tryInjectOrDefer` waits for image `load` event when `shouldInject` fails due to incomplete loading
- **Dimension guard** — `syncOverlayPosition` skips updates when image dimensions are zero
- **Merged `getComputedStyle` calls** — Single call per `shouldInject` check instead of two
- **ResizeObserver** — Grid overlay stays aligned when images resize (e.g. window resize in modals)

---

## v1.0.3 — 2026-03-22

### ✨ New Features

- **Dark / Light Theme** — Switch between dark and light interface for popup & options page
  - New segmented control in the popup to toggle theme
  - Theme preference saved to Chrome Storage and persists across sessions

### 🔧 Improvements

- Refactored CSS variables to support both themes — extracted hardcoded `rgba()` values into reusable custom properties
- Fixed toggle switch text readability on active state in light theme

---

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
- **Dynamic Context Menu** — Right-click menu automatically hides on blocked/disabled sites

### 🔧 Improvements

- **Grid Components Refactor** — Extracted grid overlays into dedicated component files (`StandardGrid`, `FibonacciSpiral`, `GoldenTriangle`, `IntersectionDot`)
- **Shared Settings Hook** — New `useSettings` hook with debounced saves to avoid Chrome storage rate limits
- **Smart Tab Reuse** — "Allowed Sites" button reuses existing options tab instead of opening duplicates
- **Cleaner Build Output** — Banner folder and `.DS_Store` excluded from `dist/`
- **Minimal Permissions** — Removed `activeTab` and `scripting` permissions; only requires `storage`, `contextMenus`, and `tabs`

### 🧹 Cleanup

- Removed `alert()` on blocked sites — replaced with hidden context menu
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
