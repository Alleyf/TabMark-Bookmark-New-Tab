/**
 * Firefox书签API桥接器
 * 在Firefox中模拟Chrome的回调风格API
 */

(function() {
  'use strict';

  const { isFirefox, api } = window.BrowserCompat || {
    isFirefox: typeof browser !== 'undefined',
    api: typeof browser !== 'undefined' ? browser : chrome
  };

  if (!isFirefox) {
    // Chrome环境，不需要桥接
    return;
  }

  // 在Firefox中为api.bookmarks添加回调风格的支持
  const originalMethods = {
    getChildren: api.bookmarks.getChildren,
    getTree: api.bookmarks.getTree,
    search: api.bookmarks.search,
    get: api.bookmarks.get,
    create: api.bookmarks.create,
    update: api.bookmarks.update,
    remove: api.bookmarks.remove,
    move: api.bookmarks.move
  };

  // Chrome 根目录ID → Firefox 根目录ID 映射
  const CHROME_TO_FIREFOX_ID = {
    '0': 'root________',
    '1': 'toolbar_____',
    '2': 'unfiled_____',
    '3': 'menu________'
  };

  // 包装每个方法以支持回调
  api.bookmarks.getChildren = function(id, callback) {
    if (!id) {
      if (callback) callback([]);
      return Promise.resolve([]);
    }

    // 映射 Chrome 根目录ID 到 Firefox 等效ID
    const firefoxId = CHROME_TO_FIREFOX_ID[id] || id;

    return originalMethods.getChildren(firefoxId).then(result => {
      const validResult = Array.isArray(result) ? result : [];
      if (callback) callback(validResult);
      return validResult;
    }).catch(() => {
      if (callback) callback([]);
      return [];
    });
  };

  api.bookmarks.getTree = function(callback) {
    return originalMethods.getTree().then(result => {
      if (!result || !Array.isArray(result) || result.length === 0) {
        const emptyResult = [];
        if (callback) callback(emptyResult);
        return emptyResult;
      }

      if (!result[0].children) {
        result[0].children = [];
      }

      if (callback) callback(result);
      return result;
    }).catch(() => {
      if (callback) callback([]);
      return [];
    });
  };

  api.bookmarks.search = function(query, callback) {
    return originalMethods.search(query).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(() => {
      if (callback) callback([]);
      return [];
    });
  };

  api.bookmarks.get = function(idOrIds, callback) {
    return originalMethods.get(idOrIds).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(() => {
      if (callback) callback([]);
      return [];
    });
  };

  api.bookmarks.create = function(bookmark, callback) {
    return originalMethods.create(bookmark).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(() => {
      if (callback) callback(null);
      return null;
    });
  };

  api.bookmarks.update = function(id, changes, callback) {
    return originalMethods.update(id, changes).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(() => {
      if (callback) callback([]);
      return [];
    });
  };

  api.bookmarks.remove = function(id, callback) {
    return originalMethods.remove(id).then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
      return;
    });
  };

  api.bookmarks.move = function(id, destination, callback) {
    return originalMethods.move(id, destination).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(() => {
      if (callback) callback([]);
      return [];
    });
  };

  // 同样的静默包装应用于 storage API
  const originalStorage = {
    local: {
      get: api.storage.local.get,
      set: api.storage.local.set,
      remove: api.storage.local.remove,
      clear: api.storage.local.clear
    },
    sync: {
      get: api.storage.sync.get,
      set: api.storage.sync.set,
      remove: api.storage.sync.remove,
      clear: api.storage.sync.clear
    }
  };

  api.storage.local.get = function(keys, callback) {
    return originalStorage.local.get(keys).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(() => {
      if (callback) callback({});
      return {};
    });
  };

  api.storage.local.set = function(items, callback) {
    return originalStorage.local.set(items).then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
      return;
    });
  };

  api.storage.local.remove = function(keys, callback) {
    return originalStorage.local.remove(keys).then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
      return;
    });
  };

  api.storage.local.clear = function(callback) {
    return originalStorage.local.clear().then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
      return;
    });
  };

  // 同样的静默包装应用于 sync storage API
  api.storage.sync.get = function(keys, callback) {
    return originalStorage.sync.get(keys).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(() => {
      if (callback) callback({});
      return {};
    });
  };

  api.storage.sync.set = function(items, callback) {
    return originalStorage.sync.set(items).then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
      return;
    });
  };

  api.storage.sync.remove = function(keys, callback) {
    return originalStorage.sync.remove(keys).then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
      return;
    });
  };

  api.storage.sync.clear = function(callback) {
    return originalStorage.sync.clear().then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
      return;
    });
  };

  // Tabs API包装
  const originalTabs = {
    create: api.tabs.create,
    query: api.tabs.query,
    update: api.tabs.update,
    remove: api.tabs.remove,
    get: api.tabs.get
  };

  api.tabs.create = function(createProperties, callback) {
    return originalTabs.create(createProperties).then(tab => {
      if (callback) callback(tab);
      return tab;
    }).catch(() => {
      if (callback) callback(null);
      return null;
    });
  };

  api.tabs.query = function(queryInfo, callback) {
    return originalTabs.query(queryInfo).then(tabs => {
      if (callback) callback(tabs);
      return tabs;
    }).catch(() => {
      if (callback) callback([]);
      return [];
    });
  };

  api.tabs.update = function(tabId, updateProperties, callback) {
    return originalTabs.update(tabId, updateProperties).then(tab => {
      if (callback) callback(tab);
      return tab;
    }).catch(() => {
      if (callback) callback([]);
      return [];
    });
  };

  api.tabs.remove = function(tabIds, callback) {
    return originalTabs.remove(tabIds).then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
      return;
    });
  };

  api.tabs.get = function(tabId, callback) {
    return originalTabs.get(tabId).then(tab => {
      if (callback) callback(tab);
      return tab;
    }).catch(() => {
      if (callback) callback(null);
      return null;
    });
  };
})();
