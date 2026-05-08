---
slug: wheel-switch-fix
title: 修复滚轮切换文件夹功能
created: 2026-05-08
files:
  - src/script.js
---

## Root Cause

`initWheelSwitching()` was called from `initDefaultFoldersTabs()` which runs every time folder tabs are created/recreated. Each call created a new `wheelHandler` closure and added it to `<main>` via `addEventListener`. The `wheelEventListener` tracking variable was local to each closure, so old listeners were never removable. Multiple listeners accumulated, all firing simultaneously on wheel events.

## Fix

1. Module-level `let wheelSwitchingInitialized = false` guard flag
2. `initWheelSwitching()` checks and sets the flag on first call, returns early after
3. Call moved once to main DOMContentLoaded callback alongside `initMouseSideButtonNavigation()`
4. Removed from `initDefaultFoldersTabs()`
