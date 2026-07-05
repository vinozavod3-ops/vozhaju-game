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
const bonusCells = ref([]);
const floatingBonus = ref(null);
const jumpIndices = ref([]);

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

const lastFoundTime = ref(0);
const comboCount = ref(0);
const maxCombo = ref(0);
const showComboAnimation = ref(false);
const comboMessage = ref('');

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
  bonusCells.value = [];
  jumpIndices.value = [];
  
  // Assign 1-2 random bonus cells from valid word paths
  const allPathIndices = Object.values(result.paths || {}).flat();
  if (allPathIndices.length > 0) {
    const uniqueIndices = [...new Set(allPathIndices)];
    const numBonus = Math.min(2, Math.max(1, Math.floor(uniqueIndices.length / 10)));
    for (let i = 0; i < numBonus; i++) {
      const bIdx = uniqueIndices[Math.floor(Math.random() * uniqueIndices.length)];
      if (!bonusCells.value.includes(bIdx)) bonusCells.value.push(bIdx);
    }
  }

  lastFoundTime.value = 0;
  comboCount.value = 0;
  maxCombo.value = 0;
  
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
    
    // Jump animation
    jumpIndices.value = [...selectedIndices.value];
    setTimeout(() => { jumpIndices.value = [] }, 500);

    // Bonus check
    const collectedBonus = selectedIndices.value.filter(idx => bonusCells.value.includes(idx));
    if (collectedBonus.length > 0) {
      const bonusAmount = collectedBonus.length * 5;
      store.addCoins(bonusAmount);
      floatingBonus.value = { msg: `+${bonusAmount} 🪙`, id: Date.now() };
      setTimeout(() => floatingBonus.value = null, 1500);
      bonusCells.value = bonusCells.value.filter(idx => !collectedBonus.includes(idx));
    }

    
    const now = Date.now();
    if (lastFoundTime.value > 0 && (now - lastFoundTime.value) < 6000) {
      comboCount.value++;
    } else {
      comboCount.value = 1;
    }
    lastFoundTime.value = now;
    if (comboCount.value > maxCombo.value) maxCombo.value = comboCount.value;

    if (comboCount.value >= 2) {
      comboMessage.value = `COMBO x${comboCount.value}! 🔥`;
      showComboAnimation.value = true;
      setTimeout(() => showComboAnimation.value = false, 1500);
      // Play a slightly higher pitched sound for combo
      AudioController.playSelect(); 
    }

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

      let scoreEarned = stars * 10;

      // Apply combo multiplier
      let multiplier = 1;
      if (maxCombo.value >= 6) multiplier = 2.5;
      else if (maxCombo.value >= 4) multiplier = 2;
      else if (maxCombo.value >= 2) multiplier = 1.5;

      reward = Math.floor(reward * multiplier);
      scoreEarned = Math.floor(scoreEarned * multiplier);

      store.addCoins(reward);
      const levelDisplayName = locale.value === 'fa' ? t('level', { num: levelData.value.id }) : levelData.value.name;
      winMessage.value = t('win_message', { name: levelDisplayName });
      winStars.value = stars;
      winCoins.value = reward;
      winScore.value = scoreEarned;
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

const getUnfoundWords = () => allWords.value.filter(w => !foundWords.value.includes(w));

const getOtherScript = (word) => {
  const entry = store.wordsData[word] || store.wordsData[Object.keys(store.wordsData).find(k => store.wordsData[k].persian === word)];
  if (!entry) return '';
  return locale.value === 'fa' ? entry.cyrillic : entry.persian;
};

const getOtherScriptPreview = (word) => {
  if (foundWords.value.includes(word) || allWords.value.includes(word)) {
    return getOtherScript(word);
  }
  return '';
};

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
  <div class="flex flex-col min-h-screen relative bg-slate-950 text-slate-200" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'#fbbf24\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');" @mouseup="handlePointerUp" @touchend="handlePointerUp">
    
    <!-- Top Bar -->
    <div class="flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-md text-slate-100 shadow-lg z-10 border-b border-white/10">
      <button @click="goBack" class="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 active:scale-90 transition">
        <ChevronLeft class="w-6 h-6 text-yellow-500" />
      </button>
      <div class="flex flex-col items-center">
        <div class="font-bold text-lg leading-tight font-epic tracking-wider text-yellow-500 drop-shadow-sm">{{ locale === 'fa' && levelData ? $t('level', { num: levelData.id }) : (levelData?.name || $t('level', { num: '' })) }}</div>
        <div class="text-xs text-slate-400 font-mono flex items-center gap-1">
          <Timer class="w-3 h-3" /> {{ formattedTime() }}
        </div>
      </div>
      <div class="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1 font-bold text-yellow-500 shadow-inner">
        <Zap class="w-4 h-4 text-yellow-400 mr-1" />
        <span>{{ foundWords.length }}/{{ allWords.length }}</span>
      </div>
    </div>

    <!-- Fallback if dictionary empty -->
    <div v-if="!isGameActive && grid.length === 0" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div class="text-5xl mb-4">🌐</div>
      <h3 class="text-xl font-bold text-yellow-500 mb-2">Луғат боргирӣ нашудааст!</h3>
      <p class="text-slate-400 mb-6 font-medium">Лутфан интернетро пайваст кунед ва бори дигар ворид шавед.</p>
      <button @click="goBack" class="bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-bold py-3 px-6 rounded-xl shadow-gold-glow">Бозгашт ба саҳифаи асосӣ</button>
    </div>

    <!-- Game Area -->
    <div v-else class="flex-1 flex flex-col items-center justify-start p-4 overflow-y-auto pt-6">
      
      <!-- Word List (Remaining Words) -->
      <div class="flex flex-wrap justify-center gap-2 mb-6 w-full max-w-sm">
        <div 
          v-for="word in allWords" 
          :key="word" 
          class="px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border transition-all duration-300"
          :class="foundWords.includes(word) ? `${wordColorsMap[word]} text-white border-transparent shadow-[0_0_10px_currentColor]` : 'bg-slate-800 text-slate-500 border-slate-700'"
        >
          {{ foundWords.includes(word) ? word : word.replace(/./g, '_ ') }}
        </div>
      </div>

      <!-- Word Preview & Combo Area -->
      <div class="mb-4 flex flex-col items-center relative">
        <transition name="combo-pop">
          <div v-if="showComboAnimation" class="absolute -top-8 text-2xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] z-20 whitespace-nowrap">
            {{ comboMessage }}
          </div>
        </transition>

        <span class="text-slate-400 font-bold mb-1 text-sm uppercase tracking-widest"><Search class="w-4 h-4 inline" /> {{ $t('word_search') }}</span>
        <div class="text-3xl font-black text-yellow-500 min-h-[40px] tracking-widest drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">{{ currentWordPreview }}</div>
        
        <transition name="floating-text">
          <div v-if="floatingBonus" :key="floatingBonus.id" class="absolute top-0 text-xl font-black text-yellow-500 drop-shadow-md z-30 pointer-events-none">
            {{ floatingBonus.msg }}
          </div>
        </transition>
      </div>

      <!-- Grid -->
      <div 
        class="grid gap-1 bg-slate-900/80 p-2.5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-700 w-full max-w-[360px] touch-none transition-transform backdrop-blur-md"
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
          :style="{ animationDelay: `${(index % gridSize + Math.floor(index / gridSize)) * 50}ms` }"
          :class="[
            'letter-cell aspect-square flex items-center justify-center font-black text-2xl rounded-xl transition-all duration-200 select-none relative animate-cell-enter',
            jumpIndices.includes(index) ? 'animate-bounce-win' : '',
            letter === '' ? 'opacity-0 pointer-events-none' : 'cursor-pointer hover:brightness-110',
            letter !== '' && foundCells.includes(index) ? `${cellColors[index]} text-white shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] scale-95 opacity-90` : 
            letter !== '' && selectedIndices.includes(index) ? 'bg-yellow-500 text-slate-900 scale-105 shadow-[0_0_15px_rgba(234,179,8,0.6)] border-b-0 translate-y-1' : 
            letter !== '' && hintedCells.includes(index) ? 'bg-yellow-400 text-slate-900 ring-2 ring-yellow-300 animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.6)]' :
            letter !== '' ? ((Math.floor(index / gridSize) + (index % gridSize)) % 2 === 0 ? 'bg-slate-800 text-slate-200 border-b-4 border-slate-950' : 'bg-slate-700 text-slate-200 border-b-4 border-slate-900') : ''
          ]">
          {{ letter }}
          <span v-if="bonusCells.includes(index)" class="absolute -top-2 -right-2 text-sm drop-shadow-[0_0_5px_rgba(251,191,36,0.8)] animate-pulse pointer-events-none">⭐</span>
        </div>
      </div>
      
    </div>

    <!-- Bottom Hints Panel -->
    <div class="bg-slate-900/80 backdrop-blur-lg p-4 rounded-t-3xl shadow-[0_-10px_25px_rgba(0,0,0,0.5)] border-t border-slate-700 pb-8 mt-4">
      <div class="flex justify-between items-center mb-4">
        <div class="font-black text-yellow-500 flex items-center gap-1 drop-shadow-sm">
          🪙 <span class="text-xl">{{ store.coins }}</span>
        </div>
        <div v-if="store.freeHints > 0" class="bg-green-600 border border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)] text-white text-xs font-bold px-3 py-1.5 rounded-full animate-bounce">
          <Gift class="w-3 h-3 inline mr-1" />{{ store.freeHints }} {{ $t('free') }}
        </div>
      </div>
      <div class="flex gap-4">
        <button @click="useLetterHint" class="flex-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 shadow-inner py-3 rounded-xl font-bold text-slate-200 active:scale-95 transition-all flex flex-col items-center">
          <span class="text-lg drop-shadow-md">🔤 {{ $t('hint_letter') }}</span>
          <span class="text-xs text-yellow-500 mt-1">10 🪙</span>
        </button>
        <button @click="useWordHint" class="flex-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 shadow-inner py-3 rounded-xl font-bold text-slate-200 active:scale-95 transition-all flex flex-col items-center">
          <span class="text-lg drop-shadow-md">📖 {{ $t('hint_word') }}</span>
          <span class="text-xs text-yellow-500 mt-1">30 🪙</span>
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div v-if="toastMessage" class="absolute top-20 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-yellow-500/30 text-white px-6 py-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-50 text-center min-w-[250px]">
        <div class="font-bold text-lg text-yellow-400 drop-shadow-sm">{{ toastMessage.title }}</div>
        <div class="text-sm text-slate-200 mt-1">{{ toastMessage.message }}</div>
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
.combo-pop-enter-active {
  animation: combo-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.combo-pop-leave-active {
  transition: all 0.3s ease;
}
.combo-pop-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}
@keyframes combo-bounce {
  0% { transform: scale(0.5) translateY(20px); opacity: 0; }
  50% { transform: scale(1.2) translateY(-10px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.animate-cell-enter {
  animation: cell-enter 0.4s backwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes cell-enter {
  0% { transform: scale(0.3) translateY(-30px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.animate-bounce-win {
  animation: bounce-win 0.5s ease-out;
}
@keyframes bounce-win {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.1); }
}

.floating-text-enter-active {
  animation: float-up 1.5s ease-out forwards;
}
@keyframes float-up {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
  100% { transform: translateY(-60px) scale(1); opacity: 0; }
}
</style>
