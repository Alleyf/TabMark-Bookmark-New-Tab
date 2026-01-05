# TabMark Firefox版本 - 安装与测试指南

## 概述

本指南说明如何将TabMark扩展安装到Firefox浏览器，并验证所有功能是否正常工作。

## 安装步骤

### 方法1：使用临时加载（开发测试）

1. 打开Firefox浏览器
2. 在地址栏输入：`about:debugging`
3. 点击"此 Firefox"
4. 点击"临时载入附加组件..."
5. 选择项目根目录下的 `manifest.json` 文件
6. 扩展将立即加载并可以使用

### 方法2：打包安装（生产环境）

1. 将整个扩展目录压缩为ZIP文件（不要包含子文件夹，直接压缩所有文件）
2. 在Firefox中打开：`about:addons`
3. 点击右上角的齿轮图标，选择"从文件安装附加组件..."
4. 选择刚才打包的ZIP文件
5. 安装并启用扩展

## 主要更改

### 1. Manifest版本降级
- 从 Manifest V3 降级到 Manifest V2（Firefox完全支持）
- 添加了 `applications.gecko` 配置
- 将 `chrome_url_overrides` 替换为 `chrome_url_overrides`
- 将 `side_panel` 替换为 `sidebar_action`
- 将 `action` 替换为 `browser_action`

### 2. API兼容性处理

#### Sidebar API
- **Chrome**: `chrome.sidePanel.setOptions()`
- **Firefox**: `browser.sidebarAction.setPanel()`

#### Storage API
- **Chrome**: `chrome.storage.session`（会话存储）
- **Firefox**: `browser.storage.local`（使用本地存储替代）

#### Favicon API
- **Chrome**: `chrome.runtime.getURL("/_favicon/")`
- **Firefox**: 使用Google Favicon API (`https://www.google.com/s2/favicons`)

### 3. 不支持的Firefox功能

以下Chrome API在Firefox中不可用，已做兼容处理：

- `chrome.tabGroups` - 标签分组功能在Firefox中不可用
- `chrome.management` - 扩展管理API部分不可用
- `chrome.storage.session` - 会话存储，改用storage.local

## 功能测试清单

### 基本功能测试

- [ ] 安装扩展后，新标签页正确显示
- [ ] 书签列表正确加载并显示
- [ ] 点击书签能够在新标签页打开
- [ ] 书签文件夹能够正常展开和折叠
- [ ] 添加新书签功能正常
- [ ] 编辑书签功能正常
- [ ] 删除书签功能正常

### 侧边栏功能测试

- [ ] 侧边栏能够正常打开（快捷键 Alt+B / Command+B）
- [ ] 侧边栏显示书签列表
- [ ] 侧边栏内书签点击正常工作
- [ ] 侧边栏导航前进/后退按钮正常
- [ ] 侧边栏主页导航正常
- [ ] 侧边栏能够加载外部网页

### 设置功能测试

- [ ] 设置页面能够正常打开
- [ ] 更新设置后正确保存
- [ ] 设置跨页面同步正常
- [ ] 浮动球开关正常
- [ ] 搜索引擎设置正常

### 外观和UI测试

- [ ] 背景壁纸正确显示
- [ ] 响应式布局在不同窗口大小下正常
- [ ] 图标正确显示（包括favicon）
- [ ] 多语言切换正常
- [ ] 字体和样式正确应用

### 性能测试

- [ ] 书签加载速度快（< 1秒）
- [ ] 滚动流畅，无明显卡顿
- [ ] 侧边栏切换流畅
- [ ] 内存占用合理

## 兼容性问题及解决方案

### 问题1：Favicon不显示

**原因**：Firefox不支持Chrome的`chrome://favicon/` API

**解决方案**：创建了 `favicon-helper.js`，使用Google Favicon API

```javascript
// Firefox使用第三方服务
function getFaviconUrl(url, size = 32) {
  const domain = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}
```

### 问题2：Sidebar API差异

**原因**：Firefox使用`sidebar_action`而非`sidePanel`

**解决方案**：在所有JS文件中添加了API适配层

```javascript
const sidePanelAPI = {
  setOptions: (options) => {
    if (isFirefox) {
      return browser.sidebarAction.setPanel({ panel: options.path });
    }
    return chrome.sidePanel.setOptions(options);
  }
};
```

### 问题3：Storage API差异

**原因**：Firefox不支持`storage.session`

**解决方案**：统一使用`storage.local`

### 问题4：标签分组不可用

**原因**：Firefox原生不支持标签分组

**解决方案**：功能自动降级，不创建标签组但仍能打开多个标签

## 开发调试

### 查看扩展日志

1. 打开 `about:debugging#/runtime/this-firefox`
2. 找到TabMark扩展
3. 点击"检查"
4. 打开开发者工具控制台查看日志

### 调试背景脚本

1. 在扩展管理页面，找到"管理扩展"
2. 点击TabMark的"调试"按钮
3. 背景脚本控制台会自动打开

### 调试侧边栏

1. 打开侧边栏
2. 右键点击侧边栏内容
3. 选择"检查元素"
4. 打开开发者工具

## 已知限制

1. **标签分组**：Firefox不支持标签分组，相关功能会自动降级
2. **Favicon缓存**：使用第三方API，依赖网络连接
3. **存储同步**：Firefox的storage.sync同步机制可能与Chrome略有差异

## 浏览器版本要求

- Firefox >= 60.0（Manifest V2支持）
- 建议使用最新版Firefox以获得最佳体验

## 反馈与问题

如果在使用过程中遇到问题：

1. 检查浏览器控制台是否有错误信息
2. 确认Firefox版本符合要求
3. 尝试重新加载扩展
4. 清除浏览器缓存后重试

## 卸载

1. 打开 `about:addons`
2. 找到TabMark扩展
3. 点击"..."菜单
4. 选择"移除"

## 更新扩展

当有新版本时：

1. 在扩展管理页面找到TabMark
2. 点击"..."菜单
3. 选择"重新加载"或点击齿轮图标中的"更新扩展"

---

**注意**：本扩展同时支持Chrome和Firefox浏览器，代码已做兼容性处理，无需分别维护两个版本。
