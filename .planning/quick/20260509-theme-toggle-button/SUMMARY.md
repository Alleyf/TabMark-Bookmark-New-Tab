---
slug: theme-toggle-button
title: 添加主题切换功能
created: 2026-05-09
status: complete
---

## Summary

Added the missing floating theme toggle button to `index.html`. Previously the button had full CSS styling and complete JS logic (toggle click handler, auto theme detection, system theme listener, settings sync) but the HTML element was never created — `getElementById('theme-toggle-btn')` always returned null, making the entire feature inoperable.

### Root Cause

- `settings.js` `initTheme()` reads saved theme, applies `data-theme` on `<html>`, sets up listeners — all working
- `#theme-toggle-btn` click handler toggles dark/light — fully wired
- CSS for `.theme-toggle` (fixed positioning, right side) and `#theme-toggle-btn` — fully styled
- But no HTML element with `id="theme-toggle-btn"` existed in `index.html`

### Fix

Added one element in `src/index.html`:
```html
<div class="theme-toggle">
    <button id="theme-toggle-btn" title="切换主题"></button>
</div>
```

The button is initially empty; `updateThemeIcon()` sets its `innerHTML` to the appropriate SVG icon on initialization and on every toggle.

### Files Changed

- `src/index.html` — added `.theme-toggle` with `#theme-toggle-btn`
