#!/usr/bin/env node

/**
 * Firefox兼容性转换脚本
 * 自动将Chrome API调用转换为兼容Firefox的代码
 */

const fs = require('fs');
const path = require('path');

// 需要处理的文件列表
const filesToProcess = [
  'src/background.js',
  'src/content.js',
  'src/script.js',
  'src/sidepanel-manager.js',
  'src/sidepanel-navigation.js',
  'src/quick-links.js',
  'src/settings.js',
  'src/wallpaper.js',
  'src/search-engine-dropdown.js',
  'src/welcome.js',
  'src/localization.js',
  'src/feature-tips.js',
  'src/gesture-navigation.js',
  'src/progress.js',
  'src/navigation-handler.js',
  'src/bookmark-cleanup.js'
];

// API转换规则
const replacementRules = [
  {
    from: 'chrome.runtime.getURL("chrome://newtab")',
    to: 'chrome.runtime.getURL("src/index.html")', // Firefox不支持chrome://newtab
  },
  {
    from: 'chrome.runtime.onInstalled',
    to: 'api.runtime.onInstalled',
  },
  {
    from: 'chrome.runtime.onMessage',
    to: 'api.runtime.onMessage',
  },
  {
    from: 'chrome.runtime.sendMessage',
    to: 'api.runtime.sendMessage',
  },
  {
    from: 'chrome.storage.local',
    to: 'api.storage.local',
  },
  {
    from: 'chrome.storage.sync',
    to: 'api.storage.sync',
  },
  {
    from: 'chrome.storage.session',
    to: 'api.storage.local', // Firefox没有session,使用local替代
  },
  {
    from: 'chrome.storage.onChanged',
    to: 'api.storage.onChanged',
  },
  {
    from: 'chrome.bookmarks',
    to: 'api.bookmarks',
  },
  {
    from: 'chrome.tabs',
    to: 'api.tabs',
  },
  {
    from: 'chrome.history',
    to: 'api.history',
  },
  {
    from: 'chrome.commands',
    to: 'api.commands',
  },
  {
    from: 'chrome.sidePanel',
    to: 'sidePanelAPI',
  },
  {
    from: 'chrome.action',
    to: isFirefox ? 'browser.browserAction' : 'chrome.action',
  },
  {
    from: 'chrome.runtime.lastError',
    to: 'api.runtime.lastError',
  },
  {
    from: 'chrome.tabGroups',
    to: 'api.tabGroups',
  },
  {
    from: 'chrome.management',
    to: 'api.management',
  }
];

// 需要在文件开头添加的代码
const firefoxCompatHeader = `
// Firefox 兼容性层
const isFirefox = typeof browser !== 'undefined';
const api = isFirefox ? browser : chrome;

// 适配Firefox的sidebar_action API (用于sidepanel.js相关文件)
if (typeof module !== 'undefined' || typeof window !== 'undefined') {
  window.sidePanelAPI = {
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
}
`;

console.log('开始处理Firefox兼容性转换...');

filesToProcess.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`跳过不存在的文件: ${filePath}`);
    return;
  }

  console.log(`正在处理: ${filePath}`);
  let content = fs.readFileSync(fullPath, 'utf-8');

  // 检查是否已经有兼容性代码
  if (content.includes('// Firefox 兼容性层')) {
    console.log(`  - 已包含兼容性代码，跳过`);
    return;
  }

  // 对于非background.js文件，添加兼容性头部
  if (filePath !== 'src/background.js') {
    content = firefoxCompatHeader.trim() + '\n\n' + content;
  }

  // 应用转换规则
  let changedCount = 0;
  replacementRules.forEach(rule => {
    const beforeLength = content.length;
    content = content.split(rule.from).join(rule.to);
    if (content.length !== beforeLength) {
      changedCount++;
    }
  });

  // 保存文件
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`  - 完成，修改了 ${changedCount} 处API调用`);
});

console.log('\n所有文件处理完成！');
console.log('\n注意事项：');
console.log('1. Firefox不支持storage.session,已自动转换为storage.local');
console.log('2. Firefox使用sidebar_action API而非sidePanel API');
console.log('3. Firefox不支持chrome://newtab,已改为src/index.html');
console.log('4. tabGroups API在Firefox中不可用，已保留兼容处理');
