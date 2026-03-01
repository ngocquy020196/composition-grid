<p align="center">
  <img src="public/icons/icon128.png" alt="Composition Grid Logo" width="96" height="96" />
</p>

<h1 align="center">Composition Grid</h1>

<p align="center">
  <strong>Rule of Thirds & Golden Ratio overlay for any image on the web</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/version-1.0.0-green" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="License" />
  <img src="https://img.shields.io/badge/lang-EN%20%7C%20VI-blueviolet" alt="Languages" />
</p>

---

A lightweight Chrome extension that overlays **Rule of Thirds** and **Golden Ratio** composition grids directly onto images on any website. Perfect for photographers, designers, and visual artists who want to analyze compositional balance without leaving the browser.

## ✨ Features

- 📐 **Two Grid Types** — Rule of Thirds (1/3) and Golden Ratio (φ)
- 🔴 **Intersection Dots** — Highlight power points with toggleable dots
- 🎨 **Custom Colors** — Pick any color for grid lines and dots
- 🌐 **Works Everywhere** — Activates on all websites automatically
- 🌍 **Bilingual** — English & Vietnamese (Tiếng Việt)
- ⚡ **High Performance** — Uses IntersectionObserver & MutationObserver for efficient image detection
- 🧩 **Manifest V3** — Built with the latest Chrome extension standard

## 📸 How It Works

1. Install the extension
2. Navigate to any page with images
3. The grid overlay automatically appears on detected images
4. Click the extension icon to customize settings:
   - Toggle grid on/off
   - Toggle intersection dots
   - Switch between Rule of Thirds & Golden Ratio
   - Customize line and dot colors
   - Switch language (EN / VI)

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Vite** | Fast build tooling |
| **React 19** | Popup UI & overlay components |
| **TypeScript** | Type-safe codebase |
| **Chrome Extension Manifest V3** | Extension platform |

## 📁 Project Structure

```
composition-grid-rule-of-thirds-golden-ratio/
├── public/
│   ├── icons/                  # Extension icons (16, 48, 128px)
│   └── manifest.json           # Chrome extension manifest
├── src/
│   ├── components/
│   │   └── GridOverlay.tsx     # SVG grid + intersection dots component
│   ├── content/
│   │   ├── index.ts            # Content script (image detection & injection)
│   │   └── content.css         # Overlay positioning styles
│   ├── i18n/
│   │   └── index.ts            # Internationalization (EN/VI)
│   ├── popup/
│   │   ├── App.tsx             # Settings popup UI
│   │   ├── main.tsx            # Popup entry point
│   │   └── popup.css           # Popup styles
│   ├── utils/
│   │   └── storage.ts          # Chrome storage API wrapper
│   └── types.ts                # TypeScript types & default settings
├── popup.html                  # Popup HTML shell
├── vite.config.ts              # Vite config (popup + content script builds)
├── tsconfig.json
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9

### Install Dependencies

```bash
npm install
```

### Build for Production

```bash
npm run build
```

This builds both the popup and content script into the `dist/` directory.

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Navigate to any website with images — the grid overlay will appear!

### Development

```bash
# Build popup only
npm run build:popup

# Build content script only
npm run build:content
```

## ⚙️ Settings

| Setting | Description | Default |
|---|---|---|
| Enable Grid | Master on/off toggle | ✅ On |
| Show Dots | Toggle intersection point dots | ✅ On |
| Grid Type | Rule of Thirds or Golden Ratio | Rule of Thirds |
| Line Color | Color of grid lines | `#000000` |
| Dot Color | Color of intersection dots | `#ffffff` |
| Dot Size | Size of intersection dots (2–20px) | `5px` |
| Line Width | Thickness of grid lines (0.5–5px) | `1px` |
| Language | English or Vietnamese | English |

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Quy Nguyen**

- 🌐 Website: [ngocquy.dev](https://ngocquy.dev)
- 📧 Email: [contact@ngocquy.dev](mailto:contact@ngocquy.dev)

<a href="https://buymeacoffee.com/ngocquy.dev" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" >
</a>

---


