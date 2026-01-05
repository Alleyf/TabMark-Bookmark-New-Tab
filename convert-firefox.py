#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Firefox兼容性批量替换脚本
"""

import os
import sys

# 需要处理的文件列表
files_to_process = [
    'src/sidepanel-manager.js',
    'src/content.js',
    'src/script.js',
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
    'src/bookmark-cleanup.js',
    'src/sidepanel-navigation.js'
]

# Firefox兼容性头部代码
firefox_compat_header = '''// Firefox 兼容性层
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

'''

def process_file(filepath):
    """处理单个文件，替换chrome API调用"""
    if not os.path.exists(filepath):
        print(f"  跳过不存在的文件: {filepath}")
        return

    print(f"  正在处理: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已经有兼容性代码
    if 'Firefox 兼容性层' in content:
        print("    已包含兼容性代码，跳过")
        return

    # 添加兼容性头部
    content = firefox_compat_header + content

    # 替换规则
    replacements = [
        ('chrome.runtime.onMessage', 'api.runtime.onMessage'),
        ('chrome.runtime.sendMessage', 'api.runtime.sendMessage'),
        ('chrome.runtime.getURL', 'api.runtime.getURL'),
        ('chrome.runtime.lastError', 'api.runtime.lastError'),
        ('chrome.storage.local', 'api.storage.local'),
        ('chrome.storage.sync', 'api.storage.sync'),
        ('chrome.storage.onChanged', 'api.storage.onChanged'),
        ('chrome.bookmarks', 'api.bookmarks'),
        ('chrome.tabs', 'api.tabs'),
        ('chrome.history', 'api.history'),
        ('chrome.commands', 'api.commands'),
        ('chrome.sidePanel', 'sidePanelAPI'),
        ('chrome.action', 'api.action' if 'isChrome' in content else 'api.browserAction'),
    ]

    # 应用替换
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)

    # 保存文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("    完成")

def main():
    print("开始批量替换Chrome API为Firefox兼容代码...")
    print()

    for filepath in files_to_process:
        process_file(filepath)

    print()
    print("所有文件处理完成！")

if __name__ == '__main__':
    main()
