<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { generateGridFromWords } from '../utils/engine';
import { AudioController } from '../utils/audio';
import { playConfetti } from '../utils/confettiService';
import { useTimer } from '../utils/useTimer';
import WinModal from '../components/WinModal.vue';
import { ChevronLeft, Zap, Search, HelpCircle, Gift, Timer } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const store = useGameStore();
const { t, locale } = useI18n();

const levelData = ref(null);
const grid = ref([]);
const gridSize = ref(0);
const allWords = ref([]);
const foundWords = ref([]);
const foundCells = ref([]);
const hintedCells = ref([]);
const selectedIndices = ref([]);
const currentWordPreview = ref('...');
const isGameActive = ref(true);
const isShakeAnimation = ref(false);
const allWordsPaths = ref({});
const cellColors = ref({});
const wordColorsMap = ref({});

const WORD_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 
  'bg-teal-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 
  'bg-violet-500', 'bg-orange-500', 'bg-fuchsia-500', 'bg-cyan-600'
];

const { timeSeconds, startTimer, stopTimer, formattedTime } = useTimer();

const showWinModal = ref(false);
const winMessage = ref('');
const winStars = ref(0);
const winCoins = ref(0);
const winScore = ref(0);
const toastMessage = ref(null);

const gridStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${gridSize.value}, 1fr)`
  };
});

onMounted(() => {
  const state = history.state;
  if (!state || !state.levelId) {
    router.push({ name: 'LevelMenu' });
    return;
  }
  
  const levelsSource = store.levelsData.filter(l => l.type === state.type);
  levelData.value = levelsSource.find(l => l.id === state.levelId);
  
  if (!levelData.value) {
    router.push({ name: 'LevelMenu' });
    return;
  }
  
  if (Object.keys(store.wordsData).length === 0) {
    const unwatch = watch(() => store.wordsData, (newVal) => {
      if (Object.keys(newVal).length > 0) {
        startGame();
        AudioController.startBarbatBGM();
        unwatch();
      }
    }, { deep: true });
  } else {
    startGame();
    AudioController.startBarbatBGM();
  }
});

const startGame = () => {
  let wordsToUse = levelData.value.words;
  if (locale.value === 'fa') {
      wordsToUse = levelData.value.words.map(w => store.wordsData[w]?.persian || w);
  }
  
  let allDictWords = Object.values(store.wordsData).map(v => locale.value === 'fa' ? v.persian : v.cyrillic);
  allDictWords = [...new Set(allDictWords)];

  const result = generateGridFromWords(wordsToUse, levelData.value.id, allDictWords);
  if (!result || result.grid.length === 0) {
    alert(t('error_gen'));
    router.push({ name: 'LevelMenu' });
    return;
  }
  
  grid.value = result.grid;
  gridSize.value = result.size;
  allWords.value = result.words;
  allWordsPaths.value = result.paths || {};
  foundWords.value = [];
  foundCells.value = [];
  hintedCells.value = [];
  selectedIndices.value = [];
  cellColors.value = {};
  wordColorsMap.value = {};
  isGameActive.value = true;
  startTimer();
};

onBeforeUnmount(() => {
  stopTimer();
  AudioController.stopBarbatBGM();
});

// Pointer Events for Swiping
const isDragging = ref(false);

const getCellIndexFromEvent = (e) => {
  const touch = e.touches ? e.touches[0] : e;
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.classList.contains('letter-cell')) {
    return parseInt(target.dataset.index, 10);
  }
  return -1;
};

const handlePointerDown = (index) => {
  if (!isGameActive.value) return;
  if (foundCells.value.includes(index)) return;
  isDragging.value = true;
  selectedIndices.value = [index];
  AudioController.playSelect();
  updatePreview();
};

const handlePointerMove = (e) => {
  if (!isDragging.value || !isGameActive.value) return;
  e.preventDefault(); 
  
  const index = getCellIndexFromEvent(e);
  if (index !== -1) {
    const lastIdx = selectedIndices.value[selectedIndices.value.length - 1];
    if (index === lastIdx) return;
    
    // Check if going back to previous (undo)
    if (selectedIndices.value.length > 1 && index === selectedIndices.value[selectedIndices.value.length - 2]) {
        selectedIndices.value.pop();
        AudioController.playSelect();
        updatePreview();
        return;
    }
    
    // Must be adjacent
    const r1 = Math.floor(lastIdx / gridSize.value), c1 = lastIdx % gridSize.value;
    const r2 = Math.floor(index / gridSize.value), c2 = index % gridSize.value;
    
    const dr = Math.abs(r2 - r1);
    const dc = Math.abs(c2 - c1);
    
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        if (!selectedIndices.value.includes(index) && !foundCells.value.includes(index)) {
            selectedIndices.value.push(index);
            AudioController.playSelect();
            updatePreview();
        }
    }
  }
};

const handlePointerUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  checkSelectedWord();
};

const updatePreview = () => {
  currentWordPreview.value = selectedIndices.value.map(i => grid.value[i]).join('');
};

const checkSelectedWord = () => {
  let matchedWord = null;
  const currentPathString = JSON.stringify(selectedIndices.value);
  const currentPathReversed = JSON.stringify([...selectedIndices.value].reverse());

  for (let word of allWords.value) {
    if (foundWords.value.includes(word)) continue;
    const wordPath = JSON.stringify(allWordsPaths.value[word]);
    if (wordPath === currentPathString || wordPath === currentPathReversed) {
      matchedWord = word;
      break;
    }
  }
  
  if (matchedWord) {
    const colorClass = WORD_COLORS[foundWords.value.length % WORD_COLORS.length];
    wordColorsMap.value[matchedWord] = colorClass;
    foundWords.value.push(matchedWord);
    
    AudioController.playFound();
    
    const meaningObj = store.wordsData[matchedWord];
    const meaning = meaningObj ? meaningObj.meaning : (t('dictionary_empty') ? t('dictionary_empty') : "Вожаи неки порсӣ");
    store.addToDictionary(matchedWord, meaning);
    showToast(`📜 ${matchedWord}`, meaning);
    
    selectedIndices.value.forEach(idx => {
      if (!foundCells.value.includes(idx)) {
        foundCells.value.push(idx);
        cellColors.value[idx] = colorClass;
      }
    });
    
    if (foundWords.value.length === allWords.value.length) {
      isGameActive.value = false;
      stopTimer();
      AudioController.playWin();
      playConfetti();
      
      let stars = 1;
      if (timeSeconds.value <= 30) stars = 3;
      else if (timeSeconds.value <= 60) stars = 2;
      
      store.completeLevel(levelData.value.id, stars, timeSeconds.value, locale.value === 'fa');
      
      let reward = 10; // 1 star default
      if (stars === 3) reward = 30;
      else if (stars === 2) reward = 20;

      store.addCoins(reward);
      const levelDisplayName = locale.value === 'fa' ? t('level', { num: levelData.value.id }) : levelData.value.name;
      winMessage.value = t('win_message', { name: levelDisplayName });
      winStars.value = stars;
      winCoins.value = reward;
      winScore.value = stars * 10;
      setTimeout(() => showWinModal.value = true, 500);
    }
  } else if (selectedIndices.value.length > 1) {
    AudioController.playError();
    isShakeAnimation.value = true;
    setTimeout(() => isShakeAnimation.value = false, 400);
  }
  
  selectedIndices.value = [];
  currentWordPreview.value = '...';
};

// Hints
const getUnfoundWords = () => allWords.value.filter(w => !foundWords.value.includes(w));

const useLetterHint = () => {
  const unfound = getUnfoundWords();
  if (unfound.length === 0) return showToast(t('hint_title_letter'), t('hint_all_found'));
  
  if (store.coins < 10 && store.freeHints === 0) return showToast(t('hint_title_letter'), t('hint_no_money'));
  
  const word = unfound[Math.floor(Math.random() * unfound.length)];
  const path = allWordsPaths.value[word];
  
  let possibleIndices = path.filter(idx => !hintedCells.value.includes(idx) && !foundCells.value.includes(idx));
  
  if (possibleIndices.length > 0) {
    const idx = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
    hintedCells.value.push(idx);
    
    if (store.freeHints > 0) store.useFreeHint();
    else store.useCoins(10);
    showToast(t('hint_title_letter'), t('hint_letter_msg'));
  }
};

const useWordHint = () => {
  const unfound = getUnfoundWords();
  if (unfound.length === 0) return showToast(t('hint_title_word'), t('hint_all_found'));

  if (store.coins < 30 && store.freeHints === 0) return showToast(t('hint_title_word'), t('hint_no_money'));
  
  const word = unfound[Math.floor(Math.random() * unfound.length)];
  
  if (store.freeHints > 0) store.useFreeHint();
  else store.useCoins(30);
  
  showToast(t('hint_title_word'), t('hint_word_msg', { word }));
};

// Toast
let toastTimeout;
const showToast = (title, message) => {
  toastMessage.value = { title, message };
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastMessage.value = null, 3000);
};

const goBack = () => router.push({ name: 'LevelMenu' });
const exitWinModal = () => {
  showWinModal.value = false;
  goBack();
};
</script>

<template>
  <div class="flex flex-col min-h-screen bg-orange-50 relative" @mouseup="handlePointerUp" @touchend="handlePointerUp">
    
    <!-- Top Bar -->
    <div class="flex items-center justify-between p-4 bg-amber-950 text-amber-100 shadow-md z-10">
      <button @click="goBack" class="p-2 bg-amber-800 rounded-full hover:bg-amber-700 active:scale-90 transition">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <div class="flex flex-col items-center">
        <div class="font-bold text-lg leading-tight">{{ locale === 'fa' && levelData ? $t('level', { num: levelData.id }) : (levelData?.name || $t('level', { num: '' })) }}</div>
        <div class="text-xs text-amber-300 font-mono flex items-center gap-1">
          <Timer class="w-3 h-3" /> {{ formattedTime() }}
        </div>
      </div>
      <div class="flex items-center bg-amber-800 rounded-full px-3 py-1 font-bold">
        <Zap class="w-4 h-4 text-yellow-400 mr-1" />
        <span>{{ foundWords.length }}/{{ allWords.length }}</span>
      </div>
    </div>

    <!-- Game Area -->
    <div class="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto">
      
      <!-- Word List (Remaining Words) -->
      <div class="flex flex-wrap justify-center gap-2 mb-6 w-full max-w-sm">
        <div 
          v-for="word in allWords" 
          :key="word" 
          class="px-2 py-1 rounded text-sm font-bold shadow-sm border transition-colors"
          :class="foundWords.includes(word) ? `${wordColorsMap[word]} text-white border-transparent` : 'bg-white text-amber-400 border-amber-200'"
        >
          {{ foundWords.includes(word) ? word : word.replace(/./g, '_ ') }}
        </div>
      </div>

      <!-- Word Preview -->
      <div class="mb-4 flex flex-col items-center">
        <span class="text-amber-800 font-bold mb-1"><Search class="w-4 h-4 inline" /> {{ $t('word_search') }}</span>
        <div class="text-3xl font-black text-amber-950 min-h-[40px] tracking-widest">{{ currentWordPreview }}</div>
      </div>

      <!-- Grid -->
      <div 
        class="grid gap-1 bg-amber-900 p-2 rounded-2xl shadow-xl w-full max-w-[360px] touch-none transition-transform"
        :class="{ 'animate-shake': isShakeAnimation }"
        :style="gridStyle"
        @mousemove="handlePointerMove"
        @touchmove="handlePointerMove">
        
        <div 
          v-for="(letter, index) in grid" 
          :key="index"
          :data-index="index"
          @mousedown="handlePointerDown(index)"
          @touchstart.prevent="handlePointerDown(index)"
          :class="[
            'letter-cell aspect-square flex items-center justify-center font-black text-2xl rounded-xl transition-colors select-none',
            letter === '' ? 'opacity-0 pointer-events-none' : 'cursor-pointer',
            letter !== '' && foundCells.includes(index) ? `${cellColors[index]} text-white shadow-inner scale-95 opacity-90` : 
            letter !== '' && selectedIndices.includes(index) ? 'bg-orange-400 text-amber-950 scale-105 shadow-md' : 
            letter !== '' && hintedCells.includes(index) ? 'bg-yellow-300 text-amber-900 ring-2 ring-yellow-500 animate-pulse shadow-lg' :
            letter !== '' ? 'bg-amber-100 text-amber-950 shadow-[0_4px_0_0_rgba(180,83,9,1)] active:shadow-none active:translate-y-1' : ''
          ]">
          {{ letter }}
        </div>
      </div>
      
    </div>

    <!-- Bottom Hints Panel -->
    <div class="bg-amber-200 p-4 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] pb-8">
      <div class="flex justify-between items-center mb-4">
        <div class="font-bold text-amber-900 flex items-center gap-1">
          🪙 <span class="text-xl">{{ store.coins }}</span>
        </div>
        <div v-if="store.freeHints > 0" class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
          <Gift class="w-3 h-3 inline mr-1" />{{ store.freeHints }} {{ $t('free') }}
        </div>
      </div>
      <div class="flex gap-4">
        <button @click="useLetterHint" class="flex-1 bg-white border-2 border-amber-300 py-3 rounded-xl font-bold text-amber-800 active:scale-95 transition-transform flex flex-col items-center">
          <span class="text-lg">🔤 {{ $t('hint_letter') }}</span>
          <span class="text-xs text-amber-600">10 🪙</span>
        </button>
        <button @click="useWordHint" class="flex-1 bg-white border-2 border-amber-300 py-3 rounded-xl font-bold text-amber-800 active:scale-95 transition-transform flex flex-col items-center">
          <span class="text-lg">📖 {{ $t('hint_word') }}</span>
          <span class="text-xs text-amber-600">30 🪙</span>
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div v-if="toastMessage" class="absolute top-20 left-1/2 transform -translate-x-1/2 bg-amber-900 text-white px-6 py-3 rounded-2xl shadow-xl z-50 text-center min-w-[250px]">
        <div class="font-bold text-lg text-yellow-400">{{ toastMessage.title }}</div>
        <div class="text-sm opacity-90">{{ toastMessage.message }}</div>
      </div>
    </transition>

    <WinModal 
      :show="showWinModal" 
      :title="t('win_title')" 
      :message="winMessage"
      :stars="winStars"
      :coinsEarned="winCoins"
      :scoreEarned="winScore"
      :buttonText="t('continue')"
      @close="exitWinModal" 
    />
  </div>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px) rotate(-1deg); }
  40%, 80% { transform: translateX(5px) rotate(1deg); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
