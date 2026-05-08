---
slug: favicon-refine
title: 修复书签图标加载策略：移除直接 favicon.ico 访问，优化 Chrome 优先使用内置 API
created: 2026-05-08
status: complete
---

## Summary

Refined bookmark favicon loading strategy: removed unreliable direct `favicon.ico` access and optimized Chrome to prefer its built-in `_favicon/` API.

### Root Cause

1. `getFaviconCandidates()` included `https://${domain}/favicon.ico` as last resort — most sites don't serve it, causing wasted requests
2. `createBookmarkCard()` routed all browsers through `setFaviconWithFallback` (external services only), bypassing Chrome's built-in `_favicon/` API
3. Chrome-specific `_favicon/` fallback branch was dead code (never reached)

### Fix

- **`favicon-helper.js`**: Removed `https://${domain}/favicon.ico` from `getFaviconCandidates()` and `getFaviconUrl()`
- **`script.js`**: Reorganized `createBookmarkCard()` favicon logic:
  - Chrome: `_favicon/` API first → `setFaviconWithFallback` fallback (3 external services)
  - Firefox: `setFaviconWithFallback` directly (no `_favicon/` API available)
  - Removed dead code branches (~40 lines → ~15 lines)

### Files Changed

- `src/favicon-helper.js` — removed direct favicon.ico from both candidate lists
- `src/script.js` — reorganized `createBookmarkCard()` favicon loading
