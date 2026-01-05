# 跨浏览器兼容性实现说明

## 概述

TabMark扩展现在完全兼容Chrome和Firefox浏览器，通过统一的代码库和兼容性层实现。本文档说明兼容性实现的技术细节。

## 兼容性架构

### 1. 浏览器检测层

每个JS文件都包含浏览器检测代码：

```javascript
const isFirefox = typeof browser !== 'undefined';
const api = isFirefox ? browser : chrome;
```

### 2. API抽象层

所有浏览器API调用都通过`api`对象进行，实现自动适配：

```javascript
// 自动选择正确的API
api.runtime.sendMessage(...)
api.storage.local.get(...)
api.bookmarks.getTree(...)
```

## 主要API映射

### Runtime API

| 功能 | Chrome | Firefox |
|------|--------|---------|
| 发送消息 | `chrome.runtime.sendMessage` | `browser.runtime.sendMessage` |
| 监听消息 | `chrome.runtime.onMessage` | `browser.runtime.onMessage` |
| 获取URL | `chrome.runtime.getURL` | `browser.runtime.getURL` |
| 扩展安装事件 | `chrome.runtime.onInstalled` | `browser.runtime.onInstalled` |

### Storage API

| 功能 | Chrome | Firefox |
|------|--------|---------|
| 本地存储 | `chrome.storage.local` | `browser.storage.local` |
| 同步存储 | `chrome.storage.sync` | `browser.storage.sync` |
| 变更事件 | `chrome.storage.onChanged` | `browser.storage.onChanged` |

### Sidebar API

| 功能 | Chrome (MV3) | Firefox (MV2) |
|------|--------------|---------------|
| 设置面板 | `chrome.sidePanel.setOptions` | `browser.sidebarAction.setPanel` |
| 打开面板 | `chrome.sidePanel.open` | `browser.sidebarAction.open` |

### Bookmarks API

| 功能 | Chrome | Firefox |
|------|--------|---------|
| 获取树 | `chrome.bookmarks.getTree` | `browser.bookmarks.getTree` |
| 搜索 | `chrome.bookmarks.search` | `browser.bookmarks.search` |
| 创建 | `chrome.bookmarks.create` | `browser.bookmarks.create` |

## 特殊处理

### 1. Favicon获取

Chrome和Firefox对favicon的处理完全不同：

**Chrome方式：**
```javascript
const url = new URL(chrome.runtime.getURL("/_favicon/"));
url.searchParams.set("pageUrl", bookmarkUrl);
url.searchParams.set("size", "32");
return url.toString();
```

**Firefox方式：**
```javascript
const domain = new URL(url).hostname;
return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
```

**统一接口：**
```javascript
function createFaviconURL(bookmarkUrl) {
  if (isFirefox) {
    return getFaviconUrl(bookmarkUrl, 32); // 使用第三方服务
  } else {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", bookmarkUrl);
    url.searchParams.set("size", "32");
    return url.toString();
  }
}
```

### 2. Sidebar Action适配

Firefox使用`sidebar_action`，Chrome使用`sidePanel`：

```javascript
const sidePanelAPI = {
  setOptions: (options) => {
    if (isFirefox) {
      if (api.sidebarAction) {
        return Promise.resolve(api.sidebarAction.setPanel({ panel: options.path }));
      }
      return Promise.resolve();
    }
    return api.sidePanel.setOptions(options);
  },
  open: (options) => {
    if (isFirefox) {
      if (api.sidebarAction) {
        return Promise.resolve(api.sidebarAction.open());
      }
      return Promise.resolve();
    }
    return api.sidePanel.open(options);
  }
};
```

### 3. Storage Session替代

Chrome的`storage.session`在Firefox中不可用，使用`storage.local`替代：

```javascript
// Chrome: chrome.storage.session.set(...)
// Firefox: chrome.storage.local.set(...)

api.storage.local.set({ ... })  // 两浏览器通用
```

## Manifest版本差异

### Chrome (Manifest V3)

```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js"
  },
  "side_panel": {
    "default_path": "sidepanel.html"
  }
}
```

### Firefox (Manifest V2)

```json
{
  "manifest_version": 2,
  "background": {
    "scripts": ["background.js"]
  },
  "sidebar_action": {
    "default_panel": "sidepanel.html"
  },
  "applications": {
    "gecko": {
      "id": "tabmark@example.com",
      "strict_min_version": "60.0"
    }
  }
}
```

## 不支持的功能处理

### TabGroups API

Firefox不支持标签分组，添加了兼容处理：

```javascript
// 在background.js中
if (chrome.tabGroups) {
  chrome.tabGroups.update(groupId, { ... });
} else {
  // Firefox不支持标签分组，只打开标签
  sendResponse({ success: true, warning: 'tabGroups API 不可用' });
}
```

### Management API

Firefox部分不支持扩展管理API，添加了空实现：

```javascript
// 在browser-api-compat.js中
window.chrome.management = {
  getSelf: wrapAsync((callback) => {
    if (callback) callback({});
  })
};
```

## 代码结构

### 文件组织

```
src/
├── browser-api-compat.js    # 浏览器API兼容层
├── favicon-helper.js         # Favicon跨浏览器处理
├── background.js            # 背景脚本（已处理API兼容）
├── content.js              # 内容脚本（已处理API兼容）
├── script.js               # 主脚本（已处理API兼容）
├── sidepanel-manager.js     # 侧边栏管理（已处理API兼容）
└── ...其他文件
```

### API调用流程

```
用户交互
    ↓
script.js (使用 api.*)
    ↓
background.js (使用 api.*)
    ↓
browser API (chrome.* 或 browser.*)
    ↓
浏览器功能实现
```

## 构建和部署

### 开发环境

1. **Chrome开发：**
   ```bash
   # 直接加载扩展
   # chrome://extensions -> 加载已解压的扩展程序
   ```

2. **Firefox开发：**
   ```bash
   # 临时加载
   # about:debugging -> 临时载入附加组件
   ```

### 生产部署

需要为不同浏览器维护不同的manifest文件：

- `manifest-chrome.json` (Manifest V3)
- `manifest-firefox.json` (Manifest V2)
- `manifest.json` (当前版本，使用构建脚本切换)

## 测试策略

### 功能测试矩阵

| 功能 | Chrome | Firefox | 备注 |
|------|--------|---------|------|
| 书签列表 | ✅ | ✅ | 完全兼容 |
| 侧边栏 | ✅ | ✅ | API不同但功能相同 |
| 搜索引擎 | ✅ | ✅ | 完全兼容 |
| 设置同步 | ✅ | ✅ | 完全兼容 |
| Favicon显示 | ✅ | ✅ | 实现方式不同 |
| 标签分组 | ✅ | ❌ | Firefox不支持 |
| 会话存储 | ✅ | ⚠️ | Firefox用local替代 |

### 浏览器版本

- **Chrome**: 最新稳定版 (Manifest V3)
- **Firefox**: >= 60.0 (Manifest V2)

## 最佳实践

### 1. 始终使用抽象API

```javascript
// ✅ 好的做法
api.storage.local.get(...)

// ❌ 不好的做法
chrome.storage.local.get(...)

// ❌ 不好的做法
browser.storage.local.get(...)
```

### 2. 使用兼容性层

```javascript
// 使用提供的辅助函数
const faviconUrl = createFaviconURL(bookmarkUrl);
sidePanelAPI.setOptions({ path: 'sidepanel.html' });
```

### 3. 条件检查

```javascript
if (chrome.tabGroups) {
  // 仅在Chrome中执行
  chrome.tabGroups.update(...);
}
```

## 维护和更新

### 添加新功能时

1. 检查目标浏览器的API支持
2. 使用抽象的`api`对象
3. 添加兼容性处理
4. 测试两种浏览器

### API变更时

1. 更新兼容性层
2. 添加polyfill如果需要
3. 更新测试用例
4. 更新文档

## 参考资源

- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [Firefox WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Browser API Differences](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_compatibility_for_browsers)
- [Manifest Version 3](https://developer.chrome.com/docs/extensions/migrating/)
- [Manifest Version 2 (Firefox)](https://extensionworkshop.com/documentation/develop/manifest.json/)

## 总结

通过统一的兼容性层，TabMark扩展实现了：

1. ✅ 单一代码库，支持Chrome和Firefox
2. ✅ 自动检测浏览器类型
3. ✅ 统一的API调用接口
4. ✅ 优雅降级不支持的功能
5. ✅ 最小化代码维护成本

这种架构使得扩展能够同时支持两个主要浏览器，同时保持代码的简洁和可维护性。
