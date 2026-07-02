const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfPath = path.join(__dirname, '../Shokhnoma_Ch_1.pdf');
const addPersianPath = path.join(__dirname, 'add_persian.js');
const outPath = path.join(__dirname, 'new_shahnameh_words.json');

async function extractWords() {
    console.log('Reading PDF...');
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    console.log('Extracting words...');
    // Match Tajik Cyrillic letters
    const regex = /[А-Яа-яЁёҶҷҒғҚқӮӯҲҳ]+/g;
    const allWords = text.match(regex) || [];

    console.log(`Found ${allWords.length} total words.`);

    // Read existing words
    let existingWords = new Set();
    if (fs.existsSync(addPersianPath)) {
        const content = fs.readFileSync(addPersianPath, 'utf8');
        // Match keys like 'КАЛИМА'
        const keyRegex = /'([А-ЯЁҶҒҚӮҲ]+)'\s*:/g;
        let match;
        while ((match = keyRegex.exec(content)) !== null) {
            existingWords.add(match[1].toUpperCase());
        }
    }

    const stopWords = new Set([
        'ВА', 'АЗ', 'БА', 'ДАР', 'КИ', 'ЧУ', 'ЧИ', 'ИН', 'ОН', 'ТО', 'БО', 
        'БАР', 'Ё', 'АГАР', 'ЧУН', 'КИ', 'КАЙ', 'КУҶО', 'ХУД', 'МАН', 'ТУ', 
        'Ӯ', 'МО', 'ШУМО', 'ОНҲО', 'АСТ', 'БУД', 'ШУД', 'НА', 'НЕ', 'ҲАМ', 
        'НИЗ', 'ЗИ', 'БЕ', 'БАРОИ', 'СУИ', 'ҲАР', 'ЯК', 'ДУ', 'СЕ', 'ЧОР'
    ]);

    const uniqueNewWords = new Set();

    for (let w of allWords) {
        let upperW = w.toUpperCase();
        if (upperW.length < 3) continue;
        if (stopWords.has(upperW)) continue;
        if (existingWords.has(upperW)) continue;
        uniqueNewWords.add(upperW);
    }

    const newWordsArr = Array.from(uniqueNewWords).sort();
    
    console.log(`Filtered down to ${newWordsArr.length} unique new words.`);

    const outputObj = {};
    newWordsArr.forEach(w => {
        outputObj[w] = { meaning: "", persian: "" };
    });

    fs.writeFileSync(outPath, JSON.stringify(outputObj, null, 2), 'utf8');
    console.log(`Saved new words to ${outPath}`);
}

extractWords().catch(console.error);
