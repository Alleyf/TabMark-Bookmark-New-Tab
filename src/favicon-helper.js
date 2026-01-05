/**
 * Firefox favicon 兼容性处理
 * Firefox不支持Chrome的favicon API，需要使用替代方案
 */

// 获取网站favicon的函数
function getFaviconUrl(url, size = 32) {
  if (!url) return '';

  // Firefox兼容：使用Google的favicon服务或DuckDuckGo
  // 优先级：Google Favicon API > DuckDuckGo > 默认图标
  try {
    const domain = new URL(url).hostname;

    // 方案1：Google Favicon API (最可靠)
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;

    // 方案2：DuckDuckGo Favicon API
    const ddgFavicon = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

    // 方案3：Favicon Grabber
    const faviconGrabber = `https://favicon.yandex.net/favicon/${domain}`;

    // 返回Google的，最可靠
    return googleFavicon;
  } catch (e) {
    console.error('Error parsing URL for favicon:', e);
    return '';
  }
}

// 批量获取多个URL的favicon
function getMultipleFavicons(urls, size = 32) {
  const faviconMap = {};
  urls.forEach(url => {
    faviconMap[url] = getFaviconUrl(url, size);
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

// 预加载favicon
function preloadFavicon(url, size = 32) {
  const faviconUrl = getFaviconUrl(url, size);
  const img = new Image();
  img.src = faviconUrl;
  return faviconUrl;
}

// 为书签创建favicon URL（用于content.js中的兼容）
function createFaviconURL(bookmarkUrl) {
  const isFirefox = typeof browser !== 'undefined';

  if (isFirefox) {
    // Firefox使用第三方服务
    return getFaviconUrl(bookmarkUrl, 32);
  } else {
    // Chrome使用内置favicon API
    try {
      const url = new URL(chrome.runtime.getURL("/_favicon/"));
      url.searchParams.set("pageUrl", bookmarkUrl);
      url.searchParams.set("size", "32");
      return url.toString();
    } catch (e) {
      // 降级到第三方服务
      return getFaviconUrl(bookmarkUrl, 32);
    }
  }
}

// 导出函数（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getFaviconUrl,
    getMultipleFavicons,
    getCachedFavicon,
    preloadFavicon,
    createFaviconURL
  };
}
