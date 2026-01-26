/**
 * Clean SVG files for React Native compatibility
 * Removes style tags, CDATA, filters, and animation attributes
 */

const fs = require('fs');
const path = require('path');

const SVG_DIR = path.join(__dirname, '../src/assets/weather-icons');

function cleanSvg(svgContent) {
  // Remove XML declaration
  let cleaned = svgContent.replace(/<\?xml[^>]*\?>\s*/g, '');

  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove <defs> sections (contains filters and styles)
  cleaned = cleaned.replace(/<defs>[\s\S]*?<\/defs>/g, '');

  // Remove filter attributes
  cleaned = cleaned.replace(/\s+filter="[^"]*"/g, '');

  // Remove style attributes with animations
  cleaned = cleaned.replace(/\s+style="[^"]*"/g, '');

  // Remove class attributes (used for animations)
  cleaned = cleaned.replace(/\s+class="[^"]*"/g, '');

  // Simplify viewBox and dimensions
  cleaned = cleaned.replace(/width="\d+"/, 'width="100%"');
  cleaned = cleaned.replace(/height="\d+"/, 'height="100%"');

  // Clean up extra whitespace and newlines
  cleaned = cleaned.replace(/\n\s*\n/g, '\n');
  cleaned = cleaned.replace(/>\s+</g, '><');

  return cleaned.trim();
}

function processDirectory() {
  const files = fs.readdirSync(SVG_DIR);
  const svgFiles = files.filter(f => f.endsWith('.svg') && !f.startsWith('.'));

  console.log(`Processing ${svgFiles.length} SVG files...`);

  svgFiles.forEach(file => {
    const filePath = path.join(SVG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = cleanSvg(content);

    // Write cleaned version
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`✓ Cleaned ${file}`);
  });

  console.log('\nAll SVG files cleaned successfully!');
}

try {
  processDirectory();
} catch (error) {
  console.error('Error processing SVGs:', error);
  process.exit(1);
}
