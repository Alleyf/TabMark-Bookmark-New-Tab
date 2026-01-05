// 使用通用浏览器API兼容性层
const { isFirefox, api, sidePanelAPI } = window.BrowserCompat || {
  isFirefox: typeof browser !== 'undefined',
  api: typeof browser !== 'undefined' ? browser : chrome,
  sidePanelAPI: {
    setOptions: (options) => {
      const isFF = typeof browser !== 'undefined';
      const apiFF = isFF ? browser : chrome;
      if (isFF) {
        if (apiFF.sidebarAction) {
          return Promise.resolve(apiFF.sidebarAction.setPanel({ panel: options.path }));
        }
        return Promise.resolve();
      }
      return apiFF.sidePanel.setOptions(options);
    },
    open: (options) => {
      const isFF = typeof browser !== 'undefined';
      const apiFF = isFF ? browser : chrome;
      if (isFF) {
        if (apiFF.sidebarAction) {
          return Promise.resolve(apiFF.sidebarAction.open());
        }
        return Promise.resolve();
      }
      return apiFF.sidePanel.open(options);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
    // 检查 WelcomeManager 是否已经加载
    if (!window.WelcomeManager) {
        console.error('WelcomeManager not found. Make sure welcome.js is loaded before wallpaper.js');
    }
    
    // 延迟创建 WallpaperManager 确保 DOM 完全加载
    setTimeout(() => {
        window.wallpaperManager = new WallpaperManager();
        
        // 确保壁纸列表被加载
        if (window.wallpaperManager && typeof window.wallpaperManager.loadPresetWallpapers === 'function') {
            setTimeout(() => {
                window.wallpaperManager.loadPresetWallpapers();
            }, 500);
        }
    }, 100);
});

// WallpaperManager 类用于处理所有壁纸相关的操作
class WallpaperManager {
    constructor() {
        // 首先初始化所有必要的属性
        this.wallpaperOptions = document.querySelectorAll('.wallpaper-option');
        this.uploadInput = document.getElementById('upload-wallpaper');
        this.mainElement = document.querySelector('main');
        
        // 初始化预设壁纸列表
        this.initializePresetWallpapers();
        
        // 初始化预加载队列
        this.preloadQueue = new Set();
        this.preloadedImages = new Map();
        
        // 初始化用户壁纸数组
        this.userWallpapers = [];
        
        // 初始化其他属性
        this.activeOption = null;
        
        // 加载用户壁纸
        this.loadUserWallpapers();
        
        // 初始化事件监听和其他设置
        this.initializeEventListeners();
        this.initialize();
        
        // 初始化必应壁纸
        this.bingWallpapers = [];
        this.initBingWallpapers();
        
        // 初始化壁纸历史记录，用于修复上传功能
        this.wallpaperHistory = [];
        

    }

    // 初始化预设壁纸列表
    initializePresetWallpapers() {
        this.presetWallpapers = [
            {
                url: '../images/wallpapers/wallpaper-1.jpg',
                title: 'Foggy Forest'
            },
            {
                url: '../images/wallpapers/wallpaper-2.jpg',
                title: 'Mountain Lake'
            },
            {
                url: '../images/wallpapers/wallpaper-3.jpg',
                title: 'Sunset Beach'
            },
            {
                url: '../images/wallpapers/wallpaper-4.jpg',
                title: 'City Night'
            },
            {
                url: '../images/wallpapers/wallpaper-5.jpg',
                title: 'Aurora'
            },
            {
                url: '../images/wallpapers/wallpaper-6.jpg',
                title: 'Desert Dunes'
            },
            {
                url: '../images/wallpapers/wallpaper-7.jpg',
                title: 'Mountain View'
            },
            {
                url: '../images/wallpapers/wallpaper-8.jpg',
                title: 'Forest Lake'
            },
            {
                url: '../images/wallpapers/wallpaper-9.jpg',
                title: 'Sunset Hills'
            },
            {
                url: '../images/wallpapers/wallpaper-10.jpg',
                title: 'Ocean View'
            }
        ];
    }

    // 修改 loadPresetWallpapers 方法，添加错误处理
    async loadPresetWallpapers() {
        // 尝试多个可能的容器选择器
        const wallpaperContainer = document.querySelector('.wallpaper-options') || 
                                  document.querySelector('.wallpaper-options-container') ||
                                  document.querySelector('.wallpaper-section');
        
        if (!wallpaperContainer) {
            console.error('Wallpaper container not found');
            console.log('Available elements with class names containing "wallpaper":');
            const elements = document.querySelectorAll('[class*="wallpaper"]');
            elements.forEach(el => {
                console.log(el.className, ' -> ', el);
            });
            return;
        }
        
        // 清空容器前先检查它是否是有效的DOM元素
        try {
            wallpaperContainer.innerHTML = '';
        } catch (error) {
            console.error('Error clearing wallpaper container:', error);
            return;
        }

        // 添加预设壁纸
        if (Array.isArray(this.presetWallpapers)) {
            this.presetWallpapers.forEach(preset => {
                try {
                    const option = this.createWallpaperOption(preset.url, preset.title);
                    if (option) {
                        wallpaperContainer.appendChild(option);
                    }
                } catch (error) {
                    console.error('Error creating wallpaper option:', error, preset);
                }
            });
        } else {
            console.warn('Preset wallpapers array is not valid:', this.presetWallpapers);
        }

        // 添加用户上传的壁纸
        if (Array.isArray(this.userWallpapers)) {
            this.userWallpapers.forEach(wallpaper => {
                try {
                    const option = this.createWallpaperOption(
                        wallpaper.url,
                        chrome.i18n.getMessage('uploadedWallpaperBadge') || 'Uploaded',
                        true
                    );
                    if (option) {
                        wallpaperContainer.appendChild(option);
                    }
                } catch (error) {
                    console.error('Error creating uploaded wallpaper option:', error, wallpaper);
                }
            });
        }
    }

    initialize() {
        this.preloadWallpapers();
        // 使用 setTimeout 确保 DOM 完全加载后再加载壁纸
        setTimeout(() => {
            this.loadPresetWallpapers();
        }, 100);
        
        this.initializeWallpaper().then(() => {
            document.documentElement.classList.remove('loading-wallpaper');
        });
    }

    initializeEventListeners() {
        // 初始化上传事件监听
        this.uploadInput.addEventListener('change', (event) => this.handleFileUpload(event));

        // 初始化重置按钮事件监听
        const resetButton = document.getElementById('reset-wallpaper');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetWallpaper());
        }

        // 添加图片加载错误处理
        window.addEventListener('error', (e) => this.handleImageError(e), true);

        // 添加检查缓存按钮事件监听
        const checkCacheButton = document.getElementById('check-wallpaper-cache');
        if (checkCacheButton) {
            checkCacheButton.addEventListener('click', () => this.checkWallpaperCache());
        }

        // 纯色背景选项的点击事件
        document.querySelectorAll('.settings-bg-option').forEach(option => {
            option.addEventListener('click', () => {
                this.handleBackgroundOptionClick(option);
            });
        });

        // 壁纸选项的点击事件
        document.querySelectorAll('.wallpaper-option').forEach(option => {
            option.addEventListener('click', () => {
                this.handleWallpaperOptionClick(option);
            });
        });
    }

    handleBackgroundOptionClick(option) {
        // 移除所有选项的 active 状态
        this.clearAllActiveStates();
        
        // 设置当前选项为 active
        option.classList.add('active');
        this.activeOption = option;
        
        // 应用纯色背景
        const bgClass = option.getAttribute('data-bg');
        // 检查是否为暗黑模式
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDarkMode) {
            // 在暗黑模式下保持暗色背景
            document.documentElement.className = bgClass;
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.className = bgClass;
        }
        
        // 清除壁纸
        this.clearWallpaper();
        localStorage.setItem('useDefaultBackground', 'true');
        
        // 更新欢迎消息颜色
        const welcomeElement = document.getElementById('welcome-message');
        if (welcomeElement && window.WelcomeManager) {
            window.WelcomeManager.adjustTextColor(welcomeElement);
        }
    }

    handleWallpaperOptionClick(option) {
        // 移除所有选项的 active 状态
        this.clearAllActiveStates();
        
        // 设置当前选项为 active
        option.classList.add('active');
        this.activeOption = option;
        
        // 应用壁纸
        const wallpaperUrl = option.getAttribute('data-wallpaper-url');
        this.setWallpaper(wallpaperUrl);
        
        // 清除纯色背景
        document.documentElement.className = '';
        localStorage.removeItem('useDefaultBackground');
    }

    clearAllActiveStates() {
        // 清除所有纯色背景选项的 active 状态
        document.querySelectorAll('.settings-bg-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // 清除所有壁纸选项的 active 状态
        document.querySelectorAll('.wallpaper-option').forEach(option => {
            option.classList.remove('active');
        });
        // 清除所有必应壁纸选项的 active 状态
        document.querySelectorAll('.bing-wallpaper-item').forEach(option => {
            option.classList.remove('active');
        });

    }

    // 优化预加载方法
    preloadWallpapers() {
        this.presetWallpapers.forEach(preset => {
            if (!this.preloadedImages.has(preset.url)) {
                const img = new Image();
                img.src = preset.url;
                this.preloadQueue.add(preset.url);
                
                img.onload = () => {
                    this.preloadedImages.set(preset.url, img);
                    this.preloadQueue.delete(preset.url);
                };
            }
        });
    }

    // 初始化壁纸状态
    async initializeWallpaper() {
        const savedWallpaper = localStorage.getItem('originalWallpaper');
        const useDefaultBackground = localStorage.getItem('useDefaultBackground');
        const savedBg = localStorage.getItem('selectedBackground');
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

        // 清除所有选中状态
        this.clearAllActiveStates();

        if (useDefaultBackground === 'true') {
            // 如果使用纯色背景，激活对应的选项
            const bgClass = savedBg || 'gradient-background-7';
            const bgOption = document.querySelector(`.settings-bg-option[data-bg="${bgClass}"]`);
            
            if (bgOption) {
                bgOption.classList.add('active');
                this.activeOption = bgOption;
                // 在暗黑模式下保持暗色背景
                if (isDarkMode) {
                    document.documentElement.className = bgClass;
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.className = bgClass;
                }
            }
            return;
        }

        if (savedWallpaper) {
            // 如果使用壁纸，查找对应的选项（包括用户上传的壁纸）
            let wallpaperOption = document.querySelector(`.wallpaper-option[data-wallpaper-url="${savedWallpaper}"]`);
            
            // 如果找不到对应选项，可能是用户上传的壁纸
            if (!wallpaperOption) {
                // 重新加载壁纸选项
                await this.loadPresetWallpapers();
                wallpaperOption = document.querySelector(`.wallpaper-option[data-wallpaper-url="${savedWallpaper}"]`);
            }
            
            if (wallpaperOption) {
                wallpaperOption.classList.add('active');
                this.activeOption = wallpaperOption;
            }
            
            await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.applyWallpaper(savedWallpaper);
                    resolve();
                };
                img.onerror = resolve;
                img.src = savedWallpaper;
            });
        } else {
            // 如果没有保存的壁纸和背景，使用随机预设壁纸作为默认
            await this.setRandomPresetWallpaper();
        }
    }

    async setRandomUnsplashWallpaper() {
        if (!this.unsplashCollection || this.unsplashCollection.length === 0) return;
        const randomIndex = Math.floor(Math.random() * this.unsplashCollection.length);
        const url = this.unsplashCollection[randomIndex];
        // 确保移除默认背景标记
        localStorage.removeItem('useDefaultBackground');
        await this.setWallpaper(url);
    }

    // 设置随机预设壁纸
    async setRandomPresetWallpaper() {
        if (!this.presetWallpapers || this.presetWallpapers.length === 0) return;
        const randomIndex = Math.floor(Math.random() * this.presetWallpapers.length);
        const url = this.presetWallpapers[randomIndex].url;
        
        // 确保移除默认背景标记
        localStorage.removeItem('useDefaultBackground');
        await this.setWallpaper(url);
    }

    // 重置壁纸
    async resetWallpaper() {
        // 清除所有选中状态
        this.clearAllActiveStates();
        
        // 设置随机预设壁纸作为默认
        await this.setRandomPresetWallpaper();
        
        // 使用本地化的成功提示
        alert(chrome.i18n.getMessage('wallpaperResetSuccess'));
    }

    // 清除壁纸样式
    clearWallpaper() {
        document.body.classList.remove('has-wallpaper');
        document.body.style.removeProperty('--wallpaper-image');
        document.body.style.backgroundImage = 'none';
        this.mainElement.style.backgroundImage = 'none';
    }

    // 修改应用壁纸方法
    applyWallpaper(url) {
        const backgroundStyle = {
            backgroundImage: `url("${url}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
        };

        // 使用 requestAnimationFrame 确保样式更新在下一帧执行
        requestAnimationFrame(() => {
            document.body.classList.add('has-wallpaper');
            document.body.style.setProperty('--wallpaper-image', `url("${url}")`);
            Object.assign(this.mainElement.style, backgroundStyle);
            Object.assign(document.body.style, backgroundStyle);
            
            // 更新欢迎消息颜色
            const welcomeElement = document.getElementById('welcome-message');
            if (welcomeElement && window.WelcomeManager) {
                window.WelcomeManager.adjustTextColor(welcomeElement);
            }
        });
    }

    // 设置新壁纸
    async setWallpaper(url) {
        if (!url) return;

        try {

            localStorage.removeItem('useDefaultBackground');
            document.querySelectorAll('.settings-bg-option').forEach(option => {
                option.classList.remove('active');
            });
            document.documentElement.className = '';
            await this.applyAndSaveWallpaper(url);
        } catch (error) {
            console.error('设置壁纸失败:', error);
            alert('设置壁纸失败，请重试');
        }
    }

    // 修改 applyAndSaveWallpaper 方法
    async applyAndSaveWallpaper(dataUrl) {
        try {
            // 在保存新壁纸前，先清除所有相关的存储
            this.clearWallpaperCache();
            
            // 根据数据URL类型决定是否需要压缩
            let saveDataUrl = dataUrl;
            if (dataUrl.startsWith('data:image')) {
                // 如果是data URL，进行压缩以减少存储大小
                saveDataUrl = await this.compressImageForStorage(dataUrl);
            }
            
            try {
                // 尝试保存压缩后的数据
                localStorage.setItem('originalWallpaper', saveDataUrl);
            } catch (storageError) {
                console.warn('无法保存壁纸到本地存储，将只保存在内存中');
            }
            
            // 更新内存缓存
            if (this.wallpaperCache) {
                if (this.wallpaperCache.src && this.wallpaperCache.src.startsWith('blob:')) {
                    URL.revokeObjectURL(this.wallpaperCache.src);
                }
                this.wallpaperCache.src = '';
            }
            this.wallpaperCache = new Image();
            this.wallpaperCache.src = saveDataUrl;

            // 应用壁纸
            await this.applyWallpaper(saveDataUrl);
        } catch (error) {
            console.error('Failed to save wallpaper:', error);
            alert('设置壁纸失败，请重试');
        }
    }

    // 添加新方法：压缩图片数据
    async compressImageForStorage(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 计算压缩后的尺寸，最大宽度1920px
                const maxWidth = 1920;
                const maxHeight = 1080;
                const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                // 设置图像平滑选项
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 使用中等的质量来平衡大小和质量
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                // 清理内存
                if (dataUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(dataUrl);
                }
                resolve(compressedDataUrl);
            };
            
            img.onerror = () => {
                console.error('Failed to load image for compression');
                // 如果加载失败，返回原始数据URL
                resolve(dataUrl);
            };
            
            img.src = dataUrl;
        });
    }

    // 创建缩略图
    createThumbnail(dataUrl, callback) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const thumbnailSize = { width: 200, height: 200 };

            canvas.width = thumbnailSize.width;
            canvas.height = thumbnailSize.height;
            ctx.drawImage(img, 0, 0, thumbnailSize.width, thumbnailSize.height);

            const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(thumbnailDataUrl);
        };
        img.src = dataUrl;
    }

    // 处理文件上传
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file || !this.validateFile(file)) return;

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const compressedDataUrl = await this.compressImageForStorage(e.target.result);
                
                // 保存到用户壁纸列表
                this.userWallpapers.unshift({
                    url: compressedDataUrl,
                    title: '自定义壁纸',
                    timestamp: Date.now()
                });

                // 限制数量，最多保留5张上传的壁纸
                const MAX_WALLPAPERS = 5;
                if (this.userWallpapers.length > MAX_WALLPAPERS) {
                    // 删除最旧的壁纸
                    const removedWallpapers = this.userWallpapers.splice(MAX_WALLPAPERS);
                    // 清理被删除壁纸的资源
                    removedWallpapers.forEach(wallpaper => {
                        if (wallpaper.url && wallpaper.url.startsWith('blob:')) {
                            URL.revokeObjectURL(wallpaper.url);
                        }
                    });
                }

                // 保存到localStorage
                try {
                    localStorage.setItem('userWallpapers', JSON.stringify(this.userWallpapers));
                } catch (storageError) {
                    console.warn('Storage quota exceeded, removing oldest wallpapers');
                    // 如果存储失败，继续删除旧壁纸直到能够存储为止
                    while (this.userWallpapers.length > 1) {
                        const removed = this.userWallpapers.pop();
                        if (removed && removed.url && removed.url.startsWith('blob:')) {
                            URL.revokeObjectURL(removed.url);
                        }
                        try {
                            localStorage.setItem('userWallpapers', JSON.stringify(this.userWallpapers));
                            break;
                        } catch (e) {
                            continue;
                        }
                    }
                }

                // 重新加载壁纸选项并设置壁纸
                await this.loadPresetWallpapers();
                await this.setWallpaper(compressedDataUrl);
                
            } catch (error) {
                console.error('处理壁纸时出错:', error);
                alert('设置壁纸失败，请重试');
            }
        };
        reader.onerror = () => {
            console.error('文件读取错误');
            alert(chrome.i18n.getMessage('fileReadError') || '文件读取失败');
        };
        reader.readAsDataURL(file);
        
        event.target.value = '';
    }

    // 验证上传的文件
    validateFile(file) {
        if (!file) return false;
        if (!file.type.startsWith('image/')) {
            alert(chrome.i18n.getMessage('pleaseUploadImage') || '请上传图片文件');
            return false;
        }
        // 将最大文件大小增加到50MB以支持高质量壁纸
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            alert((chrome.i18n.getMessage('imageSizeExceeded') || '图片大小不能超过50MB') + ' (当前: ' + (file.size / (1024 * 1024)).toFixed(2) + 'MB)');
            return false;
        }
        return true;
    }

    // 获取最大屏幕分辨率
    getMaxScreenResolution() {
        const pixelRatio = window.devicePixelRatio || 1;
        let maxWidth = window.screen.width;
        let maxHeight = window.screen.height;

        // 设置基准分辨率为1920x1080
        const baseWidth = 1920;
        const baseHeight = 1080;

        // 如果是高分屏，适当提高分辨率，但不超过2K
        if (pixelRatio > 1) {
            maxWidth = Math.min(maxWidth * pixelRatio, 2560);
            maxHeight = Math.min(maxHeight * pixelRatio, 1440);
        }

        // 返回较小的值：实际分辨率或基准分辨率
        return {
            width: Math.min(maxWidth, baseWidth),
            height: Math.min(maxHeight, baseHeight)
        };
    }

    // 计算最大文件大小
    calculateMaxFileSize() {
        const maxResolution = this.getMaxScreenResolution();
        const pixelCount = maxResolution.width * maxResolution.height;
        const baseSize = pixelCount * 4; // 4 bytes per pixel (RGBA)

        // 简化压缩比率
        let compressionRatio = 0.7; // 默认70%质量
        if (pixelCount > 1920 * 1080) {
            compressionRatio = 0.5; // 更高分辨率使用50%质量
        }

        // 限制最终文件大小在2MB到5MB之间
        const maxSize = Math.round(baseSize * compressionRatio);
        return Math.min(Math.max(maxSize, 2 * 1024 * 1024), 5 * 1024 * 1024);
    }

    // 压缩并设置壁纸
    compressAndSetWallpaper(img, maxResolution) {
        // 先生成并显示低质量预览
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        const previewWidth = Math.round(img.width * 0.1);
        const previewHeight = Math.round(img.height * 0.1);
        
        previewCanvas.width = previewWidth;
        previewCanvas.height = previewHeight;
        previewCtx.drawImage(img, 0, 0, previewWidth, previewHeight);
        
        // 显示模糊预览
        const previewUrl = previewCanvas.toDataURL('image/jpeg', 0.5);
        this.setWallpaper(previewUrl);

        // 然后异步处理高质量版本
        requestAnimationFrame(() => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 保持图片比例
            const ratio = Math.min(
                maxResolution.width / img.width,
                maxResolution.height / img.height
            );
            
            const width = Math.round(img.width * ratio);
            const height = Math.round(img.height * ratio);

            canvas.width = width;
            canvas.height = height;

            // 使用更好的图像平滑算法
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(img, 0, 0, width, height);

            // 使用较高的压缩质量
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            this.setWallpaper(compressedDataUrl);
        });
    }

    // 处理图片加载错误
    handleImageError(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'IMAGE') {
            console.error('图片加载失败:', e.target.src);
            if (e.target.src !== this.defaultWallpaper) {
                this.setWallpaper(this.defaultWallpaper);
            }
        }
    }

    // 添加新方法：创建壁纸选项元素
    createWallpaperOption(url, title, isUploaded = false) {
        const option = document.createElement('div');
        option.className = 'wallpaper-option';
        option.dataset.wallpaperUrl = url;
        option.title = title;
        
        // 确保壁纸URL有效
        if (url) {
            option.style.backgroundImage = `url('${url}')`;
        } else {
            console.error('Invalid wallpaper URL provided:', url);
            return null; // 如果URL无效，返回null
        }

        // 如果是上传的壁纸，添加标识
        if (isUploaded) {
            const badge = document.createElement('span');
            badge.className = 'uploaded-wallpaper-badge';
            badge.textContent = chrome.i18n.getMessage('uploadedWallpaperBadge') || 'Uploaded';
            option.appendChild(badge);
        }

        option.addEventListener('click', () => {
            document.querySelectorAll('.settings-bg-option').forEach(opt => {
                opt.classList.remove('active');
            });
            document.querySelectorAll('.wallpaper-option').forEach(opt => {
                opt.classList.remove('active');
            });
            document.querySelectorAll('.bing-wallpaper-item').forEach(opt => {
                opt.classList.remove('active');
            });

            option.classList.add('active');
            document.documentElement.className = '';
            this.setWallpaper(url);
        });

        return option;
    }

    // 新增：生成缩略图方法
    generateThumbnail(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 计算合适的缩略图尺寸
                const maxSize = 150; // 更小的缩略图尺寸
                const ratio = Math.min(maxSize / img.width, maxSize / img.height);
                const width = Math.round(img.width * ratio);
                const height = Math.round(img.height * ratio);

                canvas.width = width;
                canvas.height = height;
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // 使用webp格式（如果浏览器支持）
                if (this.supportsWebP()) {
                    resolve(canvas.toDataURL('image/webp', 0.8));
                } else {
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                }
            };

            img.onerror = reject;
            img.src = imageUrl;
        });
    }

    // 检查WebP支持
    supportsWebP() {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // 添加清理缓存的方法
    clearWallpaperCache() {
        if (this.wallpaperCache) {
            URL.revokeObjectURL(this.wallpaperCache.src);
            this.wallpaperCache.src = '';
            this.wallpaperCache = null;
        }
        
        localStorage.removeItem('originalWallpaper');
        localStorage.removeItem('selectedWallpaper');
        localStorage.removeItem('wallpaperThumbnail');
        // 不要清除用户壁纸列表
        // localStorage.removeItem('userWallpapers');
    }

    // 添加加载在线壁纸的方法
    loadOnlineWallpapers() {
        const container = document.querySelector('.wallpaper-options-container');
        if (!container) return;

        this.onlineWallpapers.forEach(wallpaper => {
            const option = document.createElement('div');
            option.className = 'wallpaper-option';
            option.setAttribute('data-wallpaper-url', wallpaper.url);
            
            // 创建缩略图
            const img = document.createElement('img');
            img.src = wallpaper.thumbnail;
            img.alt = 'Online Wallpaper';
            img.className = 'wallpaper-thumbnail';
            
            option.appendChild(img);
            container.appendChild(option);

            // 添加点击事件
            option.addEventListener('click', () => {
                this.setWallpaper(wallpaper.url);
            });
        });
    }

    // 添加新方法：加载用户壁纸
    loadUserWallpapers() {
        try {
            const savedWallpapers = localStorage.getItem('userWallpapers');
            if (savedWallpapers) {
                this.userWallpapers = JSON.parse(savedWallpapers);
                // 验证每个壁纸的有效性
                this.userWallpapers = this.userWallpapers.filter(wallpaper => {
                    return wallpaper && wallpaper.url && typeof wallpaper.url === 'string';
                });
                // 更新localStorage
                localStorage.setItem('userWallpapers', JSON.stringify(this.userWallpapers));
            } else {
                this.userWallpapers = [];
            }
        } catch (error) {
            console.error('Failed to load user wallpapers:', error);
            this.userWallpapers = [];
        }
    }

    // 修改 getLocalizedMessage 方法以支持参数
    getLocalizedMessage(key, fallback, substitutions = []) {
        try {
            const message = chrome.i18n.getMessage(key, substitutions);
            return message || fallback;
        } catch (error) {
            console.warn(`Failed to get localized message for key: ${key}`, error);
            if (substitutions.length > 0) {
                // 如果有替换参数，手动替换fallback中的占位符
                return fallback.replace(/\$1/g, substitutions[0])
                             .replace(/\$2/g, substitutions[1]);
            }
            return fallback;
        }
    }

    // 修改显示分辨率警告的代码
    handleFileRead(e, file, maxSize) {
        const img = new Image();
        img.onload = () => {
            const maxResolution = this.getMaxScreenResolution();
            
            if (img.width < maxResolution.width || img.height < maxResolution.height) {
                // 传递分辨率参数
                const warning = this.getLocalizedMessage(
                    'lowResolutionWarning',
                    `图片分辨率过低，建议使用至少 ${maxResolution.width}x${maxResolution.height} 的图片以获得最佳效果`,
                    [maxResolution.width.toString(), maxResolution.height.toString()]
                );
                alert(warning);
            }

            try {
                if (file.size <= maxSize) {
                    this.setWallpaper(e.target.result);
                } else {
                    this.compressAndSetWallpaper(img, maxResolution);
                }
            } catch (error) {
                console.error('处理壁纸时出错:', error);
                alert(this.getLocalizedMessage('wallpaperSetError', '设置壁纸失败，请重试'));
            } finally {
                URL.revokeObjectURL(img.src);
            }
        };
        img.onerror = () => {
            alert(this.getLocalizedMessage('imageLoadError', '图片加载失败，请尝试其他图片'));
            URL.revokeObjectURL(img.src);
        };
        img.src = e.target.result;
    }

    // 初始化必应壁纸
    async initBingWallpapers() {
        try {
            // 获取必应壁纸，增加数量以提供更多选择
            const wallpapers = await this.fetchBingWallpapers(8);
            this.bingWallpapers = wallpapers;
            
            // 渲染壁纸
            this.renderBingWallpapers();
            
            console.log(`Successfully loaded ${wallpapers.length} Bing wallpapers`);
        } catch (error) {
            console.error('Failed to initialize Bing wallpapers:', error);
            
            // 使用备选方案
            this.bingWallpapers = this.presetWallpapers.slice(0, 4).map(wp => ({
                url: wp.url,
                title: wp.title,
                copyright: 'Fallback wallpaper',
                date: new Date().toISOString().slice(0, 8).replace(/-/g, ''),
                hash: 'fallback'
            }));
            
            this.renderBingWallpapers();
        }
    }

    // 获取必应壁纸
    async fetchBingWallpapers(count = 4) {
        try {
            // 首先尝试使用Chrome扩展的权限来直接访问Bing API
            const endpoints = [
                `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=${count}&mkt=en-US`,
                `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=${count}&mkt=zh-CN`,
                `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=${count}&mkt=en-US&uhd=1&uhdwidth=3840&uhdheight=2160`
            ];
            
            let data = null;
            let response = null;
            
            // 尝试不同的端点直到成功
            for (const endpoint of endpoints) {
                try {
                    response = await fetch(endpoint, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Referer': 'https://www.bing.com/'
                        }
                    });
                    
                    if (response.ok) {
                        data = await response.json();
                        break; // 成功获取数据，跳出循环
                    } else {
                        console.warn(`Bing API request failed with status: ${response.status} for endpoint: ${endpoint}`);
                    }
                } catch (e) {
                    console.warn(`Failed to fetch from ${endpoint}:`, e.message);
                    continue; // 尝试下一个端点
                }
            }
            
            if (!data?.images) {
                console.error('No images data in response from any endpoint');
                // 尝试使用本地预设壁纸作为备选
                return this.presetWallpapers.slice(0, count).map((wp, index) => ({
                    url: wp.url,
                    title: wp.title,
                    copyright: 'Local wallpaper',
                    date: new Date().toISOString().slice(0, 8).replace(/-/g, ''),
                    hash: `local-${index}`
                }));
            }

            // 使用解构赋值和箭头函数简化代码
            return data.images.map(({ url, title, copyright, startdate, hsh }) => {
                // 构造完整URL，处理可能的URL格式问题
                let fullUrl = url.startsWith('http') ? url : `https://www.bing.com${url}`;
                
                // 确保URL包含正确的参数
                try {
                    const urlObj = new URL(fullUrl);
                    if (!urlObj.searchParams.has('w')) {
                        urlObj.searchParams.set('w', '1920');
                    }
                    if (!urlObj.searchParams.has('h')) {
                        urlObj.searchParams.set('h', '1080');
                    }
                    if (!urlObj.searchParams.has('q')) {
                        urlObj.searchParams.set('q', '80');
                    }
                    fullUrl = urlObj.toString();
                } catch (urlError) {
                    console.warn('Invalid URL, using original:', fullUrl, urlError);
                    // 如果URL无效，使用原始URL
                }
                
                return {
                    url: fullUrl,
                    title: title || copyright?.split('(')[0]?.trim() || 'Bing Wallpaper',
                    copyright,
                    date: startdate,
                    hash: hsh
                };
            });
        } catch (error) {
            console.error('Failed to fetch Bing wallpapers:', error);
            // 返回静态壁纸作为备选
            return this.presetWallpapers.slice(0, count).map((wp, index) => {
                return {
                    url: wp.url,
                    title: wp.title,
                    copyright: 'Local fallback wallpaper',
                    date: new Date().toISOString().slice(0, 8).replace(/-/g, ''),
                    hash: `fallback-${index}`
                };
            });
        }
    }

    // 渲染必应壁纸
    renderBingWallpapers() {
        const container = document.querySelector('.bing-wallpapers-grid');
        if (!container) return;
        
        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        this.bingWallpapers.forEach(wallpaper => 
            fragment.appendChild(this.createBingWallpaperElement(wallpaper))
        );
        container.appendChild(fragment);
    }

    // 创建必应壁纸元素
    createBingWallpaperElement(wallpaper) {
        const { url, title, date } = wallpaper;
        const element = document.createElement('div');
        element.className = 'bing-wallpaper-item';
        element.setAttribute('data-wallpaper-url', url);
        element.title = title;
        element.innerHTML = `
            <div class="bing-wallpaper-thumbnail" style="background-image: url(${url})"></div>
            <div class="bing-wallpaper-info">
                <div class="bing-wallpaper-title">${title}</div>
                <div class="bing-wallpaper-date">${this.formatDate(date)}</div>
            </div>
        `;

        // 修改点击事件，使用 handleWallpaperOptionClick
        element.addEventListener('click', () => {
            this.handleWallpaperOptionClick(element);
        });

        return element;
    }

    // 格式化日期
    formatDate(dateStr) {
        try {
            const year = dateStr.slice(0, 4);
            const month = parseInt(dateStr.slice(4, 6));
            const day = parseInt(dateStr.slice(6, 8));
            const date = new Date(year, month - 1, day);
            return `${month}月${day}日`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateStr;
        }
    }
    
    
}

function optimizeMemoryUsage(img) {
    // 在压缩完成后释放原始图片内存
    const url = img.src;
    img.onload = null;
    img.src = '';
    URL.revokeObjectURL(url);
}

// 测试函数，用于验证壁纸功能是否正常工作
function testWallpaperFeatures() {
    console.log('Testing wallpaper features...');
    
    // 检查 WallpaperManager 类是否定义
    if (typeof WallpaperManager !== 'undefined') {
        console.log('✓ WallpaperManager class is defined');
        
        // 检查实例是否存在
        if (window.wallpaperManager) {
            console.log('✓ WallpaperManager instance exists');
            
            // 检查关键功能是否存在
            const methodsToCheck = [
                'initBingWallpapers',
                'initUnsplashWallpapers',
                'fetchBingWallpapers',
                'fetchUnsplashWallpapers',
                'setRandomUnsplashWallpaper',
                'loadPresetWallpapers'
            ];
            
            let allMethodsExist = true;
            methodsToCheck.forEach(method => {
                if (typeof window.wallpaperManager[method] === 'function') {
                    console.log(`✓ ${method} method exists`);
                } else {
                    console.log(`✗ ${method} method missing`);
                    allMethodsExist = false;
                }
            });
            
            if (allMethodsExist) {
                console.log('✓ All required methods are present');
                
                // 尝试加载预设壁纸
                try {
                    window.wallpaperManager.loadPresetWallpapers();
                    console.log('✓ Preset wallpapers loaded successfully');
                } catch (e) {
                    console.error('✗ Error loading preset wallpapers:', e);
                }
            }
        } else {
            console.log('✗ WallpaperManager instance not found in window');
        }
    } else {
        console.log('✗ WallpaperManager class is not defined');
    }
    
    console.log('Wallpaper feature testing completed.');
}

// 在 DOM 内容加载完成后运行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testWallpaperFeatures, 3000); // 延迟执行以确保初始化完成
    });
} else {
    setTimeout(testWallpaperFeatures, 3000); // 延迟执行以确保初始化完成
}