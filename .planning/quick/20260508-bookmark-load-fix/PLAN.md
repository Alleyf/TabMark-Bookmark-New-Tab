---
slug: bookmark-load-fix
title: 修复书签无法正常加载显示的bug
created: 2026-05-08
files:
  - src/script.js
---

## Root Cause

`updateBookmarkCards()` in `src/script.js` chained `.catch()` on the return value of `api.bookmarks.getChildren(parentId, callback)`. In Chrome, `chrome.bookmarks.getChildren` is callback-based and returns `void`, so `.catch()` on `undefined` threw `TypeError: Cannot read properties of undefined (reading 'catch')`.

This error propagated out of `updateBookmarkCards()` at line 1135 of the `DOMContentLoaded` callback, killing all further initialization:
- `updateSearchEngineIcon` — search engine icon never set
- `updateSidebarDefaultBookmarkIndicator` — sidebar indicators never updated
- `waitForFirstCategory` → `initDefaultFoldersTabs` — sidebar category tree never rendered
- `initMouseSideButtonNavigation` — mouse navigation never initialized
- Fallback `bookmarks-list.dataset.parentId = '1'` — root directory fallback never applied

## Fix

Replaced the `.catch()` chaining with proper callback-style error handling using `api.runtime.lastError`:
1. Removed `.catch(error => {...})` and `.then(...).catch(...)` chains
2. Added `api.runtime.lastError` check inside the callback
3. Fallback to `firefoxDefaultId` ('1') on error using nested callback
4. Extracted duplicated display+save logic into `handleBookmarksResult()` helper

## Impact

Chrome users will now see:
- Bookmark cards loaded on new tab (previously broken)
- Sidebar bookmark tree rendered correctly
- Search engine icons displayed
- Mouse side-button navigation working
