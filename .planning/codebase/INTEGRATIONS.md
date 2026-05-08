# Integrations

## Chrome Extension APIs

### bookmarks
- **9 methods used:** `getTree`, `getChildren`, `getSubTree`, `getRecent`, `create`, `move`, `update`, `remove`, `search`
- Events: `onCreated`, `onRemoved`, `onChanged`, `onMoved`, `onImportEnded`, `onImportBegan`
- The primary data source — the entire UI is a bookmark manager/launcher

### storage
- `chrome.storage.local` — persistent settings, wallpaper config, feature flags
- `chrome.storage.sync` — synced preferences across devices
- `chrome.storage.session` — session-level state (tab-specific)

### tabs
- `chrome.tabs.create` — opening bookmarks and URLs
- `chrome.tabs.query` / `update` — tab management features

### runtime
- `chrome.runtime.sendMessage` / `onMessage` — cross-context messaging (background ↔ page ↔ sidepanel)
- `chrome.runtime.getURL` — resolving extension resource paths
- `chrome.runtime.lastError` — error checking in callback-style API calls

### sidePanel
- `chrome.sidePanel.setOptions` — configuring sidebar panel behavior
- Navigation history via stack-based state management

### i18n
- `chrome.i18n.getMessage` — localization across 9 locales
- `__MSG_*__` placeholders in HTML files

### windows
- Window management for popup/tab creation

### management
- `chrome.management.getSelf` — extension self-identification

### commands
- Keyboard shortcut: `Alt+B` / `Command+B` to toggle sidebar

### favicon
- `chrome://favicon/` protocol access for bookmark favicons
- Fallback to external services when Chrome favicon fails

## External Services

### Favicon Providers (configured in `favicon-helper.js`)
- **Yandex** — `https://favicon.yandex.net/favicon/` (primary fallback)
- **Google** — `https://www.google.com/s2/favicons` (secondary fallback)
- **DuckDuckGo** — `https://icons.duckduckgo.com/ip3/` (tertiary fallback)
- **Direct fetch** — attempts to fetch `/favicon.ico` from the target domain directly

### Search Engines (`search-engine-dropdown.js`)
- **22 pre-configured search engines** including Google, Bing, Baidu, DuckDuckGo, Yahoo, Yandex, Sogou, 360, GitHub, Wikipedia, Stack Overflow, MDN, NPM, Reddit, Twitter/X, YouTube, Bilibili, Zhihu, Douban, Taobao, JD, Amazon
- Each search engine has: name, URL template, icon, encoding

### CDN Resources
- **Google Fonts** — Material Icons loaded via `https://fonts.googleapis.com/icon?family=Material+Icons`
- All other resources are bundled/vendored within the extension

## Third-Party Extension Integration
- **LazyCat Bookmark Cleaner** — communication via `chrome.runtime.sendMessage` with hardcoded extension ID

## Cross-Context Message Passing

The extension uses `window.postMessage` and `chrome.runtime.sendMessage` extensively:

| Context | Communication Method | Purpose |
|---|---|---|
| New Tab Page ↔ Background | `chrome.runtime.sendMessage` | Bookmark CRUD, settings |
| Sidebar ↔ Background | `chrome.runtime.sendMessage` | Bookmark navigation, search |
| Content Script ↔ Page | `window.postMessage` | Injecting page scripts |
| New Tab ↔ Sidebar | `window.postMessage` | Navigation sync, active tab info |

## Browser Compatibility

### Firefox
- `browser-api-compat.js` — abstracts Firefox API differences
- `bookmarks-api-bridge.js` — handles Firefox bookmark API quirks
- Uses `sidebar_action` manifest key (Firefox-specific)
- Firefox-specific manifest entries: `browser_specific_settings.gecko`

### Chrome
- Primary target. Uses Chrome-specific APIs (`chrome.sidePanel`, etc.)
- Manifest V2 (will need V3 migration)
