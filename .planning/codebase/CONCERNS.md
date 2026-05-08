# Concerns & Technical Debt

## Critical Issues

### 1. XSS Vectors via InnerHTML (~60+ occurrences)
The codebase extensively uses `innerHTML` assignment with unsanitized bookmark data (titles, URLs, descriptions). Bookmark titles can contain arbitrary HTML/JS — an attacker who can create bookmarks (via sync, import, or another extension) can execute scripts in the new tab page context.

**Locations:** `script.js`, `sidepanel-manager.js`, `settings.js`
**Risk:** High. Bookmark sync from another device could inject malicious titles.

### 2. Unsafe postMessage Usage (~20 occurrences)
`window.postMessage` is called with wildcard origin `'*'` throughout the codebase. Any web page the user visits can receive extension internal messages.

**Risk:** High. Could leak bookmark data or trigger unintended actions.

### 3. Manifest V2 (Deprecated)
Chrome is phasing out Manifest V2. This extension will stop working once Chrome fully deprecates MV2.
**Impact:** Extension will be disabled in Chrome. Requires migration to Manifest V3.
**Effort:** High — background script would need service worker conversion, API changes for several methods.

### 4. No Input Validation on Bookmark Operations
Bookmarks API bridge (`bookmarks-api-bridge.js`) silently swallows all errors. No validation on bookmark title, URL, or folder name before calling the Chrome API.

## Security Concerns

### 5. Broad Permissions
- `"<all_urls>"` permission grants access to every website the user visits
- Combined with XSS vectors, this is a significant attack surface
- Should be narrowed to only necessary hosts

### 6. Hardcoded Third-Party Extension ID
Hardcoded `chrome.runtime.sendMessage` target for LazyCat Bookmark Cleaner — fragile if that extension changes IDs.

### 7. localStorage for Caching
Uses `localStorage` in page scripts, which could exceed the 5MB quota with large bookmark trees. Chrome extension storage APIs would be more appropriate and safer.

## Performance Issues

### 8. DOM Queries in Loops
Multiple instances of repeated DOM queries inside loops (e.g., `document.getElementById(...)` called inside `forEach` or `for` loops).

### 9. Aggressive Polling
500ms `setInterval` for URL polling — unnecessary overhead when the user is on the new tab page.

### 10. Large Single File
`script.js` at ~6,677 lines is a monolithic module that:
- Handles rendering, event handling, state management, and business logic
- Contains significant code duplication
- Difficult to maintain or test
- Any change risks side effects in unrelated features

### 11. 377 Console.log Statements
Debug logging left in production code. Adds overhead and clutters the console.

## Technical Debt

### 12. No Test Coverage
Zero test files exist. No test framework, no test scripts, no CI pipeline. The entire codebase is untested.

### 13. Mixed Module System
The codebase uses multiple module patterns inconsistently:
- ES6 modules (`export`/`import`)
- IIFE-based modules attached to `window`
- Globals set via direct assignment
- Scripts loaded as regular `<script>` tags (no module type)

### 14. Duplicated Code
- QR code generation function exists in at least 2 files
- Favicon resolution logic partially duplicated between `favicon-helper.js` and inline code in `script.js`
- Navigation rendering functions shared between new tab and sidebar via copy-paste

### 15. Dead Dependencies
- `@heroicons/react` and `@heroicons/vue` in `package.json` are not used anywhere in the code
- These appear to be leftover from a potential earlier framework consideration

### 16. Vendored Libraries Without Version Tracking
`src/lodash.min.js`, `Sortable.min.js`, `qrcode.min.js` — no version metadata, no update path.

### 17. Git-Friendliness Issues
- `TabMark-Bookmark-New-Tab.zip` (2.5MB+) tracked in git — should be gitignored
- No `.gitignore` file detected

### 18. No Build Pipeline
- No bundler, no minifier, no tree-shaker
- All 24 JS files loaded individually via `<script>` tags
- Tailwind CSS prebuilt to `output.css` manually (no build script)

### 19. Mixed Async Patterns
Three coexisting async patterns causing confusion and potential bugs:
- Callbacks (`chrome.bookmarks.getTree(function(result) {...})`)
- Promise wrapping (manual `new Promise((resolve, reject) => {...})`)
- async/await (in newer code)

### 20. Side Panel State Fragmentation
Side panel navigation state is distributed across 5 files: `background.js`, `sidepanel-manager.js`, `sidepanel-navigation.js`, `navigation-handler.js`, and parts of `script.js`. Makes debugging navigation issues extremely difficult.

## Known Bugs

### 21. ChatGPT Search Wrong Domain
`chat.openai.com` used instead of the current `chatgpt.com` — will break when OpenAI finalizes domain migration.

### 22. Favicon Fallback Never Triggers
The fallback chain in `favicon-helper.js` has a logic issue where the primary source failing doesn't correctly propagate to secondary sources.

### 23. Math.min(0, x) Bug in Quick Links
`Math.min(0, x)` always returns 0, breaking any logic that depends on minimum value calculation in the quick links placeholder feature.

### 24. Race Conditions in Storage Operations
Multiple `chrome.storage.local.get/set` calls can race:
- Settings save/load race if user rapidly changes preferences
- Bookmark operations that read-then-write can conflict

### 25. Content Script Fragility
Content script (`content.js`) uses site-specific selectors for 5 AI chat services (ChatGPT, Claude, Gemini, etc.). These selectors break when those sites update their DOM.

## Maintainability

### 26. Chinese-Language Comments
Approximately 70% of code comments are in Chinese. While this matches the zh_CN default locale, it creates a barrier for international contributors.

### 27. No Linter/Formatter Configuration
No `.eslintrc`, `.prettierrc`, or any code style configuration. Code style is inconsistent across files.

### 28. Single Author
All commits by `selfree` / `alleef` — bus-factor of 1.

## Recommendations (Priority Order)

1. **Migrate to Manifest V3** — critical for Chrome survival
2. **Address XSS vectors** — sanitize all `innerHTML` assignments
3. **Fix postMessage origins** — restrict to specific origins
4. **Add test infrastructure** — Jest or Vitest for unit tests on API bridge and favicon helper
5. **Split script.js** — break into focused modules (navigation, rendering, bookmarks display)
6. **Add input validation** — validate bookmark data before API calls
7. **Reduce console.log** — strip or gate behind debug flag
8. **Add .gitignore** — exclude zip, node_modules, IDE files
