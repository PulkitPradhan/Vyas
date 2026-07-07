const fs = require('fs');
const content = fs.readFileSync('react-doctor-report.json', 'utf16le');
const cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
const report = JSON.parse(cleanContent);

console.log('Overall Score:', report.summary.score);

const grouped = {};
for (const diag of report.diagnostics) {
  if (diag.filePath.includes('.kilo') || diag.filePath.includes('.next') || diag.filePath.includes('node_modules')) continue;
  
  const key = diag.rule;
  if (!grouped[key]) grouped[key] = { count: 0, penalty: 0, files: new Set(), msg: diag.message };
  grouped[key].count++;
  grouped[key].files.add(diag.filePath);
}

const entries = Object.entries(grouped).sort((a, b) => b[1].count - a[1].count);

console.log('\nTop Error Rules to Fix (ignoring hidden/build folders):');
let total = 0;
for (const [ruleId, stats] of entries) {
  console.log(`- ${ruleId}: ${stats.count} occurrences across ${stats.files.size} files.`);
  console.log(`  Message: ${stats.msg}`);
  console.log(`  Files: ${Array.from(stats.files).slice(0, 3).join(', ')}${stats.files.size > 3 ? '...' : ''}\n`);
  total += stats.count;
}
console.log(`Total errors in main codebase: ${total}`);
