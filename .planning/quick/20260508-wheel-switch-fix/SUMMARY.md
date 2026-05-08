---
slug: wheel-switch-fix
title: 修复滚轮切换文件夹功能和搜索建议图标
created: 2026-05-08
status: complete
---

## Summary

Fixed two bugs: wheel switching not triggering, and search suggestion icons not loading.

### Fix 1: Search Suggestion Favicons

**Root Cause**: `getFavicon()` on Chrome used `_favicon/` API, but on `onerror` returned empty string `''`, resulting in `<img src="">` — no icon displayed.

**Fix**: Fall back to `https://www.google.com/s2/favicons?domain=X&sz=32` when Chrome's `_favicon/` API fails (same service Firefox uses directly).

### Fix 2: Wheel Switching Still Not Working

**Root Cause** (two issues):

1. **`#bookmarks-list` was in blocked elements list** — The bookmarks list covers most of the main content area. When the user scrolls while cursor is over the bookmarks (the default position), wheel switching was silently blocked. The `#bookmarks-list` selector blocked the handler before it could process the event.

2. **`isEnabled` reliance without fallback** — The handler depended entirely on the `isEnabled` closure variable, which is set by the init storage callback and the `wheelSwitchingChanged` event listener. If either failed to propagate, `isEnabled` stayed `false` and the handler returned immediately.

**Fix**:
- Removed `#bookmarks-list` from blocked elements; replaced with conditional check — block only when the list has overflow content (i.e., is actually scrollable). When content fits in viewport, wheel switching works over the bookmarks area.
- Added fallback storage read in the handler: when `isEnabled` is `false`, do a direct `api.storage.sync.get({ enableWheelSwitching })` check as a backup path before giving up.

### Files Changed

- `src/script.js` — `getFavicon()` fallback to Google s2; `initWheelSwitching()` smart bookmarks-list blocking + storage fallback
