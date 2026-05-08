---
slug: multi-settings-fixes
title: 多项设置与主题修复
created: 2026-05-09
status: complete
---

## Summary

Five fixes for settings UI and theme adaptation.

### 1. Time-based Theme

Added a "跟随时间" option to the theme select dropdown. When selected, the theme switches to dark between 18:00-05:59 and light between 06:00-17:59. A `setInterval` checks every 60 seconds to handle the transition at the boundary.

**Files**: `src/index.html` (added `<option value="time">`), `src/settings.js` (added `setThemeBasedOnTime()`, interval), `src/_locales/zh_CN/messages.json` (added `timeTheme`)

### 2. Separate Wallpaper Sections

Split the single `.wallpaper-section` div into two: one for Bing wallpapers and one for preset wallpapers + upload actions. Each now gets its own section boundary and can be styled independently.

**File**: `src/index.html`

### 3. Remove Bookmark Cleanup

Removed the bookmark management tab button from the settings sidebar nav and the entire `#bookmark-management-settings` tab content div.

**File**: `src/index.html`

### 4. Settings Title

Changed `<h2>` title from "设置" to "扩展设置" (Extension Settings) to be more descriptive for an extension's settings panel.

**File**: `src/index.html`

### 5. Settings Dark Mode CSS

Added dark mode styles for several settings elements that were missing theme adaptation:
- `.slider` (toggle switch off state)
- `.switch-label`, `.setting-option` text
- `.settings-description`, `.settings-tab-content p`
- Input fields (text/url) in settings layout
- `.settings-tab-button:hover`
- `.bing-wallpaper-item` (background, border, active state)
- `.bing-wallpaper-info`, `.bing-wallpaper-date`
- `.wallpaper-section` border

**File**: `src/styles.css`

### Files Changed

- `src/index.html` — 4 changes (time option, wallpaper split, remove bookmark tab, fix title)
- `src/settings.js` — time-based theme method and interval
- `src/styles.css` — dark mode CSS for settings elements
- `src/_locales/zh_CN/messages.json` — timeTheme i18n entry
