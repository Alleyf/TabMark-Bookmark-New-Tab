---
slug: yandex-favicon-wallpaper-wheel-v2
title: 搜索栏图标/滚轮切换/必应壁纸深度修复
created: 2026-05-08
status: complete
---

## Summary

Three root-cause fixes that the previous pass missed.

### Fix 1: Search bar bookmark suggestion icons — direct Yandex

**File**: `src/script.js` — `getFavicon()` (both copies at lines 4102 and 5906), `fetchFaviconOnline()` (both copies)

**Root cause**: The search suggestion code path used `getFavicon()` which preloaded Chrome's `_favicon/` API URL via `new Image()`, then on `onload` set the same URL as an `<img>` src. This double-loading chain was fragile — the `_favicon/` API can fail silently (missing permissions, unsupported URLs). On failure, the fallback was `fetchFaviconOnline()` which only had Google s2 as a single option.

The bookmark card icons used a completely different code path (`createFaviconURL()` in `favicon-helper.js`) which sets the URL directly without preloading — that's why main bookmark icons worked but search suggestion icons didn't.

**Fix**: 
- `getFavicon()` at line 5906: Remove `_favicon/` API + Image() preloading entirely. Directly return Yandex favicon URL.
- `getFavicon()` at line 4102: Firefox primary changed from Google s2 to Yandex.
- `fetchFaviconOnline()` at line 4124: Added Yandex + DuckDuckGo + Google s2 cascade (was only Google s2).

### Fix 2: Wheel switching — overflowY check wrong, listener on wrong element

**File**: `src/script.js` — `initWheelSwitching()`

**Root causes**:
1. **`isListScrollable()` checked `overflow` not `overflowY`** (line 1551): `#bookmarks-list` has `overflow-y: auto; overflow-x: hidden` in CSS (output.css). `getComputedStyle(list).overflow` returns `auto` (the shorthand takes the `overflow-y` value in Chrome), not `visible`. My previous `=== 'visible'` check was wrong — the actual value is `auto`, so it fell through to the height comparison which is correct.

2. **Wheel listener was on `<main>` not `document`** (line 1676): The folder tabs live in `<aside>` (sidebar), which is a sibling of `<main>` — wheel events in the sidebar never bubble through `<main>`. The previous `closest('aside')` check was dead code because the handler never received aside events. Changed listener to `document` so events from both `main` and `aside` are captured.

**Fix**: `isListScrollable()` checks `overflowY` for `auto` or `scroll`. Listener moved to `document`.

### Fix 3: Bing wallpaper — urlbase relative path without domain prefix

**File**: `src/wallpaper.js` — `fetchBingWallpapers()` urlbase branch (line 984)

**Root cause**: The Bing API returns `urlbase` as a RELATIVE path (e.g., `/th?id=OHR.SomeImage_1920x1080`). When used without domain prefix, `fullUrl` becomes `/th?...?w=1920...`. In a `chrome-extension://` page, this resolves to a non-existent `chrome-extension://ID/th?...` URL. The `else` branch (for `url`) correctly prepends `https://www.bing.com`, but the `urlbase` branch skipped this step.

The comment on line 985 says "urlbase 是完整的图片 URL" but the Bing API actually returns a relative path.

**Fix**: Added domain prefix — if `urlbase` doesn't start with `http`, prepend `https://www.bing.com`. The `createBingWallpaperElement()` change from the previous session (direct background-image + Image fallback) was correct; the real issue was the broken URL before it reached the thumbnail renderer.

### Files Changed

- `src/script.js` — three favicon functions: direct Yandex for search suggestions, Yandex for primary code, multi-service cascade for fetchFaviconOnline; `isListScrollable` overflowY check; wheel listener on document
- `src/wallpaper.js` — urlbase branch now prepends bing.com domain
