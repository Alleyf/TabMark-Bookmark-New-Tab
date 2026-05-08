---
slug: favicon-bridge-wheel-fix
title: 修复书签API桥接器错误、清理console日志、修复滚轮切换
created: 2026-05-08
files:
  - src/bookmarks-api-bridge.js
  - src/script.js
---

## Tasks

1. **Fix bookmarks.getChildren error for id "1" on Firefox**
   - Root: `updateBookmarksDisplay('1')` fallback (line 6640) and `updateBookmarkCards()` pass Chrome ID "1" on Firefox
   - Fix: Add Firefox ID remapping for Chrome root IDs, and fix the fallback call site

2. **Clean console logs**
   - Remove verbose development/debug console.log statements
   - Reduce noise in bridge and wheel switching code

3. **Fix wheel switching folder function**
   - Already has guard flag but may have remaining issues
   - Ensure proper listener lifecycle
