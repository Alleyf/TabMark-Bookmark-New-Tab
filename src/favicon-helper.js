/**
 * Favicon helper - 支持国内环境
 * 使用多个备选服务提高可靠性
 */

// 获取网站favicon的函数 - 使用可靠的多策略方案
function getFaviconUrl(url, size = 32) {
  if (!url) return '';

  try {
    const domain = new URL(url).hostname;

    // 使用多个备选方案，提高可靠性
    const faviconServices = [
      // 方案1: Yandex Favicon（俄罗斯服务，国内可用，速度快）
      `https://favicon.yandex.net/favicon/${domain}`,
      // 方案2: DuckDuckGo Favicon（国外服务，但相对稳定）
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      // 方案3: Google Favicon（可能需要代理，但覆盖最广）
      `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
    ];

    // 默认使用第一个服务（Yandex）
    return faviconServices[0];

    // 如果第一个服务失败，可以通过修改 index 切换到其他服务
    // 例如：将 return faviconServices[0] 改为 return faviconServices[1]
  } catch (e) {
    console.error('Error parsing URL for favicon:', e);
    return '';
  }
}

// 获取候选 favicon 源（用于失败自动回退）
function getFaviconCandidates(url, size = 32) {
  if (!url) return [];

  try {
    const domain = new URL(url).hostname;
    return [
      `https://favicon.yandex.net/favicon/${domain}`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
    ];
  } catch (e) {
    console.error('Error parsing URL for favicon candidates:', e);
    return [];
  }
}

// 绑定 img 元素的 favicon 自动回退逻辑
function setFaviconWithFallback(img, pageUrl, size = 32) {
  if (!img || !pageUrl) return;

  const candidates = getFaviconCandidates(pageUrl, size);
  let index = 0;
  const LOAD_TIMEOUT_MS = 2200;

  const tryNext = () => {
    if (img._faviconTimer) {
      clearTimeout(img._faviconTimer);
      img._faviconTimer = null;
    }
    if (index >= candidates.length) {
      // 所有候选源均失败，保留当前显示的图像（不清空 src）
      return;
    }
    const current = candidates[index++];
    img._faviconTimer = setTimeout(() => {
      tryNext();
    }, LOAD_TIMEOUT_MS);
    img.src = current;
  };

  img.onerror = () => {
    tryNext();
  };

  img.onload = () => {
    if (img._faviconTimer) {
      clearTimeout(img._faviconTimer);
      img._faviconTimer = null;
    }
  };

  tryNext();
}

// 批量获取多个URL的favicon
function getMultipleFavicons(urls, size = 32) {
  const faviconMap = {};
  urls.forEach(url => {
    try {
      faviconMap[url] = getFaviconUrl(url, size);
    } catch (e) {
      console.error('Error getting favicon for', url, e);
      faviconMap[url] = '';
    }
  });
  return faviconMap;
}

// 获取缓存的favicon（使用localStorage避免重复请求）
function getCachedFavicon(url, size = 32) {
  const cacheKey = `favicon_${url}_${size}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    return cached;
  }

  const faviconUrl = getFaviconUrl(url, size);
  localStorage.setItem(cacheKey, faviconUrl);
  return faviconUrl;
}

// 预加载favicon（带错误处理）
function preloadFavicon(url, size = 32) {
  try {
    const faviconUrl = getFaviconUrl(url, size);
    const img = new Image();
    img.onerror = () => {
      console.warn('Failed to load favicon for:', url);
    };
    img.src = faviconUrl;
    return faviconUrl;
  } catch (e) {
    console.error('Error preloading favicon:', e);
    return '';
  }
}

// 为书签创建favicon URL（用于content.js中的兼容）
function createFaviconURL(bookmarkUrl) {
  // 使用浏览器兼容性层
  const { isFirefox, api } = window.BrowserCompat || {
    isFirefox: typeof browser !== 'undefined',
    api: typeof browser !== 'undefined' ? browser : chrome
  };

  if (isFirefox) {
    // Firefox: 使用 Yandex Favicon API（国内可用）
    return getFaviconUrl(bookmarkUrl, 32);
  } else {
    // Chrome: 使用内置 _favicon API
    try {
      const url = new URL(api.runtime.getURL("/_favicon/"));
      url.searchParams.set("pageUrl", bookmarkUrl);
      url.searchParams.set("size", "32");
      return url.toString();
    } catch (e) {
      console.error('Chrome favicon API error:', e);
      // 降级到 Yandex favicon 服务
      return getFaviconUrl(bookmarkUrl, 32);
    }
  }
}

// 导出函数（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getFaviconUrl,
    getFaviconCandidates,
    setFaviconWithFallback,
    getMultipleFavicons,
    getCachedFavicon,
    preloadFavicon,
    createFaviconURL
  };
}

// 暴露到浏览器全局（供 script.js 直接调用）
if (typeof window !== 'undefined') {
  window.getFaviconCandidates = getFaviconCandidates;
  window.setFaviconWithFallback = setFaviconWithFallback;
}
