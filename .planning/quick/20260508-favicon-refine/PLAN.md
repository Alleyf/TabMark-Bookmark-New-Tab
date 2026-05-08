---
slug: favicon-refine
title: 修复书签图标加载策略：移除直接 favicon.ico 访问，优化 Chrome 优先使用内置 API
created: 2026-05-08
files:
  - src/favicon-helper.js
  - src/script.js
---

## Root Cause

1. `favicon-helper.js` 的 `getFaviconCandidates()` 将 `https://${domain}/favicon.ico` 作为最后候选源 —— 大多数站点不存在此路径，导致无效请求
2. `script.js` 的 `createBookmarkCard()` 对所有浏览器优先使用 `setFaviconWithFallback`（外部服务），导致 Chrome 无法利用内置的 `_favicon/` API（更可靠、更快）
3. Chrome 专属的 `_favicon/` API 回退分支（`else if (!isFirefox)`）因 `setFaviconWithFallback` 始终存在而成为死代码

## Fix

1. `favicon-helper.js` — 从 `getFaviconCandidates()` 移除 `https://${domain}/favicon.ico`
2. `script.js` — `createBookmarkCard()` 重构：
   - Chrome: 优先使用 `_favicon/` API → 失败后回退到 `setFaviconWithFallback`（仅外部服务）
   - Firefox/其他: 使用 `setFaviconWithFallback`（外部服务）
   - 移除死代码分支
