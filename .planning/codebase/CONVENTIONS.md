# Coding Conventions

**Analysis Date:** 2026-05-08

## Language & Runtime

**Language:** JavaScript (ES6+) -- No TypeScript used anywhere in the codebase.
**Module System:** ES6 modules (`type="module"` in HTML) for most source files, with `import`/`export` syntax. Some scripts (e.g., `bookmarks-api-bridge.js`, `sidepanel-navigation.js`) use IIFE `(function() { ... })()` patterns for early-execution initialization. Plain `<script>` tags are used for polyfill/compatibility scripts that must load before modules.
**Package Manager:** npm with `package.json` (no lockfile version-controlled).
**Build System:** None. Tailwind CSS is listed as a dependency (`tailwindcss ^3.4.4`) but no build pipeline is configured. The file `src/output.css` appears to be a pre-built Tailwind output.

## Naming Patterns

**Files:**
- All source files use `kebab-case.js` naming: `browser-api-compat.js`, `search-engine-dropdown.js`, `bookmark-cleanup.js`, `bookmarks-api-bridge.js`, `feature-tips.js`, `gesture-navigation.js`, `navigation-handler.js`, `favicon-helper.js`, `sidepanel-navigation.js`, `sidepanel-manager.js`.
- Exception: `Sortable.min.js`, `lodash.min.js`, `qrcode.min.js` are third-party minified libraries.

**Functions:**
- camelCase for all functions: `getFaviconUrl()`, `createSearchEngineDropdown()`, `updateSearchEngineIcon()`, `loadSavedSettings()`, `getUserLanguage()`, `replaceIconsWithSvg()`.
- Private/helper functions within classes use camelCase: `_` prefix is NOT used -- private methods are simply documented via comments.

**Variables:**
- camelCase for all variables: `defaultSearchEngine`, `currentBookmark`, `itemToDelete`, `faviconUrl`, `bookmarkTreeNodes`.
- Boolean prefixes occasionally use `is`/`has`/`enable`: `isFirefox`, `isNavigating`, `hasSidePanelSettings`, `enableFloatingBall`, `navigationBarAdded`.

**Constants:**
- Inconsistency exists:
  - `UPPER_SNAKE_CASE` used in some files: `ALL_ENGINES`, `MAX_DISPLAY`, `DEBOUNCE_TIME`, `STORAGE_WRITE_INTERVAL`, `LOAD_TIMEOUT_MS`, `MAX_WIDTH_EN`, `MAX_WIDTH_CN`.
  - camelCase used in others: `quickLinksCache`, `mouseNavigationCooldown`, `searchEngineDomains`.
  - Convention: Module-level configuration/limit values use `UPPER_SNAKE_CASE`. Data caches and state objects use camelCase.

**Classes:**
- PascalCase for all classes: `SettingsManager`, `SidePanelManager`, `WelcomeManager`.
- Name ends with `Manager` for manager/singleton classes.

**Exports:**
- Named exports for ES6 modules: `export { ICONS, replaceIconsWithSvg, getIconHtml }`.
- Some modules export a single instance: `export const settingsManager = new SettingsManager()`.
- Some modules attach to `window` for global access: `window.WelcomeManager = WelcomeManager;`, `window.getLocalizedMessage = function(...)`.

## Code Style

**Formatting:**
- No formatter config detected (no `.prettierrc`, `.editorconfig`, or similar).
- Indentation is mixed: 2-space indentation appears in most files (`settings.js`, `search-engine-dropdown.js`), but some files use 4-space or tab-indented code.
- Semicolons are used consistently.
- Single quotes preferred for strings: `const url = '...'`, `element.style.display = 'none'`.
- Template literals with backticks used widely for string interpolation: `` `${name}_qrcode.png` ``.

**Linting:**
- No linter config detected (no `.eslintrc.*`, `eslint.config.*`, or `biome.json`).
- No lint scripts in `package.json`.

**Line Length:**
- No enforced limit. Lines can be long (up to 150+ characters seen).

## Import Organization

**Order (observed pattern in `search-engine-dropdown.js` and `script.js`):**
1. Browser compatibility layer (`const { isFirefox, api, sidePanelAPI } = window.BrowserCompat;`)
2. Internal module imports (`import { ICONS } from './icons.js';`)
3. Third-party dependencies (not typically imported -- loaded via `<script>` tags in HTML)

**Path Aliases:**
- No path aliases used. All imports are relative paths with `.js` extension: `'./icons.js'`, `'./feature-tips.js'`.

**Import Style:**
- Named imports exclusively: `import { ICONS, getIconHtml } from './icons.js'`.
- Destructuring for browser compat: `const { isFirefox, api, sidePanelAPI } = window.BrowserCompat`.

## Error Handling

**Patterns:**
- Widespread use of `try-catch` blocks around Chrome API calls and URL parsing.
- Callback-style error handling via `chrome.runtime.lastError` checks:
  ```javascript
  chrome.tabs.create({ url: url }, (tab) => {
    if (chrome.runtime.lastError) {
      console.error('Failed:', chrome.runtime.lastError);
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ success: true });
    }
  });
  ```
- Promise-style error handling with `.catch()`:
  ```javascript
  chrome.sidePanel.setOptions({ path: url }).then(() => { ... }).catch(error => { ... });
  ```
- Silent failure handling in Firefox bridge (`bookmarks-api-bridge.js`): errors are caught and swallowed with only console.warn/error, returning empty arrays instead of propagating.

**Guard Clauses:**
- Heavy use of null/undefined checks:
  ```javascript
  if (!this.widthSlider || !this.widthValue) {
    console.log('...not found, skipping');
    return;
  }
  ```
- Element existence checks before DOM manipulation:
  ```javascript
  if (typeof SidePanelManager === 'undefined') { ... fallback ... }
  ```

## Logging

**Framework:** `console.log`, `console.error`, `console.warn` -- no structured logging library.

**Patterns:**
- Extremely verbose logging throughout, especially in `background.js` and `quick-links.js`.
- Console messages in Chinese for business logic, English for technical operations.
- Prefix brackets used for component identification: `[SidePanel Navigation]`, `[Quick Link Click]`, `[Navigation Handler]`.
- Debug logging is always present (not gated behind debug flags).

**Examples:**
- `console.log('[SidePanel Navigation] 脚本开始加载');`
- `console.log('Updated history state for home navigation:', { ... });`
- `console.warn('Cannot open restricted about: URL:', url);`

## Comments

**Language:**
- Chinese (Simplified) for all business logic comments.
- English for technical/infrastructure comments.

**Style:**
- `//` single-line comments predominantly. No JSDoc/TSDoc annotations found.
- Leading comments at the top of each file indicating file purpose and browser compat dependency.
- Inline comments explaining the "why" behind logic, especially around Firefox/Chrome differences.
- Commented-out code blocks present in some files.

**Examples:**
- `// Firefox 兼容性层` (top of most files)
- `// 辅助函数：替换图标`
- `// 定义全局SidePanelManager类`

**When to Comment:**
- Every file has a top-level purpose comment.
- Complex DOM manipulation has step-by-step comments.
- Browser-specific workarounds have explanatory comments.
- Performance optimizations (debounce, cache) have comments explaining the strategy.

## Function Design

**Size:**
- Functions can be very large. `script.js` contains extremely long functions (500+ lines), and `quick-links.js` has the DOMContentLoaded callback spanning ~1000 lines.
- Some utility functions are small (2-10 lines), but many handler functions grow large with nested callbacks.

**Parameters:**
- Named parameters preferred for configuration objects: `api.storage.sync.get(['key1', 'key2'], callback)`.
- Default parameter values used: `function updateWelcomeMessage(checkVisibility = true)`.

**Return Values:**
- Functions either return values directly or use callbacks/Promises for async results.
- Early returns for error/guard conditions: `if (!url) return '';`.
- Consistent pattern of returning `{ success: true/false, ...data }` from message handlers.

## Module Design

**Exports:**
- Named exports from each module at the bottom of the file.
- Some modules export a pre-initialized singleton instance (`settingsManager`).
- Some modules export only functions (`favicon-helper.js`).
- Mix of ES6 `export` and `window.X = X` for global exposure.

**Barrel Files:**
- No barrel/index files. Each module is imported individually.

**File Responsibility:**
- Each file has a single responsibility area (e.g., `search-engine-dropdown.js` handles all search engine UI), but within that file there are no sub-modules.
- Files are large and contain both UI creation logic and data management logic.

## HTML/CSS Conventions

- HTML uses `data-i18n`, `data-i18n-placeholder`, `data-i18n-title` attributes for localization.
- CSS class naming uses kebab-case: `quick-link-item-container`, `custom-context-menu`, `search-engine-dropdown`.
- Tailwind CSS utility classes mixed with custom CSS: `class="h-screen flex flex-col"`.
- Inline styles used in dynamically created elements (especially in `quick-links.js`).
- CSS custom properties used for theming: `--bookmark-width`, `data-theme="dark"`.

## Browser Compatibility Pattern

Every source file starts with the same pattern:
```javascript
const { isFirefox, api, sidePanelAPI } = window.BrowserCompat;
```
This ensures cross-browser compatibility between Firefox and Chrome extensions. The `api` object resolves to `browser` (Firefox) or `chrome` (Chrome).

## Async Patterns

Three patterns are used inconsistently:
1. **Chrome callback style:** `chrome.bookmarks.getTree((nodes) => { ... })` with `chrome.runtime.lastError` checks.
2. **Promise wrapping:** `new Promise((resolve, reject) => { chrome.tabs.create({...}, (tab) => { ... }) })`.
3. **async/await:** Used in some newer functions like `async function navigateToParentFolder()` and `async function generateQuickLinks()`.

The `bookmarks-api-bridge.js` file exists specifically to wrap Firefox's Promise-based bookmarks API to support Chrome's callback style.

## Commit Message Conventions

Based on git log, commit messages follow this pattern:
```
type(scope): description
```
- `fix` for bug fixes: `fix(navigation+favicon): ...`, `fix(bookmark): ...`, `fix: ...`
- `chore` for maintenance: `chore(firefox): ...`

---

*Convention analysis: 2026-05-08*
