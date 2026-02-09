# Device Dashboard - MyGeotab Add-In

A modern, responsive MyGeotab Add-In that displays device-specific analytics including usage stats, exception tracking, and fuel data.

## Features

- **Device Selection**: Choose any device from your fleet
- **Date Range Filtering**: Default week view (Mon-Sun) with presets
- **Usage Statistics**: Days driven, fuel level, distance, time driven, fuel economy, odometer
- **Usage Breakdown**: Visual representation of driving, idle, and stopped time
- **Exceptions Chart**: Bar chart showing exception counts by rule type
- **Exceptions Table**: Detailed list with driver info, location, video links
- **Fuel-Ups Table**: Fuel fill-up events with driver and location data
- **Mobile Responsive**: Works on phones and tablets
- **Auto-Unit Detection**: Automatically uses user's metric/imperial preference

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A MyGeotab account with access to Administration > Add-Ins

### Installation

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Or run in development mode
npm run dev
```

### Development

```bash
npm run dev
```

This starts a local development server at http://localhost:9000 with hot reloading.

### Production Build

```bash
npm run build
```

This creates a `dist/` folder with:
- `dashboard.html` - HTML entry point
- `dashboard.js` - Bundled JavaScript
- `dashboard.css` - Bundled styles
- `config.json` - MyGeotab configuration

## Deployment

### GitHub Pages

1. Push your code to GitHub
2. Enable GitHub Pages in Settings > Pages
3. Set source to `main` branch, `/dist` folder (or use GitHub Actions)
4. Your Add-In will be available at: `https://<username>.github.io/<repo>/dashboard.html`

### Adding to MyGeotab

1. Log in to MyGeotab
2. Go to **Administration > System Settings > Add-Ins**
3. Enable "Allow unverified Add-Ins"
4. Click "Add" and paste this configuration:

```json
{
  "name": "Device Dashboard",
  "supportEmail": "https://github.com/<your-username>/geotabCustomDashboard",
  "version": "1.0.0",
  "items": [
    {
      "url": "https://<your-username>.github.io/geotabCustomDashboard/dashboard.html",
      "path": "ActivityLink/",
      "menuName": {
        "en": "Device Dashboard"
      }
    }
  ]
}
```

5. Hard refresh (Ctrl+Shift+R) if the Add-In doesn't appear in the menu

## Project Structure

```
geotabCustomDashboard/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── index.jsx           # MyGeotab Add-In entry point
│   ├── App.jsx             # Main dashboard component
│   ├── components/
│   │   ├── DeviceHeader.jsx
│   │   ├── DeviceSelector.jsx
│   │   ├── DateRangeFilter.jsx
│   │   ├── UsageStats.jsx
│   │   ├── UsageBreakdown.jsx
│   │   ├── ExceptionsChart.jsx
│   │   ├── ExceptionsTable.jsx
│   │   └── FuelUpsTable.jsx
│   ├── hooks/
│   │   ├── useGeotabApi.js
│   │   ├── useDeviceData.js
│   │   └── useUnits.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── dateUtils.js
│   │   └── formatters.js
│   └── styles/
│       └── dashboard.css
├── config.json             # MyGeotab Add-In configuration
├── package.json
├── webpack.config.js
└── .babelrc
```

## API Calls

The dashboard makes these Geotab API calls:

- `Get Device` - Device details
- `Get Trip` - Trips in date range
- `Get ExceptionEvent` - Exception events
- `Get FillUp` - Fuel fill-up events
- `Get StatusData` - Fuel level and odometer readings
- `Get Rule` - Exception rule names
- `Get User` - Driver information
- `GetAddresses` - Reverse geocoding for locations

## Customization

### Changing Date Range Default

Edit `src/utils/dateUtils.js`:

```javascript
export function getDefaultDateRange() {
  // Change to last 30 days:
  return getDateRangeFromPreset('last30Days');
}
```

### Adding More Stats

Edit `src/components/UsageStats.jsx` to add new stat cards.

### Changing Colors

Edit `src/utils/constants.js` and `src/styles/dashboard.css` to update the color scheme.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- iOS Safari 13+
- Android Chrome 80+

## Troubleshooting

### Add-In not appearing in menu
- Hard refresh the page (Ctrl+Shift+R)
- Clear browser cache
- Verify "Allow unverified Add-Ins" is enabled

### Data not loading
- Check browser console for API errors
- Verify the device has data for the selected date range
- Ensure you have appropriate permissions

### Styling issues
- The Add-In uses its own CSS, separate from Zenith
- Check for CSS conflicts in browser dev tools

## License

MIT
