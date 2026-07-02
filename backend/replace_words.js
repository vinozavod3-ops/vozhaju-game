const fs = require('fs');
const path = require('path');

const filesToUpdate = ['tempData.js', 'add_persian.js', 'add_levels.js'];

const replacements = [
  { search: /"НЕЗА"/g, replace: '"ГУРЗ"' },
  { search: /"Неза"/g, replace: '"Гурз"' },
  { search: /'НЕЗА'/g, replace: "'ГУРЗ'" },
  { search: /'Неза'/g, replace: "'Гурз'" },
  { search: /'نیزه'/g, replace: "'گرز'" },
  
  { search: /"НАЙЗА"/g, replace: '"ГУРЗ"' },
  { search: /"Найза"/g, replace: '"Гурз"' },
  { search: /'НАЙЗА'/g, replace: "'ГУРЗ'" },
  { search: /'Найза'/g, replace: "'Гурз'" },
  
  { search: /"РАЪД"/g, replace: '"ЖОЛА"' },
  { search: /"Раъд"/g, replace: '"Жола"' },
  { search: /'РАЪД'/g, replace: "'ЖОЛА'" },
  { search: /'Раъд'/g, replace: "'Жола'" },
  { search: /'رعد'/g, replace: "'ژاله'" },
  
  { search: /"БАРҚ"/g, replace: '"МЕҒ"' },
  { search: /"Барқ"/g, replace: '"Меғ"' },
  { search: /'БАРҚ'/g, replace: "'МЕҒ'" },
  { search: /'Барқ'/g, replace: "'Меғ'" },
  { search: /'برق'/g, replace: "'میغ'" }
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
