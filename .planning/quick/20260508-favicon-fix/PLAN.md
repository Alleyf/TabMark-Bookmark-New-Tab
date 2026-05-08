---
slug: favicon-fix
title: 修复书签图标无法正常加载显示问题
created: 2026-05-08
files:
  - src/script.js
---

## Root Cause

Chrome 使用 `chrome-extension://<id>/_favicon/` 单次加载 favicon，无回退机制。该 API 在 MV2 下可能因权限/兼容性问题失败，且无外部候选源回退。

Firefox 的 `setFaviconWithFallback` 有完整回退链（4个候选源+超时重试），但只对 Firefox 启用。

## Fix

统一所有浏览器的 favicon 加载策略：
1. 优先使用 `setFaviconWithFallback`（完整回退链，所有浏览器）
2. Chrome 降级：先试 `_favicon/` API，失败后自动回退到外部候选源
3. Firefox 降级：手动候选源回退
