---
slug: wheel-switch-fix
title: 修复滚轮切换文件夹功能
created: 2026-05-08
status: complete
---

## Summary

Fixed the wheel switching function where duplicate wheel event listeners accumulated, causing erratic folder switching behavior.

### Root Cause

`initWheelSwitching()` was called from inside `initDefaultFoldersTabs()` (line 1549), which runs on every tab initialization, folder change in settings, and `defaultFoldersChanged` event. Each call created a new `wheelHandler` closure with its own `wheelEventListener` variable (scoped to the closure), so old listeners were never tracked or removed. Multiple listeners accumulated on `<main>`, all firing simultaneously on each wheel event and calling `switchToFolder()` redundantly.

### Fix

- Added module-level `wheelSwitchingInitialized` flag
- `initWheelSwitching()` now checks the flag and returns early on subsequent calls
- Moved one-time call to main `DOMContentLoaded` callback (at line 6641)
- Removed the call from `initDefaultFoldersTabs()`

### Files Changed

- `src/script.js` — 3 edits: guard flag, function guard, single call site, removal from initDefaultFoldersTabs
