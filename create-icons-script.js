// Simple script to create PWA icons
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = './icons';
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple base64 encoded PNG for each size
// This is a minimal 1x1 pixel PNG with transparency
const createMinimalPNG = (size) => {
    // Simple 1x1 transparent PNG in base64
    const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    return Buffer.from(base64PNG, 'base64');
};

// Create a simple colored square PNG
const createColoredPNG = (size) => {
    // Create a simple colored square
    // This is a minimal implementation - in production you'd use a proper image library
    const canvas = require('canvas');
    const c = canvas.createCanvas(size, size);
    const ctx = c.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(1, '#8b5cf6');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add rounded corners
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.2);
    ctx.fill();
    
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw utensil icon
    ctx.fillStyle = '#0a0a0a';
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍽️', size / 2, size / 2);
    
    return c.toBuffer('image/png');
};

// Create icons
console.log('Creating PWA icons...');

iconSizes.forEach(size => {
    try {
        // Create a simple colored icon
        const iconBuffer = createColoredPNG(size);
        const filename = `icon-${size}x${size}.png`;
        const filepath = path.join(iconsDir, filename);
        
        fs.writeFileSync(filepath, iconBuffer);
        console.log(`✅ Created ${filename}`);
    } catch (error) {
        console.log(`❌ Failed to create icon-${size}x${size}.png:`, error.message);
        
        // Fallback: create a minimal PNG
        try {
            const minimalPNG = createMinimalPNG(size);
            const filename = `icon-${size}x${size}.png`;
            const filepath = path.join(iconsDir, filename);
            
            fs.writeFileSync(filepath, minimalPNG);
            console.log(`✅ Created minimal ${filename}`);
        } catch (fallbackError) {
            console.log(`❌ Failed to create minimal icon-${size}x${size}.png:`, fallbackError.message);
        }
    }
});

console.log('Icon creation complete!');
