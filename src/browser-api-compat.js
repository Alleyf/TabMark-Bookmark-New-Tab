// 通用浏览器API兼容性层
// 用于解决Firefox和Chrome扩展API差异
if (typeof window.BrowserCompat === 'undefined') {
    (function() {
        // 检测浏览器环境
        const isFirefox = typeof browser !== 'undefined';
        const api = isFirefox ? browser : chrome;
        
        // 定义兼容性API对象
        const BrowserCompat = {
            isFirefox: isFirefox,
            api: api,
            
            // 适配Firefox的sidebar_action API
            sidePanelAPI: {
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
            },
            
            // 通用的存储API
            storageAPI: {
                get: (keys) => {
                    if (isFirefox) {
                        return api.storage.local.get(keys);
                    }
                    return api.storage.local.get(keys);
                },
                set: (items) => {
                    if (isFirefox) {
                        return api.storage.local.set(items);
                    }
                    return api.storage.local.set(items);
                }
            },
            
            // 通用的书签API
            bookmarkAPI: {
                get: (id) => {
                    if (isFirefox) {
                        return api.bookmarks.get(id);
                    }
                    return api.bookmarks.get(id);
                },
                getChildren: (id) => {
                    if (isFirefox) {
                        return api.bookmarks.getChildren(id);
                    }
                    return api.bookmarks.getChildren(id);
                },
                search: (query) => {
                    if (isFirefox) {
                        return api.bookmarks.search(query);
                    }
                    return api.bookmarks.search(query);
                }
            }
        };
        
        // 将BrowserCompat添加到window对象
        window.BrowserCompat = BrowserCompat;
    })();
}