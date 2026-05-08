# Technology Stack

## Languages
- **JavaScript** (ES6+) — all source code, no TypeScript
- **HTML5** — `src/index.html` (new tab), `src/sidepanel.html` (sidebar)
- **CSS3** — Tailwind-generated utility classes, custom CSS in components

## Frameworks & Libraries
- **None.** No SPA framework (React/Vue/Angular). Pure vanilla JS with DOM manipulation.
- **Tailwind CSS v3.4.4** — listed as dependency, pre-built `src/output.css` (3,840 lines) checked in. No `tailwind.config.js` found; builds were run externally.
- **Vendored** (in `src/`):
  - `lodash.min.js` — utility functions
  - `Sortable.min.js` v1.15.2 — drag-and-drop reordering
  - `qrcode.min.js` — QR code generation
- **npm dependencies** (`package.json`):
  - `@heroicons/react` ^2.1.4 — listed but not used in codebase
  - `@heroicons/vue` ^2.1.4 — listed but not used in codebase
  - `tailwindcss` ^3.4.4 — used to generate output.css

## Build System
- **None.** No bundler (webpack/vite/rollup). Scripts loaded directly via `<script>` tags in HTML.
- No CI/CD pipeline configured.
- Only npm script: `echo "Error: no test specified"` (stub).

## Runtime Environment
- **Browser extension** (Chrome Manifest V2, with Firefox compatibility)
- Chrome: Manifest V2 via `manifest.json`
- Firefox: Sidebar action, `browser_specific_settings` in manifest
- No Node.js server component

## Key Source Files (24 JS files in `src/`)
| File | Size | Role |
|---|---|---|
| `script.js` | ~6,677 lines | Main UI module — renders the new tab page |
| `background.js` | ~1,100 lines | Service worker / background script |
| `browser-api-compat.js` | ~300 lines | Cross-browser API abstraction layer |
| `bookmarks-api-bridge.js` | ~250 lines | Chrome bookmarks API wrapper |
| `favicon-helper.js` | ~200 lines | Favicon resolution (multi-source fallback) |
| Remaining 19 files | 50-400 lines each | Feature modules |

## HTML Entry Points
- `src/index.html` — New tab override page
- `src/sidepanel.html` — Sidebar panel (shared DOM structure with index.html)

## i18n / Localization
- 9 locales: `en`, `zh_CN`, `zh_TW`, `zh_HK`, `de`, `es`, `fr`, `ja`, `ko`
- Chrome i18n API (`__MSG_*__` in HTML, `chrome.i18n.getMessage()` in JS)
- Default locale: `zh_CN`

## External Resources
- Material Icons — loaded from Google Fonts CDN
- Multiple favicon providers (Yandex, Google, DuckDuckGo, direct fetch)
