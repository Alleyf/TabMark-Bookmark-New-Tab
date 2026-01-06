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

  // 包装每个方法以支持回调
  api.bookmarks.getChildren = function(id, callback) {
    // 验证参数
    if (!id) {
      console.warn('bookmarks.getChildren: invalid id parameter:', id);
      if (callback) callback([]);
      return Promise.resolve([]);
    }
    
    return originalMethods.getChildren(id).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(error => {
      console.error('bookmarks.getChildren error:', error);
      if (callback) callback([]);
      // 不再抛出错误，以避免错误传播到调用栈
      return [];
    });
  };

  api.bookmarks.getTree = function(callback) {
    return originalMethods.getTree().then(result => {
      // 确保结果是有效的数组
      const validResult = Array.isArray(result) ? result : [];
      if (callback) callback(validResult);
      return validResult;
    }).catch(error => {
      console.error('bookmarks.getTree error:', error);
      if (callback) callback([]);
      // 不再抛出错误，以避免错误传播到调用栈
      return [];
    });
  };

  api.bookmarks.search = function(query, callback) {
    return originalMethods.search(query).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(error => {
      console.error('bookmarks.search error:', error);
      if (callback) callback([]);
      // 不再抛出错误，以避免错误传播到调用栈
      return [];
    });
  };

  api.bookmarks.get = function(idOrIds, callback) {
    return originalMethods.get(idOrIds).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(error => {
      console.error('bookmarks.get error:', error);
      if (callback) callback([]);
      // 不再抛出错误，以避免错误传播到调用栈
      return [];
    });
  };

  api.bookmarks.create = function(bookmark, callback) {
    return originalMethods.create(bookmark).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(error => {
      console.error('bookmarks.create error:', error);
      if (callback) callback(null);
      // 不再抛出错误，以避免错误传播到调用栈
      return null;
    });
  };

  api.bookmarks.update = function(id, changes, callback) {
    return originalMethods.update(id, changes).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(error => {
      console.error('bookmarks.update error:', error);
      if (callback) callback([]);
      // 不再抛出错误，以避免错误传播到调用栈
      return [];
    });
  };

  api.bookmarks.remove = function(id, callback) {
    return originalMethods.remove(id).then(() => {
      if (callback) callback();
    }).catch(error => {
      console.error('bookmarks.remove error:', error);
      if (callback) callback();
      // 不再抛出错误，以避免错误传播到调用栈
      return;
    });
  };

  api.bookmarks.move = function(id, destination, callback) {
    return originalMethods.move(id, destination).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(error => {
      console.error('bookmarks.move error:', error);
      if (callback) callback([]);
      // 不再抛出错误，以避免错误传播到调用栈
      return [];
    });
  };

  // 同样包装storage API
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

  // Storage包装
  api.storage.local.get = function(keys, callback) {
    return originalStorage.local.get(keys).then(result => {
      if (callback) callback(result);
      return result;
    }).catch(error => {
      console.error('storage.local.get error:', error);
      if (callback) callback({});
      // 不再抛出错误，以避免错误传播到调用栈
      return {};
    });
  };

  api.storage.local.set = function(items, callback) {
    return originalStorage.local.set(items).then(() => {
      if (callback) callback();
    }).catch(error => {
      console.error('storage.local.set error:', error);
      if (callback) callback();
      // 不再抛出错误，以避免错误传播到调用栈
      return;
    });
  };

  api.storage.local.remove = function(keys, callback) {
    return originalStorage.local.remove(keys).then(() => {
      if (callback) callback();
    }).catch(error => {
      console.error('storage.local.remove error:', error);
      if (callback) callback();
      // 不再抛出错误，以避免错误传播到调用栈
      return;
    });
  };

  api.storage.local.clear = function(callback) {
    return originalStorage.local.clear().then(() => {
      if (callback) callback();
    }).catch(error => {
      console.error('storage.local.clear error:', error);
      if (callback) callback();
      // 不再抛出错误，以避免错误传播到调用栈
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
    }).catch(error => {
      console.error('tabs.create error:', error);
      if (callback) callback(null);
      // 不再抛出错误，以避免错误传播到调用栈
      return null;
    });
  };

  api.tabs.query = function(queryInfo, callback) {
    return originalTabs.query(queryInfo).then(tabs => {
      if (callback) callback(tabs);
      return tabs;
    }).catch(error => {
      console.error('tabs.query error:', error);
      if (callback) callback([]);
      // 不再抛出错误，以避免错误传播到调用栈
      return [];
    });
  };

  api.tabs.update = function(tabId, updateProperties, callback) {
    return originalTabs.update(tabId, updateProperties).then(tab => {
      if (callback) callback(tab);
      return tab;
    }).catch(error => {
      console.error('tabs.update error:', error);
      if (callback) callback([]);
      // 不再抛出错误，以避免错误传播到调用栈
      return [];
    });
  };

  api.tabs.remove = function(tabIds, callback) {
    return originalTabs.remove(tabIds).then(() => {
      if (callback) callback();
    }).catch(error => {
      console.error('tabs.remove error:', error);
      if (callback) callback();
      // 不再抛出错误，以避免错误传播到调用栈
      return;
    });
  };

  api.tabs.get = function(tabId, callback) {
    return originalTabs.get(tabId).then(tab => {
      if (callback) callback(tab);
      return tab;
    }).catch(error => {
      console.error('tabs.get error:', error);
      if (callback) callback(null);
      // 不再抛出错误，以避免错误传播到调用栈
      return null;
    });
  };

  console.log('Firefox API桥接器已加载');
})();
