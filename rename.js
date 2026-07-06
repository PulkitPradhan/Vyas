const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(dirPath);
  });
}

function replaceInFile(filePath) {
  if (!filePath.match(/\.(tsx|ts|js|jsx|css|md|json)$/)) return;
  // Exclude node_modules, .next, etc
  if (filePath.includes('node_modules') || filePath.includes('.next') || filePath.includes('.git')) return;

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Replace exact cases
  newContent = newContent.replace(/MediServ/g, 'Vyas');
  newContent = newContent.replace(/mediserv/g, 'vyas');

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated:', filePath);
  }
}

const rootDirs = ['./app', './components', './lib', './public', './UI&UX.md', './ARCHITECTURE.md', './BUILD.md', './DECISIONS.md', './DESIGN.md', './README.md', './package.json'];

rootDirs.forEach(item => {
  if (fs.existsSync(item)) {
    if (fs.statSync(item).isDirectory()) {
      walkDir(item, replaceInFile);
    } else {
      replaceInFile(item);
    }
  }
});

console.log('Rename complete.');
