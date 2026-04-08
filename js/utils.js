        const today = this.formatDateForInput(new Date());
        const startDateEl = document.getElementById('startDate');
        if (startDateEl) {
            startDateEl.value = today;
        } else {
            console.error('Start date element not found');
        }
        
        // Debug: Check if all form elements exist
        this.debugFormElements();
        
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
    // Helper function to validate and sanitize numbers
    validateNumber(value, defaultValue = 0) {
        if (value === null || value === undefined || isNaN(value)) {
            return defaultValue;
        }
        const num = Number(value);
        return isNaN(num) ? defaultValue : Math.max(0, num);
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
        const today = this.formatDateForInput(new Date());
        const todayUsage = mess.dailyUsage[today] || 0;
        document.getElementById('todayThaliCount').textContent = todayUsage;
        
        // Set max date to today for previous day picker
        document.getElementById('previousDate').max = today;
        document.getElementById('previousDate').value = '';
        
        this.updateUsageStats(mess);
        this.updatePreviousDayStatus();
        
        const today = this.formatDateForInput(new Date());
        const currentCount = mess.dailyUsage[today] || 0;
        const newCount = Math.max(0, currentCount + change);
        
        // Check if user is trying to exceed total thalis
        if (newCount > mess.totalThalis) {
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
