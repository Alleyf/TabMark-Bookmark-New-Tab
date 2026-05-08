---
slug: bookmark-load-fix
title: 修复书签无法正常加载显示的bug
created: 2026-05-08
status: complete
---

## Summary

Fixed a critical bug where bookmarks couldn't load/display properly on the new tab page in Chrome.

### Root Cause

`updateBookmarkCards()` chained `.catch()` on `api.bookmarks.getChildren(parentId, callback)`. In Chrome, `chrome.bookmarks.getChildren` is callback-based and returns `void`. Accessing `.catch` on `undefined` threw a `TypeError`, killing the entire `DOMContentLoaded` callback's initialization code after the failed call.

### Fix

- Replaced `.catch()` chaining with proper callback-style error handling via `api.runtime.lastError`
- Added `handleBookmarksResult()` helper to deduplicate display+save logic
- Fallback to bookmark toolbar root ID on fetch failure

### Files Changed

- `src/script.js` — lines 1078-1123: Rewrote `updateBookmarkCards()` error handling

### Verification

- `updateBookmarkCards()` no longer throws on first call
- All subsequent `DOMContentLoaded` initialization code executes
- Bookmark cards, sidebar tree, search icons, mouse nav all initialize correctly
