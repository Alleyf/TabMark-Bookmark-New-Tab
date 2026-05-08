# 多项设置与主题修复

## Description
5 fixes: time-based theme auto-adapt, separate Bing/preset wallpaper sections, remove bookmark cleanup from settings, fix settings title to proper Chinese, add dark mode CSS for all settings elements.

## Tasks
1. Add "跟随时间" theme option to select dropdown + `setThemeBasedOnTime()` logic + periodic check
2. Split `<div class="wallpaper-section">` into two separate sections (Bing wallpapers / Preset wallpapers)
3. Remove bookmark management tab button and tab content from settings
4. Change settingsTitle from "设置" to "扩展设置"
5. Add dark mode CSS for `.slider`, `.setting-option`, `.settings-description`, `.switch-label`, inputs, `.bing-wallpaper-item`, `.settings-tab-button:hover`, `.wallpaper-section`
