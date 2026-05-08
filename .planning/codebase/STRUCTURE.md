# Project Structure

## Top-Level Layout

```
TabMark-Bookmark-New-Tab/
├── manifest.json             # Extension manifest (MV2, Chrome + Firefox)
├── package.json              # npm metadata (minimal, no build scripts)
├── package-lock.json
├── images/                   # Extension icons (16, 48, 128 PNGs)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── _locales/                 # Localization resources (9 languages)
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   ├── zh_TW/messages.json
│   ├── zh_HK/messages.json
│   ├── ja/messages.json
│   ├── ko/messages.json
│   ├── de/messages.json
│   ├── es/messages.json
│   └── fr/messages.json
└── src/                      # All source code
    ├── index.html            # New tab page entry point
    ├── sidepanel.html        # Sidebar panel entry point
    ├── output.css            # Pre-built Tailwind CSS (3,840 lines)
    ├── background.js         # Background/service worker (~1,100 lines)
    ├── script.js             # Main UI module (~6,677 lines)
    ├── content.js            # Content script (injected into web pages)
    ├── icons.js              # SVG icon definitions
    ├── onboarding.js         # First-run onboarding experience
    ├── welcome.js            # Welcome screen component
    ├── feature-tips.js       # Feature discovery tooltips
    ├── browser-api-compat.js # Cross-browser API abstraction
    ├── bookmarks-api-bridge.js # Bookmarks API wrapper/promisification
    ├── favicon-helper.js     # Favicon resolution with multi-source fallback
    ├── search-engine-dropdown.js # 22 search engines configuration
    ├── navigation-handler.js # Bookmark navigation logic
    ├── sidepanel-manager.js  # Side panel state and behavior
    ├── sidepanel-navigation.js # Side panel navigation content script
    ├── gesture-navigation.js # Mouse gesture recognition
    ├── quick-links.js        # Quick links / speed dial section
    ├── wallpaper.js          # Wallpaper/background image system
    ├── progress.js           # Progress indicators
    ├── bookmark-cleanup.js   # Duplicate bookmark detection
    ├── settings.js           # Settings panel UI and logic
    ├── localization.js       # i18n message lookup helpers
    ├── lodash.min.js         # Vendored lodash
    ├── Sortable.min.js       # Vendored SortableJS (drag & drop)
    ├── qrcode.min.js         # Vendored QRCode generator
    ├── _locales/             # Source locale (zh_CN only)
    │   └── zh_CN/messages.json
    └── fonts/                # Custom font files (web_accessible)
```

## Entry Points

| Entry Point | File | Purpose |
|---|---|---|
| New Tab | `src/index.html` | Overrides `chrome://newtab`, loads `script.js` |
| Sidebar | `src/sidepanel.html` | Sidebar panel, loads `sidepanel-manager.js` |
| Background | `src/background.js` | Persistent background script for API bridging |
| Content | `src/content.js` | Injected into all URLs, handles page-script bridge |
| Content 2 | `src/sidepanel-navigation.js` | Side panel navigation injected at document_end |

## Script Loading Order (index.html)
1. `browser-api-compat.js` — compat layer must be first
2. `bookmarks-api-bridge.js` — promisified API wrapper
3. `lodash.min.js` — utility library
4. `Sortable.min.js` — drag-and-drop
5. `qrcode.min.js` — QR generation
6. `localization.js` — i18n helpers
7. `icons.js` — icon definitions
8. `favicon-helper.js` — favicon resolution
9. All feature modules (settings, wallpaper, navigation, etc.)
10. `script.js` — main UI module (loaded last, depends on all above)

## Module Boundaries & Dependencies

```
browser-api-compat.js  ←  bookmarks-api-bridge.js
     ↕                              ↕
background.js ────────────────── script.js
     ↕                    ↕           ↕
sidepanel-manager.js  content.js  favicon-helper.js
     ↕                    ↕
sidepanel-navigation.js  (web pages via postMessage)
```

## Version
- Extension version: `1.250` (from manifest.json)
- Single version number, no semver convention detected
