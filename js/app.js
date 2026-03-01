// Photo data - Automatically load all images from the images folder
const photos = [
    { url: 'images/Cover.webp', caption: '' },
    { url: 'images/image_1.webp', caption: '' },
    { url: 'images/image_2.webp', caption: '' },
    { url: 'images/image_3.webp', caption: '' },
    { url: 'images/image_4.webp', caption: '' },
    { url: 'images/image_5.webp', caption: '' },
    { url: 'images/image_6.webp', caption: '' },
    { url: 'images/image_7.webp', caption: '' },
    { url: 'images/image_8.webp', caption: '' },
    { url: 'images/image_9.webp', caption: '' },
    { url: 'images/image_10.webp', caption: '' },
    { url: 'images/image_11.webp', caption: '' },
    { url: 'images/image_12.webp', caption: '' },
    { url: 'images/image_13.webp', caption: '' },
    { url: 'images/image_14.webp', caption: '' },
    { url: 'images/image_15.webp', caption: '' },
    { url: 'images/image_16.webp', caption: '' },
    { url: 'images/image_17.webp', caption: '' },
    { url: 'images/image_18.webp', caption: '' },
    { url: 'images/image_19.webp', caption: '' },
    { url: 'images/image_20.webp', caption: '' },
    { url: 'images/image_21.webp', caption: '' },
    { url: 'images/image_22.webp', caption: '' },
    { url: 'images/image_23.webp', caption: '' },
    { url: 'images/image_24.webp', caption: '' },
    { url: 'images/image_25.webp', caption: '' },
    { url: 'images/image_26.webp', caption: '' },
    { url: 'images/image_27.webp', caption: '' },
    { url: 'images/image_28.webp', caption: '' },
    { url: 'images/image_29.webp', caption: '' },
    { url: 'images/image_30.webp', caption: '' },
    { url: 'images/image_31.webp', caption: '' },
    { url: 'images/image_32.webp', caption: '' },
    { url: 'images/image_33.webp', caption: '' },
    { url: 'images/image_34.webp', caption: '' },
    { url: 'images/image_35.webp', caption: '' },
    { url: 'images/image_36.webp', caption: '' },
    { url: 'images/image_37.webp', caption: '' },
    { url: 'images/image_38.webp', caption: '' },
    { url: 'images/image_39.webp', caption: '' },
    { url: 'images/image_40.webp', caption: '' },
    { url: 'images/image_41.webp', caption: '' },
    { url: 'images/image_42.webp', caption: '' },
    { url: 'images/image_43.webp', caption: '' },
    { url: 'images/image_44.webp', caption: '' },
    { url: 'images/image_45.webp', caption: '' },
    { url: 'images/image_46.webp', caption: '' },
    { url: 'images/image_47.webp', caption: '' },
    { url: 'images/image_48.webp', caption: '' },
    { url: 'images/image_49.webp', caption: '' }
];

class PhotoFlipbook {
    constructor(photos) {
        this.photos = photos;
        this.pageFlip = null;
        this.currentPage = 0;
        this.isInitialized = false;
        this.imageCache = new Map();
        this.lastFlipDirection = 1; // 1 = forward, -1 = backward
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingProgress = document.querySelector('.loading-progress');
        
        try {
            // Wait only for the first 3 images (Cover + 2 inner pages)
            const initialLoadCount = Math.min(3, this.photos.length);
            loadingProgress.textContent = 'Loading...';
            
            const initialPromises = this.photos.slice(0, initialLoadCount).map((photo, index) =>
                this.preloadImage(photo.url, index)
            );
            
            await Promise.all(initialPromises);
            
            // Show immediately — no artificial delay
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
            this.setup();
            
            // Preload next pages in background after UI is shown
            this.preloadAdjacentPages(0, 1);
            
        } catch (error) {
            console.error('Error initializing app:', error);
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
            this.setup();
        }
    }

    preloadImage(url, index) {
        if (this.imageCache.has(index)) {
            return this.imageCache.get(index);
        }

        const promise = new Promise((resolve) => {
            const img = new Image();
            img.src = url;

            // Use decode() so image decoding happens off the main thread
            img.decode()
                .then(() => resolve({ success: true, index }))
                .catch(() => {
                    // decode() can fail if image already loaded or on error; fallback
                    if (img.complete && img.naturalWidth > 0) {
                        resolve({ success: true, index });
                    } else {
                        console.warn(`Failed to load image: ${url}`);
                        resolve({ success: false, index });
                    }
                });

            // Safety timeout
            setTimeout(() => resolve({ success: false, index }), 8000);
        });

        this.imageCache.set(index, promise);
        return promise;
    }

    preloadAdjacentPages(currentIndex, direction = this.lastFlipDirection) {
        // Bias preloading heavily in the direction of travel
        const lookAhead = 6;
        const lookBehind = 2;
        const ahead = direction >= 0 ? lookAhead : lookBehind;
        const behind = direction >= 0 ? lookBehind : lookAhead;

        const start = Math.max(0, currentIndex - behind);
        const end = Math.min(this.photos.length - 1, currentIndex + ahead);
        
        for (let i = start; i <= end; i++) {
            if (!this.imageCache.has(i)) {
                this.preloadImage(this.photos[i].url, i);
            }
        }
    }

    setup() {
        // Check if StPageFlip is available
        if (typeof St === 'undefined' || typeof St.PageFlip === 'undefined') {
            console.error('StPageFlip library not loaded');
            this.showFallback();
            return;
        }

        this.createPages();
        this.initializeFlipbook();
        this.setupControls();
        this.setupKeyboardNavigation();
    }

    createPages() {
        const flipbookEl = document.getElementById('flipbook');
        
        this.photos.forEach((photo, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'page';
            // All pages use eager — lazy loading is unreliable in a flipbook because
            // hidden/transformed pages never enter the viewport, so the browser
            // never triggers lazy loads. JS preloading controls the priority instead.
            const priority = index === 0 ? 'fetchpriority="high"' : '';
            pageDiv.innerHTML = `
                <div class="page-content">
                    <img src="${photo.url}" alt="${photo.caption || `Photo ${index + 1}`}" class="page-image" loading="eager" ${priority}>
                    ${photo.caption ? `<div class="page-caption">${photo.caption}</div>` : ''}
                </div>
            `;
            flipbookEl.appendChild(pageDiv);
        });
    }

    initializeFlipbook() {
        const flipbookEl = document.getElementById('flipbook');
        const containerWidth = flipbookEl.parentElement.offsetWidth;
        const containerHeight = flipbookEl.parentElement.offsetHeight;
        
        // Calculate optimal dimensions (landscape, 4:3 ratio) with larger size
        const aspectRatio = 4 / 3;
        let pageWidth = Math.min(containerWidth / 2, containerHeight * aspectRatio);
        let pageHeight = pageWidth / aspectRatio;
        
        // Ensure it fits in container with minimal padding
        if (pageHeight > containerHeight) {
            pageHeight = containerHeight - 20;
            pageWidth = pageHeight * aspectRatio;
        }

        // Store page width as CSS variable for cover centering
        document.documentElement.style.setProperty('--page-width', `${pageWidth}px`);

        try {
            this.pageFlip = new St.PageFlip(flipbookEl, {
                width: pageWidth,
                height: pageHeight,
                size: 'stretch',
                minWidth: 315,
                maxWidth: 1200,
                minHeight: 236,
                maxHeight: 1500,
                maxShadowOpacity: 0.5,
                showCover: true,
                mobileScrollSupport: false,
                swipeDistance: 30,
                clickEventForward: true,
                usePortrait: false,
                startPage: 0,
                drawShadow: true,
                flippingTime: 1000,
                useMouseEvents: true,
                autoSize: true,
                showPageCorners: true,
                disableFlipByClick: false
            });

            this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));

            // Event listeners
            this.pageFlip.on('flip', (e) => this.onPageFlip(e));
            this.pageFlip.on('changeState', (e) => this.onStateChange(e));
            
            this.isInitialized = true;
            this.updatePageCounter();
            this.updateBookPosition();

        } catch (error) {
            console.error('Failed to initialize flipbook:', error);
            this.showFallback();
        }

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 250);
        });
    }

    setupControls() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.addEventListener('click', () => this.previousPage());
        nextBtn.addEventListener('click', () => this.nextPage());

        this.updateButtons();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.previousPage();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.nextPage();
            }
        });
    }

    previousPage() {
        if (this.pageFlip && this.isInitialized) {
            this.pageFlip.flipPrev();
        }
    }

    nextPage() {
        if (this.pageFlip && this.isInitialized) {
            this.pageFlip.flipNext();
        }
    }

    onPageFlip(e) {
        const newPage = e.data;
        this.lastFlipDirection = newPage >= this.currentPage ? 1 : -1;
        this.currentPage = newPage;
        this.updatePageCounter();
        this.updateButtons();
        this.updateBookPosition();
        
        this.preloadAdjacentPages(this.currentPage, this.lastFlipDirection);
    }

    updateBookPosition() {
        const wrapper = document.querySelector('.flipbook-wrapper');
        const currentPageIndex = this.pageFlip.getCurrentPageIndex();
        
        // If on cover page (index 0), center as single page
        if (currentPageIndex === 0) {
            wrapper.classList.add('cover-mode');
            wrapper.classList.remove('spread-mode');
        } else {
            // If past cover, show as spread (2 pages)
            wrapper.classList.remove('cover-mode');
            wrapper.classList.add('spread-mode');
        }
    }

    onStateChange(e) {
        // Can add loading states or animations here if needed
    }

    updatePageCounter() {
        const counter = document.getElementById('pageCounter');
        if (this.pageFlip) {
            const currentPageNum = this.pageFlip.getCurrentPageIndex() + 1;
            const totalPages = this.photos.length;
            counter.textContent = `${currentPageNum} / ${totalPages}`;
        }
    }

    updateButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (this.pageFlip) {
            const currentPageIndex = this.pageFlip.getCurrentPageIndex();
            const pageCount = this.pageFlip.getPageCount();

            prevBtn.disabled = currentPageIndex === 0;
            nextBtn.disabled = currentPageIndex >= pageCount - 1;
        }
    }

    handleResize() {
        if (this.pageFlip && this.isInitialized) {
            const flipbookEl = document.getElementById('flipbook');
            const containerWidth = flipbookEl.parentElement.offsetWidth;
            const containerHeight = flipbookEl.parentElement.offsetHeight;
            
            const aspectRatio = 4 / 3;
            let pageWidth = Math.min(containerWidth / 2, containerHeight * aspectRatio);
            let pageHeight = pageWidth / aspectRatio;
            
            if (pageHeight > containerHeight) {
                pageHeight = containerHeight - 20;
                pageWidth = pageHeight * aspectRatio;
            }

            // Update page width CSS variable
            document.documentElement.style.setProperty('--page-width', `${pageWidth}px`);

            this.pageFlip.updateFromHtml();
            this.updateBookPosition();
        }
    }

    showFallback() {
        const flipbookEl = document.getElementById('flipbook');
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        flipbookEl.innerHTML = `
            <div class="loading">
                Unable to load flipbook. Please check your connection and try again.
                <br><br>
                <button onclick="location.reload()" style="
                    padding: 0.5rem 1rem;
                    background: var(--accent-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">Retry</button>
            </div>
        `;
    }
}

// Initialize the flipbook
new PhotoFlipbook(photos);

// First-visit controls intro
(function () {
    const overlay = document.getElementById('introOverlay');
    const dismissBtn = document.getElementById('introDismiss');
    if (!overlay || !dismissBtn) return;

    const SEEN_KEY = 'flipbook_intro_seen';

    function dismiss() {
        overlay.classList.add('hidden');
        // After transition completes, remove from DOM so it can't block interactions
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
        try { localStorage.setItem(SEEN_KEY, '1'); } catch (_) {}
    }

    // Show only for first-time visitors
    if (!localStorage.getItem(SEEN_KEY)) {
        overlay.style.display = 'flex';
        dismissBtn.addEventListener('click', dismiss);
        // Also dismiss if they tap outside the card
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) dismiss();
        });
    } else {
        overlay.remove();
    }
}());

// Register service worker for offline support and better caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
