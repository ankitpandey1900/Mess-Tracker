// Mess Tracker Application
class MessTracker {
    constructor() {
        this.messes = this.loadMesses();
        this.currentEditingId = null;
        this.currentUsageMessId = null;
        
        this.initializeApp();
        this.bindEvents();
        this.renderMesses();
        this.updateStats();
    }

    // Initialize the application
    initializeApp() {
        // Set default start date to today
        const today = this.formatDateForInput(new Date());
        const startDateEl = document.getElementById('startDate');
        if (startDateEl) {
            startDateEl.value = today;
        } else {
            console.error('Start date element not found');
        }
        
        // Debug: Check if all form elements exist
        this.debugFormElements();
        
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


    // Format date for display (DD/MM/YYYY)
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Format date for input (YYYY-MM-DD)
    formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Parse date from DD/MM/YYYY format
    parseDate(dateString) {
        if (!dateString) return null;
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return new Date(dateString);
    }

    // Debug function to check form elements
    debugFormElements() {
        const requiredElements = [
            'messName', 'totalThalis', 'totalCost', 'startDate', 'validityDays',
            'messForm', 'messModal', 'addMessBtn'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.error('Missing form elements:', missingElements);
            this.showToast(`Missing form elements: ${missingElements.join(', ')}`, 'error');
        } else {
            console.log('All form elements found successfully');
        }
    }

    // Bind event listeners
    bindEvents() {
        // Modal controls
        const addMessBtn = document.getElementById('addMessBtn');
        const closeModalBtn = document.getElementById('closeModal');
        const closeUsageModalBtn = document.getElementById('closeUsageModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const resetDataBtn = document.getElementById('resetDataBtn');
        const messForm = document.getElementById('messForm');
        
        console.log('Binding events to elements:', {
            addMessBtn: !!addMessBtn,
            closeModalBtn: !!closeModalBtn,
            closeUsageModalBtn: !!closeUsageModalBtn,
            cancelBtn: !!cancelBtn,
            resetDataBtn: !!resetDataBtn,
            messForm: !!messForm
        });
        
        if (addMessBtn) addMessBtn.addEventListener('click', () => this.openModal());
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        if (closeUsageModalBtn) closeUsageModalBtn.addEventListener('click', () => this.closeUsageModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
        if (resetDataBtn) resetDataBtn.addEventListener('click', () => this.resetData());
        if (messForm) {
            messForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            console.log('Form event listener added successfully');
        } else {
            console.error('Form element not found for event binding');
        }
        
        // Modal overlay clicks
        document.getElementById('messModal').addEventListener('click', (e) => {
            if (e.target.id === 'messModal') this.closeModal();
        });
        
        document.getElementById('usageModal').addEventListener('click', (e) => {
            if (e.target.id === 'usageModal') this.closeUsageModal();
        });

        // Today's thali toggle
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
            this.openModal();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeUsageModal();
        }
        
        // Ctrl/Cmd + R: Reset data (with confirmation)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.resetData();
        }
    }

    // Load messes from localStorage
    loadMesses() {
        const saved = localStorage.getItem('messTracker');
        if (saved) {
            try {
                const messes = JSON.parse(saved);
                // Validate and clean up any corrupted data
                return messes.filter(mess => {
                    return mess && 
                           mess.name && 
                           this.validateNumber(mess.totalThalis, 0) > 0 &&
                           this.validateNumber(mess.totalCost, 0) > 0;
                }).map(mess => ({
                    ...mess,
                    totalThalis: this.validateNumber(mess.totalThalis, 0),
                    usedThalis: this.validateNumber(mess.usedThalis, 0),
                    totalCost: this.validateNumber(mess.totalCost, 0),
                    validityDays: this.validateNumber(mess.validityDays, 30),
                    dailyUsage: mess.dailyUsage || {}
                }));
            } catch (error) {
                console.error('Error loading mess data:', error);
                return [];
            }
        }
        return [];
    }

    // Save messes to localStorage
    saveMesses() {
        localStorage.setItem('messTracker', JSON.stringify(this.messes));
    }

    // Helper function to validate and sanitize numbers
    validateNumber(value, defaultValue = 0) {
        if (value === null || value === undefined || isNaN(value)) {
            return defaultValue;
        }
        const num = Number(value);
        return isNaN(num) ? defaultValue : Math.max(0, num);
    }

    // Open modal for adding/editing mess
    openModal(messId = null) {
        this.currentEditingId = messId;
        const modal = document.getElementById('messModal');
        const form = document.getElementById('messForm');
        const title = document.getElementById('modalTitle');
        
        if (messId) {
            const mess = this.messes.find(m => m.id === messId);
            if (mess) {
                title.textContent = 'Edit Mess';
                document.getElementById('messName').value = mess.name;
                document.getElementById('totalThalis').value = mess.totalThalis;
                document.getElementById('totalCost').value = mess.totalCost;
                document.getElementById('startDate').value = mess.startDate;
                document.getElementById('validityDays').value = mess.validityDays;
            }
        } else {
            title.textContent = 'Add New Mess';
            form.reset();
            document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
    }

    // Close modal
    closeModal() {
        document.getElementById('messModal').classList.remove('active');
        this.currentEditingId = null;
    }

    // Handle form submission
    handleFormSubmit(e) {
        console.log('Form submission triggered!', e);
        if (e) e.preventDefault();
        
        try {
            // Get form values using a more robust approach
            const formData = this.getFormData();
            
            if (!formData) {
                this.showToast('Form error: Please refresh the page', 'error');
                return;
            }
            
            const { name, totalThalis, totalCost, startDate, validityDays } = formData;
            
            // Validation checks
            if (!name) {
                this.showToast('Please enter a mess name', 'error');
                this.focusElement('messName');
                return;
            }
            
            if (!totalThalis || totalThalis <= 0) {
                this.showToast('Please enter a valid number of total thalis', 'error');
                this.focusElement('totalThalis');
                return;
            }
            
            if (!totalCost || totalCost <= 0) {
                this.showToast('Please enter a valid total cost', 'error');
                this.focusElement('totalCost');
                return;
            }
            
            if (!startDate) {
                this.showToast('Please select a start date', 'error');
                this.focusElement('startDate');
                return;
            }
            
            if (!validityDays || validityDays <= 0) {
                this.showToast('Please enter a valid validity period', 'error');
                this.focusElement('validityDays');
                return;
            }
            
            const finalFormData = {
                name,
                totalThalis,
                totalCost,
                startDate,
                validityDays
            };

            console.log('Form data:', finalFormData); // Debug log

            if (this.currentEditingId) {
                this.updateMess(this.currentEditingId, finalFormData);
            } else {
                this.addMess(finalFormData);
            }
            
            this.closeModal();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showToast('An error occurred. Please try again.', 'error');
        }
    }

    // Get form data with robust error handling
    getFormData() {
        try {
            // Try multiple approaches to get form data
            const form = document.getElementById('messForm');
            if (form) {
                const formData = new FormData(form);
                return {
                    name: formData.get('messName') || document.getElementById('messName')?.value || '',
                    totalThalis: parseInt(formData.get('totalThalis') || document.getElementById('totalThalis')?.value || '0'),
                    totalCost: parseFloat(formData.get('totalCost') || document.getElementById('totalCost')?.value || '0'),
                    startDate: formData.get('startDate') || document.getElementById('startDate')?.value || '',
                    validityDays: parseInt(formData.get('validityDays') || document.getElementById('validityDays')?.value || '0')
                };
            }
            
            // Fallback: direct element access
            const name = document.getElementById('messName')?.value?.trim() || '';
            const totalThalis = parseInt(document.getElementById('totalThalis')?.value || '0');
            const totalCost = parseFloat(document.getElementById('totalCost')?.value || '0');
            const startDate = document.getElementById('startDate')?.value || '';
            const validityDays = parseInt(document.getElementById('validityDays')?.value || '0');
            
            return { name, totalThalis, totalCost, startDate, validityDays };
            
        } catch (error) {
            console.error('Error getting form data:', error);
            return null;
        }
    }

    // Focus element helper
    focusElement(id) {
        try {
            const element = document.getElementById(id);
            if (element) {
                element.focus();
            }
        } catch (error) {
            console.error('Error focusing element:', error);
        }
    }

    // Manual form submission method (fallback)
    submitFormManually() {
        console.log('Manual form submission triggered');
        this.handleFormSubmit(null);
    }

    // Add new mess
    addMess(data) {
        const mess = {
            id: Date.now().toString(),
            ...data,
            usedThalis: 0,
            dailyUsage: {},
            createdAt: new Date().toISOString()
        };
        
        this.messes.push(mess);
        this.saveMesses();
        this.renderMesses();
        this.updateStats();
        this.showToast(`Mess "${mess.name}" added successfully!`, 'success');
    }

    // Update existing mess
    updateMess(id, data) {
        const index = this.messes.findIndex(m => m.id === id);
        if (index !== -1) {
            this.messes[index] = { ...this.messes[index], ...data };
            this.saveMesses();
            this.renderMesses();
            this.updateStats();
            this.showToast(`Mess "${data.name}" updated successfully!`, 'success');
        }
    }

    // Delete mess
    deleteMess(id) {
        const mess = this.messes.find(m => m.id === id);
        if (confirm('Are you sure you want to delete this mess?')) {
            this.messes = this.messes.filter(m => m.id !== id);
            this.saveMesses();
            this.renderMesses();
            this.updateStats();
            this.showToast(`Mess "${mess?.name || 'Unknown'}" deleted successfully!`, 'success');
        }
    }

    // Render all mess cards
    renderMesses() {
        const grid = document.getElementById('messGrid');
        grid.innerHTML = '';

        if (this.messes.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No Mess Plans Yet</h3>
                    <p>Add your first mess plan to start tracking your thali usage</p>
                </div>
            `;
            return;
        }

        this.messes.forEach(mess => {
            const card = this.createMessCard(mess);
            grid.appendChild(card);
        });
    }

    // Create individual mess card
    createMessCard(mess) {
        const card = document.createElement('div');
        card.className = 'mess-card fade-in';
        
        // Validate and sanitize data
        const totalThalis = this.validateNumber(mess.totalThalis, 0);
        const usedThalis = this.validateNumber(mess.usedThalis, 0);
        const totalCost = this.validateNumber(mess.totalCost, 0);
        const validityDays = this.validateNumber(mess.validityDays, 30);
        
        const remainingThalis = Math.max(0, totalThalis - usedThalis);
        const costPerThali = totalThalis > 0 ? totalCost / totalThalis : 0;
        const usagePercentage = totalThalis > 0 ? (usedThalis / totalThalis) * 100 : 0;
        
        const endDate = new Date(mess.startDate);
        endDate.setDate(endDate.getDate() + validityDays);
        
        const today = this.formatDateForInput(new Date());
        const todayThaliCount = mess.dailyUsage && mess.dailyUsage[today] || 0;
        const isTodayUsed = todayThaliCount > 0;
        
        // Calculate usage rate
        const daysSinceStart = Math.ceil((new Date() - new Date(mess.startDate)) / (1000 * 60 * 60 * 24));
        const usageRate = daysSinceStart > 0 ? usedThalis / daysSinceStart : 0;
        const showAlert = usageRate > 1 && usedThalis > 0;

        card.innerHTML = `
            <div class="mess-header">
                <div>
                    <h3 class="mess-name">${mess.name}</h3>
                    <p class="mess-dates">${this.formatDate(mess.startDate)} - ${this.formatDate(endDate)}</p>
                </div>
                <div class="mess-actions">
                    <button class="action-btn" onclick="messTracker.openModal('${mess.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="messTracker.deleteMess('${mess.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="mess-stats">
                <div class="stat-item">
                    <span class="stat-value">${totalThalis}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${usedThalis}</span>
                    <span class="stat-label">Used</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${remainingThalis}</span>
                    <span class="stat-label">Left</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">₹${costPerThali.toFixed(0)}</span>
                    <span class="stat-label">Per Thali</span>
                </div>
            </div>
            
            <div class="mess-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${usagePercentage}%"></div>
                </div>
                <div class="progress-text">
                    <span>${usagePercentage.toFixed(1)}% used</span>
                    <span>${remainingThalis} remaining</span>
                </div>
            </div>
            
            ${showAlert ? `
                <div class="alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>High usage rate: ${usageRate.toFixed(1)} thalis/day</span>
                </div>
            ` : ''}
            
            <div class="mess-actions-bottom">
                <button class="usage-btn" onclick="messTracker.openUsageModal('${mess.id}')">
                    <i class="fas fa-chart-line"></i>
                    Usage Details
                </button>
                <button class="today-toggle ${isTodayUsed ? 'used' : ''}" onclick="messTracker.toggleTodayThali('${mess.id}')">
                    <i class="fas fa-${isTodayUsed ? 'check' : 'plus'}"></i>
                    ${isTodayUsed ? `Used Today (${todayThaliCount})` : 'Mark Today'}
                </button>
            </div>
        `;
        
        return card;
    }

    // Open usage modal
    openUsageModal(messId) {
        this.currentUsageMessId = messId;
        const mess = this.messes.find(m => m.id === messId);
        if (!mess) return;

        document.getElementById('usageMessName').textContent = mess.name;
        
        // Update today's thali count
        const today = this.formatDateForInput(new Date());
        const todayUsage = mess.dailyUsage[today] || 0;
        document.getElementById('todayThaliCount').textContent = todayUsage;
        
        // Set max date to today for previous day picker
        document.getElementById('previousDate').max = today;
        document.getElementById('previousDate').value = '';
        
        this.updateUsageStats(mess);
        this.updatePreviousDayStatus();
        
        document.getElementById('usageModal').classList.add('active');
    }

    // Close usage modal
    closeUsageModal() {
        document.getElementById('usageModal').classList.remove('active');
        this.currentUsageMessId = null;
    }

    // Adjust today's thali count
    adjustTodayThali(change) {
        const mess = this.messes.find(m => m.id === this.currentUsageMessId);
        if (!mess) return;

        const today = this.formatDateForInput(new Date());
        const currentCount = mess.dailyUsage[today] || 0;
        const newCount = Math.max(0, currentCount + change);
        
        // Check if user is trying to exceed total thalis
        if (newCount > mess.totalThalis) {
            this.showToast(`Cannot exceed total thalis (${mess.totalThalis})`, 'warning');
            return;
        }
        
        // Check if user is trying to exceed remaining thalis
        const remainingThalis = mess.totalThalis - mess.usedThalis + currentCount;
        if (newCount > remainingThalis) {
            this.showToast(`Only ${remainingThalis} thalis remaining`, 'warning');
            return;
        }
        
        // Update the count
        const oldCount = mess.dailyUsage[today] || 0;
        mess.dailyUsage[today] = newCount;
        
        // Update used thalis count
        mess.usedThalis = mess.usedThalis - oldCount + newCount;
        
        // Update display
        document.getElementById('todayThaliCount').textContent = newCount;
        
        // Show feedback
        if (change > 0) {
            this.showToast(`Added ${change} thali for today (${newCount} total)`, 'success');
        } else if (change < 0) {
            this.showToast(`Removed ${Math.abs(change)} thali for today (${newCount} total)`, 'success');
        }
        
        this.saveMesses();
        this.renderMesses();
        this.updateStats();
        this.updateUsageStats(mess);
    }

    // Toggle today's thali usage (legacy method for card buttons)
    toggleTodayThali(messId) {
        if (typeof messId === 'string') {
            // Called from card button - use counter approach
            const mess = this.messes.find(m => m.id === messId);
            if (!mess) return;

            const today = this.formatDateForInput(new Date());
            const currentCount = mess.dailyUsage[today] || 0;
            
            if (currentCount === 0) {
                // Add one thali
                this.currentUsageMessId = messId;
                this.adjustTodayThali(1);
            } else {
                // Remove all thalis for today
                this.currentUsageMessId = messId;
                this.adjustTodayThali(-currentCount);
            }
        } else {
            // Called from modal toggle (legacy)
            const checked = messId;
            if (checked) {
                this.adjustTodayThali(1);
            } else {
                const mess = this.messes.find(m => m.id === this.currentUsageMessId);
                if (mess) {
                    const today = this.formatDateForInput(new Date());
                    const currentCount = mess.dailyUsage[today] || 0;
                    this.adjustTodayThali(-currentCount);
                }
            }
        }
    }

    // Update usage statistics
    updateUsageStats(mess) {
        const streak = this.calculateStreak(mess);
        const daysActive = this.calculateDaysActive(mess);
        const usageRate = this.calculateUsageRate(mess);
        const efficiency = this.calculateEfficiency(mess);
        
        document.querySelector('.streak-number').textContent = streak;
        document.getElementById('daysActive').textContent = daysActive;
        document.getElementById('usageRate').textContent = `${usageRate.toFixed(1)}/day`;
        document.getElementById('efficiency').textContent = `${efficiency.toFixed(0)}%`;
    }

    // Calculate usage streak
    calculateStreak(mess) {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (mess.dailyUsage[dateStr]) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    // Calculate days active (days with at least one thali used)
    calculateDaysActive(mess) {
        if (!mess.dailyUsage) return 0;
        return Object.values(mess.dailyUsage).filter(used => used).length;
    }

    // Calculate usage rate (thalis per day)
    calculateUsageRate(mess) {
        const daysSinceStart = Math.ceil((new Date() - new Date(mess.startDate)) / (1000 * 60 * 60 * 24));
        return daysSinceStart > 0 ? mess.usedThalis / daysSinceStart : 0;
    }

    // Calculate efficiency (percentage of days with usage)
    calculateEfficiency(mess) {
        const daysSinceStart = Math.ceil((new Date() - new Date(mess.startDate)) / (1000 * 60 * 60 * 24));
        const daysActive = this.calculateDaysActive(mess);
        return daysSinceStart > 0 ? (daysActive / daysSinceStart) * 100 : 0;
    }

    // Handle previous date change
    handlePreviousDateChange(selectedDate) {
        const mess = this.messes.find(m => m.id === this.currentUsageMessId);
        if (!mess || !selectedDate) {
            document.getElementById('markPreviousBtn').disabled = true;
            document.getElementById('previousDayCounter').style.display = 'none';
            document.getElementById('previousDayStatus').innerHTML = '';
            return;
        }

        const today = this.formatDateForInput(new Date());
        const startDate = mess.startDate;
        
        // Check if date is valid
        if (selectedDate > today) {
            document.getElementById('markPreviousBtn').disabled = true;
            document.getElementById('previousDayCounter').style.display = 'none';
            this.showPreviousDayStatus('Cannot select future dates', 'future');
            return;
        }
        
        if (selectedDate < startDate) {
            document.getElementById('markPreviousBtn').disabled = true;
            document.getElementById('previousDayCounter').style.display = 'none';
            this.showPreviousDayStatus('Date is before mess start date', 'future');
            return;
        }

        // Show counter and update count
        document.getElementById('previousDayCounter').style.display = 'block';
        const thaliCount = mess.dailyUsage[selectedDate] || 0;
        document.getElementById('previousDayCount').textContent = thaliCount;
        
        // Enable button and show status
        document.getElementById('markPreviousBtn').disabled = false;
        const formattedDate = this.formatDate(selectedDate);
        this.showPreviousDayStatus(
            `${formattedDate}: ${thaliCount} thali${thaliCount !== 1 ? 's' : ''} used`,
            thaliCount > 0 ? 'used' : 'not-used'
        );
    }

    // Adjust previous day thali count
    adjustPreviousDayThali(change) {
        const selectedDate = document.getElementById('previousDate').value;
        const mess = this.messes.find(m => m.id === this.currentUsageMessId);
        
        if (!mess || !selectedDate) {
            this.showToast('Please select a date first', 'error');
            return;
        }

        const currentCount = mess.dailyUsage[selectedDate] || 0;
        const newCount = Math.max(0, currentCount + change);
        
        // Check if user is trying to exceed total thalis
        if (newCount > mess.totalThalis) {
            this.showToast(`Cannot exceed total thalis (${mess.totalThalis})`, 'warning');
            return;
        }
        
        // Check if user is trying to exceed remaining thalis
        const remainingThalis = mess.totalThalis - mess.usedThalis + currentCount;
        if (newCount > remainingThalis) {
            this.showToast(`Only ${remainingThalis} thalis remaining`, 'warning');
            return;
        }
        
        // Update the count
        mess.dailyUsage[selectedDate] = newCount;
        
        // Update used thalis count
        mess.usedThalis = mess.usedThalis - currentCount + newCount;
        
        // Update display
        document.getElementById('previousDayCount').textContent = newCount;
        
        // Show feedback
        const formattedDate = this.formatDate(selectedDate);
        if (change > 0) {
            this.showToast(`Added ${change} thali for ${formattedDate} (${newCount} total)`, 'success');
        } else if (change < 0) {
            this.showToast(`Removed ${Math.abs(change)} thali for ${formattedDate} (${newCount} total)`, 'success');
        }
        
        // Update status
        this.showPreviousDayStatus(
            `${formattedDate}: ${newCount} thali${newCount !== 1 ? 's' : ''} used`,
            newCount > 0 ? 'used' : 'not-used'
        );
        
        this.saveMesses();
        this.renderMesses();
        this.updateStats();
        this.updateUsageStats(mess);
    }

    // Show previous day status
    showPreviousDayStatus(message, status) {
        const statusEl = document.getElementById('previousDayStatus');
        statusEl.textContent = message;
        statusEl.className = `previous-day-status ${status}`;
    }

    // Mark previous day
    markPreviousDay() {
        const selectedDate = document.getElementById('previousDate').value;
        const mess = this.messes.find(m => m.id === this.currentUsageMessId);
        
        if (!mess || !selectedDate) {
            this.showToast('Please select a date first', 'error');
            return;
        }

        const isCurrentlyUsed = mess.dailyUsage[selectedDate] || false;
        
        if (!isCurrentlyUsed) {
            // Mark as used
            mess.usedThalis++;
            mess.dailyUsage[selectedDate] = true;
            this.showToast(`Thali marked as used for ${selectedDate}`, 'success');
        } else {
            // Mark as not used
            mess.usedThalis--;
            mess.dailyUsage[selectedDate] = false;
            this.showToast(`Thali usage removed for ${selectedDate}`, 'success');
        }

        this.saveMesses();
        this.renderMesses();
        this.updateStats();
        this.updateUsageStats(mess);
        this.updatePreviousDayStatus();
    }

    // Update previous day status
    updatePreviousDayStatus() {
        const selectedDate = document.getElementById('previousDate').value;
        if (selectedDate) {
            this.handlePreviousDateChange(selectedDate);
        } else {
            document.getElementById('markPreviousBtn').disabled = true;
            document.getElementById('previousDayStatus').innerHTML = '';
        }
    }

    // Update overall statistics
    updateStats() {
        const totalThalis = this.messes.reduce((sum, mess) => {
            return sum + this.validateNumber(mess.totalThalis, 0);
        }, 0);
        
        const usedThalis = this.messes.reduce((sum, mess) => {
            return sum + this.validateNumber(mess.usedThalis, 0);
        }, 0);
        
        const remainingThalis = Math.max(0, totalThalis - usedThalis);
        
        // Calculate average usage per day
        let totalDays = 0;
        let totalUsage = 0;
        
        this.messes.forEach(mess => {
            const daysSinceStart = Math.ceil((new Date() - new Date(mess.startDate)) / (1000 * 60 * 60 * 24));
            if (daysSinceStart > 0) {
                totalDays += daysSinceStart;
                totalUsage += this.validateNumber(mess.usedThalis, 0);
            }
        });
        
        const averageUsage = totalDays > 0 ? (totalUsage / totalDays).toFixed(1) : '0.0';
        
        document.getElementById('totalThalis').textContent = totalThalis;
        document.getElementById('usedThalis').textContent = usedThalis;
        document.getElementById('remainingThalis').textContent = remainingThalis;
        document.getElementById('averageUsage').textContent = averageUsage;
    }

    // Reset all data (for debugging)
    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.removeItem('messTracker');
            this.messes = [];
            this.renderMesses();
            this.updateStats();
            this.showToast('All data has been reset', 'success');
        }
    }

    // Show toast notification
    showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        // Set message and icon
        messageEl.textContent = message;
        
        // Set icon based on type
        switch (type) {
            case 'success':
                icon.className = 'toast-icon fas fa-check-circle';
                break;
            case 'error':
                icon.className = 'toast-icon fas fa-exclamation-circle';
                break;
            case 'warning':
                icon.className = 'toast-icon fas fa-exclamation-triangle';
                break;
            default:
                icon.className = 'toast-icon fas fa-info-circle';
        }
        
        // Set toast type and show
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        // Auto hide after duration
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

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
