        this.initializeApp();
        this.bindEvents();
    // Initialize the application
    initializeApp() {
        // Set default start date to today
        // Initialize PWA features
        this.initializePWAFeatures();
    }

    // Initialize PWA features
    initializePWAFeatures() {
        // Check if running as PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.body.classList.add('pwa-mode');
            console.log('Running as PWA');
        }
        
        // Setup offline data handling
        this.setupOfflineDataHandling();
        
    }

    // Setup offline data handling
    setupOfflineDataHandling() {
        // Enhanced data persistence for offline use
        this.originalSaveMesses = this.saveMesses;
        this.saveMesses = () => {
            this.originalSaveMesses();
            this.syncToIndexedDB();
        };
    }

    // Sync to IndexedDB for offline access
    async syncToIndexedDB() {
        if ('indexedDB' in window) {
            try {
                const db = await this.openIndexedDB();
                const transaction = db.transaction(['messes'], 'readwrite');
                const store = transaction.objectStore('messes');
                
                // Clear existing data
                await store.clear();
                
                // Add current messes
                for (const mess of this.messes) {
                    await store.add(mess);
                }
                
                console.log('Data synced to IndexedDB for offline access');
            } catch (error) {
                console.error('IndexedDB sync failed:', error);
            }
        }
    }

    // Open IndexedDB
    openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MessTrackerDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('messes')) {
                    db.createObjectStore('messes', { keyPath: 'id' });
                }
            };
        });
    }


        if (resetDataBtn) resetDataBtn.addEventListener('click', () => this.resetData());
        if (messForm) {
            messForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            console.log('Form event listener added successfully');
        } else {
            console.error('Form element not found for event binding');
        }
        
        document.getElementById('todayThali').addEventListener('change', (e) => {
            this.toggleTodayThali(e.target.checked);
        });

        // Previous day tracking
        document.getElementById('previousDate').addEventListener('change', (e) => {
            this.handlePreviousDateChange(e.target.value);
        });

        document.getElementById('markPreviousBtn').addEventListener('click', () => {
            this.markPreviousDay();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: Add new mess
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing MessTracker...');
    window.messTracker = new MessTracker();
    console.log('MessTracker initialized:', window.messTracker);
});

// Global function for form submission (fallback)
window.submitMessForm = function() {
    console.log('Global form submission function called');
    if (window.messTracker) {
        window.messTracker.submitFormManually();
    } else {
        console.error('MessTracker not initialized');
    }
};


// Add some sample data for demonstration (remove in production)
if (!localStorage.getItem('messTracker')) {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const dayBeforeYesterday = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const dayBeforeYesterdayStr = `${dayBeforeYesterday.getFullYear()}-${String(dayBeforeYesterday.getMonth() + 1).padStart(2, '0')}-${String(dayBeforeYesterday.getDate()).padStart(2, '0')}`;
    const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
    
    const sampleMesses = [
        {
            id: '1',
            name: 'Shree Mess',
            totalThalis: 30,
            totalCost: 3000,
            startDate: todayStr,
            validityDays: 40,
            usedThalis: 5,
            dailyUsage: {
                [todayStr]: 1,
                [yesterdayStr]: 2,
                [dayBeforeYesterdayStr]: 1
            },
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Annapurna',
            totalThalis: 25,
            totalCost: 2500,
            startDate: weekAgoStr,
            validityDays: 35,
            usedThalis: 8,
            dailyUsage: {
                [todayStr]: 0,
                [yesterdayStr]: 1
            },
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('messTracker', JSON.stringify(sampleMesses));
}
