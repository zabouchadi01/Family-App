const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../src/assets/weather-icons');
const backupDir = path.join(iconsDir, '.backup');

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Get all SVG files
const svgFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));

svgFiles.forEach(file => {
  const filePath = path.join(iconsDir, file);
  const backupPath = path.join(backupDir, file);

  // Read and backup original
  let content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(backupPath, content);

  // Replace SVG tag with viewBox
  content = content.replace(
    /<svg width="56" height="48"/,
    '<svg width="56" height="48" viewBox="0 -10 56 68"'
  );

  // Write modified content
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${file}`);
});

console.log(`\nProcessed ${svgFiles.length} SVG files`);
console.log(`Backups saved to: ${backupDir}`);
