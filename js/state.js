// Mess Tracker Application
class MessTracker {
    constructor() {
        this.messes = this.loadMesses();
        this.currentEditingId = null;
        this.currentUsageMessId = null;
        
