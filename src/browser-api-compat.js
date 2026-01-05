/**
 * 浏览器API兼容性层
 * 自动适配Chrome和Firefox API差异
 */

(function() {
  'use strict';

  // 确定浏览器类型
  const isFirefox = typeof browser !== 'undefined';
  const isChrome = typeof chrome !== 'undefined' && !isFirefox;

  // 选择正确的API命名空间
  const api = isFirefox ? browser : (isChrome ? chrome : null);

  if (!api) {
    console.error('无法识别浏览器API');
    return;
  }

  // 全局变量，供其他脚本使用
  window.isFirefox = isFirefox;
  window.isChrome = isChrome;

  /**
   * 将浏览器API包装为Promise返回的函数
   */
  const wrapAsync = (fn) => {
    return function(...args) {
      return new Promise((resolve, reject) => {
        const callback = (result) => {
          if (api.runtime.lastError) {
            reject(new Error(api.runtime.lastError.message));
          } else {
            resolve(result);
          }
        };

        try {
          fn(...args, callback);
        } catch (error) {
          reject(error);
        }
      });
    };
  };

  // 导出浏览器API包装器
  window.browserAPI = {
    // Runtime API
    runtime: {
      sendMessage: isFirefox
        ? (...args) => api.runtime.sendMessage(...args)
        : wrapAsync((message, callback) => api.runtime.sendMessage(message, callback)),
      onMessage: api.runtime.onMessage,
      getURL: api.runtime.getURL.bind(api.runtime),
      getManifest: api.runtime.getManifest,
      onInstalled: api.runtime.onInstalled,
      id: api.runtime.id
    },

    // Tabs API
    tabs: {
      create: wrapAsync((options, callback) => api.tabs.create(options, callback)),
      query: wrapAsync((queryInfo, callback) => api.tabs.query(queryInfo, callback)),
      update: wrapAsync((tabId, updateInfo, callback) => api.tabs.update(tabId, updateInfo, callback)),
      remove: wrapAsync((tabIds, callback) => api.tabs.remove(tabIds, callback)),
      onActivated: api.tabs.onActivated,
      onUpdated: api.tabs.onUpdated,
      onRemoved: api.tabs.onRemoved,
      get: wrapAsync((tabId, callback) => api.tabs.get(tabId, callback))
    },

    // Storage API
    storage: {
      local: {
        get: wrapAsync((keys, callback) => api.storage.local.get(keys, callback)),
        set: wrapAsync((items, callback) => api.storage.local.set(items, callback)),
        remove: wrapAsync((keys, callback) => api.storage.local.remove(keys, callback)),
        clear: wrapAsync((callback) => api.storage.local.clear(callback))
      },
      sync: {
        get: wrapAsync((keys, callback) => api.storage.sync.get(keys, callback)),
        set: wrapAsync((items, callback) => api.storage.sync.set(items, callback)),
        remove: wrapAsync((keys, callback) => api.storage.sync.remove(keys, callback)),
        clear: wrapAsync((callback) => api.storage.sync.clear(callback))
      },
      onChanged: api.storage.onChanged
    },

    // Bookmarks API
    bookmarks: {
      getTree: wrapAsync((callback) => api.bookmarks.getTree(callback)),
      search: wrapAsync((query, callback) => api.bookmarks.search(query, callback)),
      create: wrapAsync((bookmark, callback) => api.bookmarks.create(bookmark, callback)),
      remove: wrapAsync((id, callback) => api.bookmarks.remove(id, callback)),
      update: wrapAsync((id, changes, callback) => api.bookmarks.update(id, changes, callback)),
      move: wrapAsync((id, destination, callback) => api.bookmarks.move(id, destination, callback)),
      getChildren: wrapAsync((id, callback) => api.bookmarks.getChildren(id, callback)),
      onCreated: api.bookmarks.onCreated,
      onRemoved: api.bookmarks.onRemoved,
      onChanged: api.bookmarks.onChanged,
      onMoved: api.bookmarks.onMoved
    },

    // Commands API
    commands: {
      getAll: wrapAsync((callback) => api.commands.getAll(callback)),
      onCommand: api.commands.onCommand
    },

    // History API
    history: {
      search: wrapAsync((query, callback) => api.history.search(query, callback)),
      addUrl: wrapAsync((details, callback) => api.history.addUrl(details, callback))
    },

    // Side Panel API (Chrome: sidePanel, Firefox: sidebar_action)
    sidePanel: isFirefox ? undefined : {
      setOptions: wrapAsync((options, callback) => api.sidePanel.setOptions(options, callback)),
      getOptions: wrapAsync((callback) => api.sidePanel.getOptions(callback))
    },

    // Sidebar Action API (Firefox)
    sidebarAction: isFirefox ? {
      open: wrapAsync((callback) => api.sidebarAction.open(callback)),
      close: wrapAsync((callback) => api.sidebarAction.close(callback)),
      isOpen: wrapAsync((callback) => api.sidebarAction.isOpen(callback)),
      setPanel: wrapAsync((options, callback) => api.sidebarAction.setPanel(options, callback)),
      setTitle: wrapAsync((details, callback) => api.sidebarAction.setTitle(details, callback)),
      setIcon: wrapAsync((details, callback) => api.sidebarAction.setIcon(details, callback))
    } : undefined
  };

  // 向后兼容：在全局作用域中定义chrome对象（仅用于Firefox）
  if (isFirefox) {
    window.chrome = {
      runtime: {
        sendMessage: (...args) => api.runtime.sendMessage(...args),
        onMessage: api.runtime.onMessage,
        getURL: api.runtime.getURL.bind(api.runtime),
        getManifest: api.runtime.getManifest,
        onInstalled: api.runtime.onInstalled,
        id: api.runtime.id,
        OnInstalledReason: {
          INSTALL: 'install',
          UPDATE: 'update',
          CHROME_UPDATE: 'chrome_update',
          SHARED_MODULE_UPDATE: 'shared_module_update'
        }
      },
      tabs: {
        create: wrapAsync((options, callback) => api.tabs.create(options, callback)),
        query: wrapAsync((queryInfo, callback) => api.tabs.query(queryInfo, callback)),
        update: wrapAsync((tabId, updateInfo, callback) => api.tabs.update(tabId, updateInfo, callback)),
        remove: wrapAsync((tabIds, callback) => api.tabs.remove(tabIds, callback)),
        onActivated: api.tabs.onActivated,
        onUpdated: api.tabs.onUpdated,
        onRemoved: api.tabs.onRemoved,
        get: wrapAsync((tabId, callback) => api.tabs.get(tabId, callback))
      },
      storage: {
        local: {
          get: wrapAsync((keys, callback) => api.storage.local.get(keys, callback)),
          set: wrapAsync((items, callback) => api.storage.local.set(items, callback)),
          remove: wrapAsync((keys, callback) => api.storage.local.remove(keys, callback)),
          clear: wrapAsync((callback) => api.storage.local.clear(callback))
        },
        sync: {
          get: wrapAsync((keys, callback) => api.storage.sync.get(keys, callback)),
          set: wrapAsync((items, callback) => api.storage.sync.set(items, callback)),
          remove: wrapAsync((keys, callback) => api.storage.sync.remove(keys, callback)),
          clear: wrapAsync((callback) => api.storage.sync.clear(callback))
        },
        onChanged: api.storage.onChanged
      },
      bookmarks: {
        getTree: wrapAsync((callback) => api.bookmarks.getTree(callback)),
        search: wrapAsync((query, callback) => api.bookmarks.search(query, callback)),
        create: wrapAsync((bookmark, callback) => api.bookmarks.create(bookmark, callback)),
        remove: wrapAsync((id, callback) => api.bookmarks.remove(id, callback)),
        update: wrapAsync((id, changes, callback) => api.bookmarks.update(id, changes, callback)),
        move: wrapAsync((id, destination, callback) => api.bookmarks.move(id, destination, callback)),
        getChildren: wrapAsync((id, callback) => api.bookmarks.getChildren(id, callback)),
        onCreated: api.bookmarks.onCreated,
        onRemoved: api.bookmarks.onRemoved,
        onChanged: api.bookmarks.onChanged,
        onMoved: api.bookmarks.onMoved
      },
      commands: {
        getAll: wrapAsync((callback) => api.commands.getAll(callback)),
        onCommand: api.commands.onCommand
      },
      history: {
        search: wrapAsync((query, callback) => api.history.search(query, callback)),
        addUrl: wrapAsync((details, callback) => api.history.addUrl(details, callback))
      },
      sidePanel: {
        setOptions: wrapAsync((options, callback) => {
          // Firefox不支持sidePanel API，使用sidebar_action代替
          if (api.sidebarAction) {
            return api.sidebarAction.setPanel({ panel: options.path }, callback);
          }
          if (callback) callback();
        }),
        getOptions: wrapAsync((callback) => {
          // Firefox不支持getOptions
          if (callback) callback({});
        })
      },
      runtime: {
        lastError: null
      }
    };

    // 添加tabGroups API的空实现（Firefox不支持）
    window.chrome.tabGroups = {
      query: wrapAsync((queryInfo, callback) => {
        if (callback) callback([]);
      }),
      get: wrapAsync((groupIds, callback) => {
        if (callback) callback([]);
      })
    };

    // 添加management API的空实现（Firefox不支持）
    window.chrome.management = {
      getSelf: wrapAsync((callback) => {
        if (callback) callback({});
      })
    };

    // 添加favicon API的兼容包装
    window.chrome.runtime.getURL = api.runtime.getURL;
  }

  console.log('浏览器API兼容层已加载，浏览器类型:', isFirefox ? 'Firefox' : 'Chrome');
})();
