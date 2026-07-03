import json
import os

filepath = 'c:/Users/Сабир/OneDrive/Документы/VozhajuGame/backend/new_shahnameh_words.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

words = list(data.keys())

# Suffixes to check
suffixes = ['РО', 'ШОН', 'ТОН', 'МОН', 'АШ', 'АМ', 'АТ', 'Ш', 'М', 'Т', 'И', 'У', 'ВУ', 'ҲО', 'ОН', 'ЁН', 'ВОН', 'Е', 'ЯМ', 'АНД', 'ЯНД', 'ЕМ']

word_set = set(words)
to_remove = set()

def get_base_word(w):
    for suf in suffixes:
        if w.endswith(suf):
            base = w[:-len(suf)]
            if len(base) >= 2 and base in word_set:
                return get_base_word(base)
    return w

for w in words:
    base = get_base_word(w)
    if base != w:
        to_remove.add(w)

print(f"Original word count: {len(data)}")
print(f"Words to remove (duplicates with suffixes): {len(to_remove)}")

cleaned_data = {}
for w in words:
    if w not in to_remove:
        cleaned_data[w] = data[w]

print(f"Cleaned word count: {len(cleaned_data)}")

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

print("Done cleaning!")
