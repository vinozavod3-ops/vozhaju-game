import re
import json
import os
import fitz  # PyMuPDF

pdf_path = '../Shokhnoma_Ch_1.pdf'
out_path = 'new_shahnameh_words.json'
dict_path = 'add_persian.js'

print("Reading existing words...")
existing_words = set()
if os.path.exists(dict_path):
    with open(dict_path, 'r', encoding='utf-8') as f:
        content = f.read()
        matches = re.findall(r"'([А-ЯЁҶҒҚӮҲ]+)'\s*:", content, re.IGNORECASE)
        for m in matches:
            existing_words.add(m.upper())

print(f"Loaded {len(existing_words)} existing words.")

print("Reading PDF...")
doc = fitz.open(pdf_path)
text = ""
for page in doc:
    text += page.get_text()
doc.close()

print("Extracting words...")
# Skip the academic introduction which contains modern Arabic/Russian loanwords
start_idx = text.find('ОЃОЗИ КИТОБ')
if start_idx != -1:
    text = text[start_idx:]
    print("Skipped introduction.")

# Match Tajik Cyrillic letters
words = re.findall(r'[А-Яа-яЁёҶҷҒғҚқӮӯҲҳ]+', text)
print(f"Found {len(words)} total words in PDF.")

stop_words = {
    'ВА', 'АЗ', 'БА', 'ДАР', 'КИ', 'ЧУ', 'ЧИ', 'ИН', 'ОН', 'ТО', 'БО', 
    'БАР', 'Ё', 'АГАР', 'ЧУН', 'КАЙ', 'КУҶО', 'ХУД', 'МАН', 'ТУ', 
    'Ӯ', 'МО', 'ШУМО', 'ОНҲО', 'АСТ', 'БУД', 'ШУД', 'НА', 'НЕ', 'ҲАМ', 
    'НИЗ', 'ЗИ', 'БЕ', 'БАРОИ', 'СУИ', 'ҲАР', 'ЯК', 'ДУ', 'СЕ', 'ЧОР',
    'КИ', 'МАР', 'ЗИН', 'КИН', 'ЭЙ', 'ҚӮШУН', 'БЕК', 'ХОН', 'АМИР', 'ВАЗИР',
    'ҚАЗО', 'ҚАДАР', 'АКНУН', 'АММО', 'ЛЕКИН', 'ВАЛЕ', 'БИНОБАР', 'Ё', 'ВУҶУД'
}

unique_new_words = set()

for w in words:
    w_upper = w.upper()
    if len(w_upper) < 3:
        continue
    if w_upper in stop_words:
        continue
    if w_upper in existing_words:
        continue
        
    # Heuristics to exclude Arabic words
    if 'Ъ' in w_upper: # Almost exclusively Arabic
        continue
    if w_upper.endswith('ОТ') or w_upper.endswith('ИЯТ'): # Arabic plurals/nouns
        continue
        
    unique_new_words.add(w_upper)

new_words_list = sorted(list(unique_new_words))

print(f"Filtered down to {len(new_words_list)} unique new words.")

output_obj = {}
for w in new_words_list:
    output_obj[w] = { "meaning": "", "persian": "" }

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output_obj, f, ensure_ascii=False, indent=2)

print(f"Saved new words to {out_path}")
