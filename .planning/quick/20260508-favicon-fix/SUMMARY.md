---
slug: favicon-fix
title: 修复书签图标无法正常加载显示问题
created: 2026-05-08
status: complete
---

## Summary

Fixed bookmark favicon loading by unifying the fallback chain for all browsers.

### Root Cause

Chrome used `chrome-extension://<id>/_favicon/` API with no fallback on failure. Firefox had `setFaviconWithFallback` with 4 external candidate sources + timeout retry, but only for Firefox.

### Fix

- All browsers try `setFaviconWithFallback` first (4-source fallback chain)
- Chrome: try `_favicon/` API → fall back to external candidates on error
- Firefox: manual candidate fallback if `setFaviconWithFallback` unavailable

### Files Changed

- `src/script.js` — `createBookmarkCard()` favicon loading logic
