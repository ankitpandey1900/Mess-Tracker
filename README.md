# Mess Tracker - Thali Management System

A modern, glassmorphic UI component for tracking multiple mess subscriptions with precision and style. Built for developers, students, and creators who value structure and simplicity.

## ✨ Features

### 🔹 Core Functionality
- **Multiple Mess Management**: Track unlimited mess subscriptions
- **Thali Usage Tracking**: Real-time monitoring of thali consumption
- **Smart Calculations**: Auto-calculated remaining thalis and cost per thali
- **Date Management**: Start date and validity period tracking
- **Daily Toggle**: Mark thali usage with simple toggle controls

### 🔹 Visual Insights
- **Usage Streak**: Track consecutive days of thali usage
- **Heatmap Visualization**: Visual representation of usage patterns
- **Progress Indicators**: Clear progress bars and statistics
- **Alert System**: Visual indicators for high usage rates (>1 thali/day)

### 🔹 Design Philosophy
- **Glassmorphism**: Soft blur effects with subtle borders
- **Kaluu-core Aesthetic**: Black base with neon green and saffron accents
- **Hacker Minimalism**: Clean, focused interface without clutter
- **Responsive Design**: Works seamlessly across all devices

## 🎨 Design System

### Color Palette
- **Base**: Kaluu-core black (#0a0a0a) with dark gray (#1a1a1a)
- **Accents**: Neon green (#00ff88) and saffron (#ff6b35)
- **Glass**: Semi-transparent overlays with blur effects
- **Typography**: JetBrains Mono for code, Inter for UI

### Components
- **Mess Cards**: Glassmorphic cards with usage statistics
- **Modals**: Smooth overlay dialogs for data entry
- **Heatmaps**: Visual usage patterns with color coding
- **Progress Bars**: Animated progress indicators

## 🚀 Getting Started

### Installation
1. Clone or download the project files
2. Open `index.html` in your browser
3. Start tracking your mess subscriptions!

### File Structure
```
mess-tracker/
├── index.html          # Main HTML structure
├── styles.css          # Glassmorphic CSS styles
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

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

## 🔧 Technical Features

### Data Persistence
- Browser localStorage for data persistence
- No external dependencies required
- Offline-first design

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly controls

### Performance
- Lightweight vanilla JavaScript
- CSS animations with hardware acceleration
- Efficient DOM manipulation

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

## 🎨 Customization

### Color Themes
Modify CSS custom properties in `styles.css`:
```css
:root {
  --neon-green: #00ff88;
  --saffron: #ff6b35;
  --kaluu-black: #0a0a0a;
}
```

### Layout Adjustments
- Grid columns: Modify `.mess-grid` CSS
- Card sizing: Adjust `.mess-card` dimensions
- Responsive breakpoints: Update media queries

## 🔮 Future Enhancements

### Planned Features
- Calendar integration
- Export/import functionality
- Advanced analytics
- Multi-user support
- Mobile app version

### Integration Possibilities
- Google Calendar sync
- Notion database export
- Slack integration
- API for external services

## 🛠️ Development

### Browser Support
- Modern browsers with CSS Grid support
- ES6+ JavaScript features
- CSS Custom Properties (CSS Variables)

### Performance Considerations
- Minimal DOM queries
- Efficient event handling
- CSS animations with `transform` and `opacity`

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

**Built with ❤️ for developers who value structure, simplicity, and visual clarity.**
