# Architecture

## Overall Pattern
**Background-worker + content-script + page-script with message-passing core.**

The extension follows a classic Chrome extension architecture:
- A **background script** (`background.js`) handles bookmark API calls, settings management, and cross-context coordination
- **Content scripts** (`content.js`, `sidepanel-navigation.js`) inject into web pages for side-panel UI and page interaction
- **Page scripts** run directly in `src/index.html` (new tab) and `src/sidepanel.html` (sidebar) — these are the main UI surfaces
- Communication via `chrome.runtime.sendMessage` (extension-internal) and `window.postMessage` (page-level)

## Data Flow

```
┌──────────────────────────┐
│   Chrome Bookmarks API   │
│   (chrome.bookmarks.*)   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   Background Script      │
│   (background.js)        │
│                          │
│  ┌────────────────────┐  │
│  │ Message Router     │  │
│  │ 15+ action types   │  │
│  └────────────────────┘  │
└────┬─────────┬───────────┘
     │         │
     ▼         ▼
┌─────────┐ ┌──────────────┐
│ New Tab │ │ Side Panel   │
│ Page    │ │ (sidebar)    │
│         │ │              │
│ script  │ │ sidepanel-   │
│ .js     │ │ manager.js   │
└─────────┘ └──────────────┘
     │              │
     └──────┬───────┘
            ▼
   ┌────────────────┐
   │ Content Script │
   │ (content.js)   │
   └────────────────┘
```

## Key Abstractions

### BrowserCompat (`browser-api-compat.js`)
Global compatibility layer wrapping Chrome/Firefox API differences. Exposes a unified API surface for:
- `chrome.bookmarks` / `browser.bookmarks`
- `chrome.storage` / `browser.storage`
- `chrome.runtime` / `browser.runtime`
- `chrome.tabs` / `browser.tabs`

### BookmarksAPI Bridge (`bookmarks-api-bridge.js`)
Thin wrapper around Chrome bookmarks API methods:
- Wraps callback-based API in Promises
- Provides uniform error handling
- Caches bookmark tree for performance

### Message Routing (`background.js`)
Central message handler processing ~15 action types:
- Bookmark CRUD (create, read, update, delete, move, search)
- Settings get/set
- Tab management (open, query, update)
- Side panel navigation state
- Favicon resolution
- Search engine queries

### Main UI (`script.js`)
The largest file (~6,677 lines). Renders the new tab page with:
- Bookmark tree navigation (folder drill-down)
- Bookmark grid/list views
- Search bar with engine selection
- Quick links section
- Wallpaper/theme system
- Drag-and-drop bookmark organization
- Gesture navigation (mouse gestures)

### Side Panel (`sidepanel-manager.js` + `sidepanel-navigation.js`)
Linked navigation system:
- States managed across 5 files (sidepanel-manager, sidepanel-navigation, background, navigation-handler, script)
- Stack-based navigation history (breadcrumb pattern)
- Shares rendering logic with new tab page via function calls

### Favicon Resolution (`favicon-helper.js`)
Multi-source fallback chain:
1. `chrome://favicon/` protocol
2. Yandex favicon service
3. Google favicon service
4. DuckDuckGo favicon service
5. Direct domain `/favicon.ico` fetch

## State Management
- **No centralized state store.** State is distributed across modules as global variables/objects.
- `window` object is used as shared namespace in page scripts
- `chrome.storage.local` for persistent state (settings, preferences)
- `chrome.storage.session` for ephemeral session data
- Side panel navigation state is split across background.js and sidepanel-manager.js

## Rendering
- Pure DOM manipulation via `innerHTML` assignments (no virtual DOM)
- Template strings for HTML generation
- Event delegation pattern for dynamic content
- CSS via Tailwind utility classes (pre-compiled to `output.css`)

## Security Model
- Relies on Chrome extension permission system
- `chrome.runtime.sendMessage` validates internal messages (sender.tab, sender.id checks)
- `window.postMessage` used with various origin targets for page-script communication
