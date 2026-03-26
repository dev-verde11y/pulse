const fs = require('fs');
const path = require('path');

const dirsToScan = [
  path.join(__dirname, '..', 'src'),
  path.join(__dirname, '..', 'prisma')
];

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === 'migrations') continue;
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.endsWith('.prisma')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

const files = [];
dirsToScan.forEach(dir => walkSync(dir, files));

let replacedCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Enums Replacements (strictly uppercase bounds)
  newContent = newContent.replace(/\bMEGA_FAN_ANNUAL\b/g, 'LEGEND');
  newContent = newContent.replace(/\bMEGA_FAN\b/g, 'HERO');
  newContent = newContent.replace(/\bFAN\b/g, 'ADVENTURER');
  newContent = newContent.replace(/\bFREE\b/g, 'CITIZEN');

  // Specific naming adjustments in Seeders
  if (file.includes('seed.ts')) {
    // Replacing old plan names. Order is important
    newContent = newContent.replace(/'Aventureiro'/g, "'Civil'");
    newContent = newContent.replace(/'Cavaleiro'/g, "'Aventureiro'");
    newContent = newContent.replace(/'Titã Anual'/g, "'Imortal'");
    newContent = newContent.replace(/'Titã'/g, "'Herói'");
    
    // Replacing old dummy user names
    newContent = newContent.replace(/'Usuário Grátis'/g, "'Usuário Civil'");
    newContent = newContent.replace(/'Usuário Mega Fan Anual'/g, "'Usuário Imortal'");
    newContent = newContent.replace(/'Usuário Mega Fan'/g, "'Usuário Herói'");
    newContent = newContent.replace(/'Usuário Fan'/g, "'Usuário Aventureiro'");
  }

  // Dashboard component mapping
  if (file.includes('subscription') && file.includes('page.tsx')) {
    newContent = newContent.replace(/'Aventureiro'/g, "'Civil'");
    newContent = newContent.replace(/'Cavaleiro'/g, "'Aventureiro'");
    newContent = newContent.replace(/'Titã Anual'/g, "'Imortal'");
    newContent = newContent.replace(/'Titã'/g, "'Herói'");
  }

  // Profile mapping
  if (file.includes('profile') && file.includes('page.tsx')) {
    newContent = newContent.replace(/'Gratis'/g, "'Civil'");
    newContent = newContent.replace(/'Fan'/g, "'Aventureiro'");
    newContent = newContent.replace(/'Mega Fan'/g, "'Herói'");
    newContent = newContent.replace(/'Super Premium'/g, "'Imortal'");
  }

  // Notification mapping
  if (file.includes('NotificationForm.tsx')) {
    newContent = newContent.replace(/'Grátis'/g, "'Civil'");
    newContent = newContent.replace(/'Fan'/g, "'Aventureiro'");
    newContent = newContent.replace(/'Mega Fan Anual'/g, "'Imortal'");
    newContent = newContent.replace(/'Mega Fan'/g, "'Herói'");
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', file);
    replacedCount++;
  }
});

console.log(`\n✅ Renamed values in ${replacedCount} files successfully.`);
