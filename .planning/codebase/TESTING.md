# Testing Patterns

**Analysis Date:** 2026-05-08

## Test Framework

**Runner:** Not configured.

**Config:** No test configuration file exists. No `jest.config.*`, `vitest.config.*`, or `karma.conf.*` present.

**Test Command (from `package.json`):**
```bash
npm test
# Output: "Error: no test specified" && exit 1
```

There is no functional test command. The default npm placeholder is in use.

## Test File Organization

**Test Files Found:** None.

**Test File Naming:** No convention established -- no `*.test.*`, `*.spec.*`, `*.tests.*`, or `__tests__` directories exist anywhere in the codebase.

## Current Testing Status

**No tests exist in the codebase.** There is no unit testing, integration testing, or end-to-end testing infrastructure. The project has no test coverage at all.

**Zero test files** were found across the entire repository.

## Testing Dependencies

**Related dependencies in `package.json`:** None.

The only dependencies are:
- `@heroicons/react` (icon library, unused in this JS-only project)
- `@heroicons/vue` (icon library, unused in this JS-only project)
- `tailwindcss` (CSS framework)

No testing libraries (Jest, Vitest, Mocha, Karma, Playwright, Cypress, etc.) are present.

## CI/CD

**No CI configuration found.** No `.github/workflows/`, no test running in CI.

## Areas That Would Benefit from Testing

### Critical: Bookmark API Bridge (`src/bookmarks-api-bridge.js`)
- Purpose: Wraps Firefox's Promise-based bookmarks API to support Chrome's callback style.
- Risk: The entire bookmark functionality depends on this bridge working correctly. Any regression here breaks bookmark display, navigation, and editing.
- Test approach: Mock the Firefox browser API, verify that each wrapped method (getChildren, getTree, search, create, update, remove, move) correctly chains Promise -> callback, handles errors gracefully, and returns empty arrays on failure.

### Critical: Browser Compatibility Layer (`src/browser-api-compat.js`)
- Purpose: Resolves `isFirefox` flag and provides unified `api` object.
- Risk: All source files depend on `window.BrowserCompat`. Incorrect detection or missing APIs break the entire extension.
- Test approach: Mock `window.browser` and `window.chrome` globals, verify correct detection and API assignment for both Firefox and Chrome environments.

### High: Background Message Handler (`src/background.js`)
- Purpose: Central message routing for all extension operations (bookmarks, tabs, side panel navigation, settings).
- Size: ~1100 lines with complex nested callbacks and state management.
- Risk: The message handler processes ~15 different action types. Each action has distinct logic, error handling, and storage interaction.
- Test approach: Unit test each action handler in isolation, mocking chrome API and storage. Test state transitions for sidepanel history (navigateBack, navigateForward, recordAndNavigate, updateSidePanelHistory, getNavigationState).

### High: Search Engine Dropdown (`src/search-engine-dropdown.js`)
- Purpose: Manages search engine selection, custom engines, and dropdown UI (~920 lines).
- Risk: Complex localStorage state management with enabled engines, custom engines, and default engine. UI creation logic interleaved with data logic.
- Test approach: Test `SearchEngineManager` methods (getEnabledEngines, addEngine, removeEngine) in isolation. Test UI creation functions with DOM mocks.

### High: Quick Links (`src/quick-links.js`)
- Purpose: History-based quick link generation with caching (~1050 lines inside DOMContentLoaded).
- Risk: Complex caching strategy, history sorting algorithm, blacklist management, and inline UI creation. Data flow from chrome.history API through sorting, deduplication, and rendering is untested.
- Test approach: Unit test `sortHistoryItems()`, `getSiteName()`, `updateDomainPageInfo()`, `isMainPageUrl()` functions. Test cache validity logic.

### Medium: Navigation Handler (`src/navigation-handler.js`)
- Purpose: Injects navigation bar into side panel iframes (~400 lines).
- Risk: Dynamic DOM injection, postMessage communication, keyboard shortcut handling.
- Test approach: Test iframe detection logic, navigation bar injection conditions, postMessage payloads.

### Medium: Welcome Manager (`src/welcome.js`)
- Purpose: Time-based greeting display with adaptive text color against background images (~310 lines).
- Risk: Canvas-based color sampling, MutationObserver setup, complex color calculation logic.
- Test approach: Test greeting selection logic (time-based), color brightness calculation, cache behavior.

### Medium: Settings Manager (`src/settings.js`)
- Purpose: All settings UI (~930 lines across many init methods).
- Risk: Each setting tab has its own initialization method, storage interaction, and UI update logic.
- Test approach: Test individual init methods in isolation with DOM stubs.

### Low: Favicon Helper (`src/favicon-helper.js`)
- Contains pure functions (`getFaviconUrl`, `getFaviconCandidates`, `setFaviconWithFallback`) with no UI dependencies, making it the easiest module to test.

## Recommended Test Infrastructure

**Suggested Framework:** Vitest (fast, ESM-native, good browser API mocking support via `vitest-chrome`).

**Test Location Pattern:** Co-located test files (e.g., `src/favicon-helper.test.js` next to `src/favicon-helper.js`) following the project's flat file structure.

**Initial Test Target (quick wins):**
1. `src/favicon-helper.js` -- Pure functions, no DOM dependency.
2. `src/icons.js` -- Static data export, easy to verify.
3. `src/localization.js` -- Chrome i18n wrapper, testable with mock.
4. `src/welcome.js` -- Greeting time logic, brightness calculation pure functions.

**Mock Strategy:**
- Chrome API: Use `vitest-chrome` or manual mocks for `chrome.bookmarks`, `chrome.storage`, `chrome.tabs`, `chrome.runtime`.
- DOM: Use jsdom for DOM-dependent modules.
- `window.BrowserCompat`: Inject mock before module import.

## Coverage

**Current coverage:** 0% (no tests exist).

**Recommended minimum target:** 30% for first phase (covering utility modules and data logic), 60% for full release (including UI critical paths).

---

*Testing analysis: 2026-05-08*
