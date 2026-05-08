---
slug: favicon-disappear-fix
title: 修复图标显示后几秒消失的bug
created: 2026-05-08
status: complete
---

## Summary

Fixed favicon disappearing after a few seconds by removing Chrome's external fallback and fixing `setFaviconWithFallback` timer lifecycle.

### Root Cause

1. **Chrome**: `_favicon/` API sometimes fires `onerror` (API quirk). The old code called `setFaviconWithFallback` in the error handler, which started the external service chain (Yandex/DuckDuckGo/Google). All three are foreign services, unreliable from China.
2. **`setFaviconWithFallback`**: When all candidates failed, `img.src = ''` cleared the icon entirely.
3. **Timer leak**: Color code overwrote `img.onload` after `setFaviconWithFallback` set it, so the 2200ms timeout was never cleared. After 2.2s the next candidate replaced the working icon.

### Fix

- **Chrome**: Removed external fallback — `_favicon/` API always returns a valid image (real favicon or default globe). No need to chase unreliable foreign APIs.
- **`favicon-helper.js`**: `img.src = ''` → `return` (never clear the image). Use `img._faviconTimer` instead of closure-local `timeoutId` so the timer can be cleared from outside.
- **Color code**: Clear `img._faviconTimer` before overwriting `img.onload`, preventing the fallback chain from continuing after a successful load.

### Files Changed

- `src/favicon-helper.js` — don't clear image, use img-attached timer
- `src/script.js` — remove Chrome external fallback, clear timer in color code
