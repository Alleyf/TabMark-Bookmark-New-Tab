/**
 * Firefox favicon 兼容性处理
 * Firefox不支持Chrome的favicon API，使用Google Favicon API作为可靠的替代方案
 */

// 获取网站favicon的函数 - 使用Google Favicon API（最可靠和稳定）
function getFaviconUrl(url, size = 32) {
  if (!url) return '';

  try {
    const domain = new URL(url).hostname;
    // 使用 Google Favicon API - 这是最可靠和快速的方法
    // Google 会直接获取网站的高质量 favicon
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
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
  // 使用浏览器兼容性层
  const { isFirefox, api } = window.BrowserCompat || {
    isFirefox: typeof browser !== 'undefined',
    api: typeof browser !== 'undefined' ? browser : chrome
  };

  if (isFirefox) {
    // Firefox: 使用 Google Favicon API
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
      // 降级到 Google favicon 服务
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


