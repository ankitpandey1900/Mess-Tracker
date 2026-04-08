# Mess Tracker - Thali Management System

A modern, glassmorphic UI component for tracking multiple mess subscriptions with precision and style. Built for developers, students, and creators who value structure and simplicity.

## ✨ Features

### 🔹 Core Functionality
- **Multiple Mess Management**: Track unlimited mess subscriptions
- **Thali Usage Tracking**: Real-time monitoring of thali consumption
- **Smart Calculations**: Auto-calculated remaining thalis and cost per thali
- **Date Management**: Start date and validity period tracking
- **Daily Toggle**: Mark thali usage with simple toggle controls


## 📱 Usage

### Adding a Mess Plan
1. Click the "Add Mess" button
2. Fill in mess details:
   - Mess name (e.g., "Shree Mess", "Annapurna")
   - Total thalis available
   - Total cost
   - Start date
   - Validity period in days
3. Save to create your mess plan

### Daily Tracking
- Use the "Mark Today" button to record thali usage
- Toggle switches for easy daily tracking
- Automatic calculation of remaining thalis

### Usage Analytics
- Click "Usage Details" to view:
  - Usage streak counter
  - Heatmap visualization
  - Detailed usage patterns

### Managing Plans
- Edit mess details with the edit button
- Delete plans when no longer needed
- All data persists in browser localStorage


## 🎯 Key Components

### Mess Card Structure
```javascript
{
  id: "unique_identifier",
  name: "Mess Name",
  totalThalis: 30,
  totalCost: 3000,
  startDate: "2024-01-01",
  validityDays: 40,
  usedThalis: 5,
  dailyUsage: {
    "2024-01-01": true,
    "2024-01-02": false
  }
}
```

### Statistics Tracking
- Total thalis across all messes
- Used thalis with real-time updates
- Remaining thalis calculation
- Average usage per day

### Alert System
- High usage rate warnings
- Visual indicators for over-consumption
- Streak tracking for motivation





**Built with ❤️ for developers who value structure, simplicity, and visual clarity.**
