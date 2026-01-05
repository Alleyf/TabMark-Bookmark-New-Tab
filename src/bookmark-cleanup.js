// Firefox 兼容性层
const isFirefox = typeof browser !== 'undefined';
const api = isFirefox ? browser : chrome;

// 适配Firefox的sidebar_action API
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

import { featureTips } from './feature-tips.js';

// 书签清理插件相关常量
const CLEANUP_EXTENSION = {
  ID: 'aeehapalakdoclgmfeondmephgiandef',
  STORE_URL: 'https://chromewebstore.google.com/detail/lazycat-bookmark-cleaner/aeehapalakdoclgmfeondmephgiandef'
};

// 检查插件是否已安装
function checkExtensionInstalled() {
  return new Promise((resolve, reject) => {
    chrome.management.get(CLEANUP_EXTENSION.ID, (extensionInfo) => {
      if (api.runtime.lastError) {
        reject(new Error('Extension not installed'));
      } else {
        resolve(true);
      }
    });
  });
}

// 添加从设置中打开清理工具的处理函数
function initBookmarkCleanupSettings() {
  const openCleanupButton = document.getElementById('open-bookmark-cleanup');
  if (openCleanupButton) {
    openCleanupButton.addEventListener('click', async () => {
      try {
        await checkExtensionInstalled();
        window.open(`chrome-extension://${CLEANUP_EXTENSION.ID}/index.html`, '_blank');
      } catch (error) {
        const confirmInstall = confirm(chrome.i18n.getMessage('bookmarkCleanupNotInstalled'));
        if (confirmInstall) {
          window.open(CLEANUP_EXTENSION.STORE_URL, '_blank');
        }
      }
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initBookmarkCleanupSettings();
});

export {}; 