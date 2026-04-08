// PWA Functionality for Mess Tracker
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        
        this.initializePWA();
        this.setupEventListeners();
        this.registerServiceWorker();
        this.setupOfflineHandling();
    }

    // Initialize PWA features
    initializePWA() {
        // Check if app is already installed
        this.checkInstallationStatus();
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Setup offline indicator
        this.setupOfflineIndicator();
        
        // Setup PWA banner
        this.setupPWABanner();
        
    }
    

    // Setup event listeners
    setupEventListeners() {
        // Install button events
        document.getElementById('pwaInstallBtn')?.addEventListener('click', () => this.installApp());
        document.getElementById('pwaBannerInstall')?.addEventListener('click', () => this.installApp());
        document.getElementById('pwaBannerDismiss')?.addEventListener('click', () => this.dismissBanner());
        
        
        // Online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Before install prompt
        window.addEventListener('beforeinstallprompt', (e) => this.handleBeforeInstallPrompt(e));
        
        // App installed
        window.addEventListener('appinstalled', () => this.handleAppInstalled());
    }

    // Register service worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    // Setup install prompt
    setupInstallPrompt() {
        // Check if app can be installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            const installBtn = document.getElementById('pwaInstallBtn');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        }
        
        // Check if already installed
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            const installBtn = document.getElementById('pwaInstallBtn');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        }
    }

    // Handle before install prompt
    handleBeforeInstallPrompt(e) {
        console.log('PWA: Before install prompt received');
        e.preventDefault();
        this.deferredPrompt = e;
        
        // Show install button if not already installed
        if (!this.isInstalled) {
            const installBtn = document.getElementById('pwaInstallBtn');
            if (installBtn) {
                installBtn.style.display = 'flex';
                console.log('PWA: Install button shown');
            }
            this.showInstallBanner();
        }
    }

    // Install app
    async installApp() {
        console.log('PWA: Install app called');
        if (this.deferredPrompt) {
            console.log('PWA: Showing install prompt');
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA: User accepted the install prompt');
                this.showToast('App installed successfully!', 'success');
            } else {
                console.log('PWA: User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
            this.hideInstallBanner();
        } else {
            console.log('PWA: No deferred prompt available');
            this.showToast('Install prompt not available. Try refreshing the page.', 'warning');
        }
    }

    // Handle app installed
    handleAppInstalled() {
        this.isInstalled = true;
        document.getElementById('pwaInstallBtn').style.display = 'none';
        this.hideInstallBanner();
        this.showToast('Mess Tracker installed successfully!', 'success');
    }

    // Check installation status
    checkInstallationStatus() {
        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            document.getElementById('pwaInstallBtn').style.display = 'none';
        }
    }

    // Setup PWA banner
    setupPWABanner() {
        // Show banner after 5 seconds if not installed
        setTimeout(() => {
            if (!this.isInstalled && !this.getBannerDismissed()) {
                this.showInstallBanner();
            }
        }, 5000);
    }

    // Show install banner
    showInstallBanner() {
        const banner = document.getElementById('pwaBanner');
        if (banner) {
            banner.style.display = 'block';
            setTimeout(() => banner.classList.add('show'), 100);
        }
    }

    // Hide install banner
    hideInstallBanner() {
        const banner = document.getElementById('pwaBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.style.display = 'none', 300);
        }
    }

    // Dismiss banner
    dismissBanner() {
        this.hideInstallBanner();
        this.setBannerDismissed(true);
    }

    // Banner dismissed state
    getBannerDismissed() {
        return localStorage.getItem('pwaBannerDismissed') === 'true';
    }

    setBannerDismissed(dismissed) {
        localStorage.setItem('pwaBannerDismissed', dismissed.toString());
    }

    // Setup offline indicator
    setupOfflineIndicator() {
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }

    // Handle online
    handleOnline() {
        this.isOnline = true;
        this.hideOfflineIndicator();
        this.showToast('Back online! Data synced.', 'success');
        this.syncOfflineData();
    }

    // Handle offline
    handleOffline() {
        this.isOnline = false;
        this.showOfflineIndicator();
        this.showToast('You\'re offline. Changes will sync when connected.', 'warning');
    }

    // Show offline indicator
    showOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.classList.add('show');
        }
    }

    // Hide offline indicator
    hideOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }


    // Setup offline handling
    setupOfflineHandling() {
        // Store data in IndexedDB for offline access
        this.setupIndexedDB();
        
        // Handle offline data sync
        this.setupOfflineSync();
    }

    // Setup IndexedDB
    setupIndexedDB() {
        if ('indexedDB' in window) {
            const request = indexedDB.open('MessTrackerDB', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('messes')) {
                    db.createObjectStore('messes', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        }
    }

    // Setup offline sync
    setupOfflineSync() {
        // Register for background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('mess-data-sync');
            });
        }
    }

    // Sync offline data
    async syncOfflineData() {
        // This would sync any offline changes when back online
        console.log('Syncing offline data...');
    }

    // Show update notification
    showUpdateNotification() {
        if (window.messTracker) {
            window.messTracker.showToast('App update available! Refresh to get the latest version.', 'info');
        }
    }


    // Show toast notification
    showToast(message, type = 'success') {
        if (window.messTracker) {
            window.messTracker.showToast(message, type);
        }
    }

    // Haptic feedback
    triggerHapticFeedback(type = 'light') {
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [50]
            };
            
            navigator.vibrate(patterns[type] || patterns.light);
        }
        
        // Visual feedback
        const element = event?.target;
        if (element) {
            element.classList.add(`haptic-${type}`);
            setTimeout(() => element.classList.remove(`haptic-${type}`), 200);
        }
    }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
    
    // Add haptic feedback to interactive elements
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .clickable, .toggle')) {
            window.pwaManager.triggerHapticFeedback('light');
        }
    });
    
    // Add medium haptic feedback for important actions
    document.addEventListener('click', (e) => {
        if (e.target.matches('.add-mess-btn, .usage-btn, .mark-previous-btn')) {
            window.pwaManager.triggerHapticFeedback('medium');
        }
    });
    
    // Add heavy haptic feedback for critical actions
    document.addEventListener('click', (e) => {
        if (e.target.matches('.delete-btn, .reset-btn')) {
            window.pwaManager.triggerHapticFeedback('heavy');
        }
    });
});

// Export for use in main script
window.PWAManager = PWAManager;
