---
slug: wallpaper-links-fix
title: 配置默认壁纸、修复必应壁纸异常、修复快捷访问链接
created: 2026-05-08
status: complete
---

## Summary

Three fixes: preset wallpapers, Bing thumbnail error handling, and quick access link reliability.

### 1. Default Wallpaper (Preset Wallpapers)

**Root Cause**: `src/images/wallpapers/` directory didn't exist. `wallpaper.js` referenced `wallpaper-1.jpg` through `wallpaper-10.jpg` but none of these files existed. The random preset wallpaper fallback always failed silently.

**Fix**: Created 6 SVG landscape wallpapers (Night Mountain, Forest, Sunset Beach, Starry Night, Aurora, Desert Dunes). Updated `initializePresetWallpapers()` to reference `.svg` extension and reduced from 10 to 6.

### 2. Bing Wallpaper Thumbnail Errors

**Root Cause**: `createBingWallpaperElement()` set CSS `background-image: url('${url}')` directly on the thumbnail div. When Bing blocked the image (CORS, hotlink protection, or expired URL), it failed silently — the user saw a broken thumbnail.

**Fix**: Preload the Bing URL via `new Image()` with `onload`/`onerror` handlers. On load, set the background-image. On error, display a gradient fallback color instead of a broken image.

### 3. Quick Access Links (History/Downloads/Passwords/Extensions)

**Root Cause**: `setupSpecialLinks()` used `api.tabs.create()` for all browsers. On Firefox, `about:` URLs (about:history, about:addons, etc.) are restricted and `api.tabs.create()` fails. The code detected this and showed an English alert telling the user to manually type the URL — never attempted alternative opening methods.

**Fix**: Added `tryOpenUrl()` helper with two-tier fallback: (1) `api.tabs.create()`, (2) `window.open()`. Only shows the manual instruction alert (now in Chinese) when both methods fail on Firefox. Chrome is unaffected.

### Files Changed

- `src/wallpaper.js` — SVG preset paths, Bing thumbnail preloading with fallback
- `src/images/wallpapers/wallpaper-{1-6}.svg` — 6 new SVG wallpaper files
- `src/script.js` — `setupSpecialLinks()` multi-method URL opening
