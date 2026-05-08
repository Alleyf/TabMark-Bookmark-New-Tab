---
slug: wallpaper-links-fix
title: 配置默认壁纸、修复必应壁纸异常、修复快捷访问链接
created: 2026-05-08
files:
  - src/wallpaper.js
  - src/script.js
  - src/images/wallpapers/*.svg
---

## Tasks

1. Create preset wallpaper SVG images (no external files needed)
2. Fix Bing wallpaper thumbnail error handling (fallback on load failure)
3. Fix quick access links: try alternate opening methods on Firefox before showing alert

## Details

### 1. Preset wallpapers
- `src/images/wallpapers/` directory is missing — create 6 SVG wallpapers
- Each SVG is a landscape scene using SVG filters/gradients
- Update wallpaper.js image error handling

### 2. Bing wallpapers
- Add onerror handler for `bing-wallpaper-thumbnail` background images
- When Bing URL fails, replace with preset wallpaper gradient

### 3. Quick access links
- On Firefox: try `api.tabs.create()` first, then `window.open()` as fallback
- Only show manual instruction alert if both methods fail
- On Chrome: already works
