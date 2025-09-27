// Simple icon creator for PWA
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = './icons';
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Simple SVG icon template
const createSVGIcon = (size) => {
    const iconSize = size;
    const fontSize = Math.floor(size * 0.6);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00ff88;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${iconSize}" height="${iconSize}" rx="${Math.floor(size * 0.2)}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#0a0a0a">🍽️</text>
</svg>`;
};

// Create icons
iconSizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const filename = `icon-${size}x${size}.png`;
    
    // For now, create SVG files that can be converted to PNG
    const svgFilename = `icon-${size}x${size}.svg`;
    fs.writeFileSync(path.join(iconsDir, svgFilename), svgContent);
    
    console.log(`Created ${svgFilename}`);
});

console.log('Icons created! You can convert SVG to PNG using online tools or image editors.');
