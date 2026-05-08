---
slug: favicon-bridge-wheel-fix
title: 修复书签API桥接器错误、清理console日志、修复滚轮切换
created: 2026-05-08
status: complete
---

## Summary

Three fixes in one pass: bridge error suppression + ID mapping, console log cleanup, wheel switching fix.

### 1. Bridge Error (bookmarks.getChildren error for id: 1)

**Root Cause**: On Firefox, `api.bookmarks.getChildren("1")` fails because Firefox uses string IDs like `toolbar_____` instead of Chrome's numeric `"1"`. The bridge logged `console.error` and returned empty — the error was visible in console.

**Fix**: 
- Added Chrome-to-Firefox root ID mapping (`"1"`→`"toolbar_____"`, etc.) so the bridge silently translates IDs
- Removed all `console.error` from catch blocks — expected failures are handled gracefully
- Cut bridge from 280→286 lines (almost same but cleaner logic)

### 2. Console Log Cleanup

Removed ~40 debug `console.log` statements:
- Wheel switching: "Wheel switching to folder:", "Updating wheel listener", etc.
- Background: All `[Background]` debug logs
- Init: `[Init] Starting initialization...`, `[Init] Special links setup complete`
- Context menu: "Creating context menu"
- Folder tabs: "Initializing default folders tabs:"
- Switch: "Switching to folder:"

### 3. Wheel Switching Fix

**Root Cause**: The bridge only wrapped `storage.local.*` but not `storage.sync.*`. On Firefox, `api.storage.sync.get({ enableWheelSwitching }, callback)` never called the callback, so `isEnabled` stayed `false`.

**Fix**: Added `storage.sync.*` wrappers (get/set/remove/clear) to the bridge. Wheel switching setting now properly loads on Firefox.

### Files Changed

- `src/bookmarks-api-bridge.js` — Chrome ID mapping, silent catch, sync storage wrappers
- `src/script.js` — console.log cleanup, Firefox ID fallback fix
