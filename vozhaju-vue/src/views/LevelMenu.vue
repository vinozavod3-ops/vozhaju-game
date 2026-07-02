<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { ChevronLeft, Lock } from 'lucide-vue-next';

import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const store = useGameStore();
const { t, locale } = useI18n();

const activeTab = computed(() => route.query.type || 'story');

const goBack = () => router.push({ name: 'MainMenu' });

const completedCount = computed(() => {
  const arr = locale.value === 'fa' ? store.completedStoryLevelsFa : store.completedStoryLevels;
  return arr ? arr.length : 0;
});

const isCompleted = (levelId) => {
  const arr = (locale.value === 'fa' ? store.completedStoryLevelsFa : store.completedStoryLevels) || [];
  return arr.some(l => l.levelId === levelId || l === levelId);
};

const isUnlocked = (index, levelsArray) => {
  if (index === 0) return true; // first level always unlocked
  if (activeTab.value === 'challenge' && completedCount.value < 10) return false;
  
  // A level is unlocked if the PREVIOUS level in the same array is completed
  const prevLevelId = levelsArray[index - 1].id;
  return isCompleted(prevLevelId);
};

const startLevel = (level, index) => {
  if (!isUnlocked(index, levels.value)) return;
  router.push({ name: 'GameScreen', state: { levelId: level.id, type: activeTab.value } });
};

const levels = computed(() => store.levelsData.filter(l => l.type === activeTab.value));

onMounted(() => {
  if (store.levelsData.length === 0 && store.token) {
    store.fetchLevels();
  }
});
</script>

<template>
  <div class="flex flex-col h-screen p-4 max-w-md mx-auto w-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 pt-2">
      <button @click="goBack" class="p-2 bg-amber-200 rounded-full text-amber-900 active:scale-90 transition-transform">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <h2 class="text-2xl font-black text-amber-950">
        {{ activeTab === 'story' ? `📖 ${$t('menu_story').split(' ')[0]}` : `⚔️ ${$t('menu_challenge').split(' ')[0]} ${$t('menu_challenge').split(' ')[1]}` }}
      </h2>
      <div class="w-10"></div> <!-- Spacer -->
    </div>

    <div v-if="activeTab === 'challenge' && completedCount < 10" class="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-bold text-sm shadow-inner border border-red-200">
      🔒 {{ $t('locked_challenge') }}
    </div>

    <!-- Story Levels Grid -->
    <div v-if="activeTab === 'story'" class="grid grid-cols-5 gap-3 overflow-y-auto pb-6 px-1">
      <button 
        v-for="(level, index) in levels" :key="level.id"
        @click="startLevel(level, index)"
        :class="['aspect-square flex items-center justify-center rounded-2xl font-black text-xl border-b-4 transition-all touch-manipulation', 
          isCompleted(level.id)
            ? 'bg-green-500 border-green-700 text-white shadow-md active:border-b-0 active:translate-y-1' 
            : isUnlocked(index, levels)
              ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 shadow-sm active:border-b-0 active:translate-y-1'
              : 'bg-stone-300 border-stone-400 text-stone-500 opacity-60 cursor-not-allowed border-b-2'
        ]">
        <span v-if="isCompleted(level.id)">✓</span>
        <span v-else-if="!isUnlocked(index, levels)"><Lock class="w-5 h-5"/></span>
        <span v-else>{{ index + 1 }}</span>
      </button>
    </div>

    <!-- Challenge Levels List -->
    <div v-else class="flex flex-col gap-3 overflow-y-auto pb-6 px-1">
      <button 
        v-for="(level, index) in levels" :key="level.id"
        @click="startLevel(level, index)"
        :class="['w-full flex items-center p-4 rounded-2xl border-b-4 transition-all text-left touch-manipulation', 
          isCompleted(level.id) 
            ? 'bg-green-500 border-green-700 text-white shadow-md active:border-b-0 active:translate-y-1' 
            : isUnlocked(index, levels)
              ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 shadow-sm active:border-b-0 active:translate-y-1'
              : 'bg-stone-300 border-stone-400 text-stone-500 opacity-60 cursor-not-allowed border-b-2'
        ]">
        <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 mr-4 font-black">
          <span v-if="isCompleted(level.id)">✓</span>
          <span v-else-if="!isUnlocked(index, levels)"><Lock class="w-5 h-5"/></span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="flex-1 font-bold text-lg leading-tight">{{ locale === 'fa' ? $t('level', { num: index + 1 }) : level.name }}</div>
      </button>
    </div>
    
    <!-- Game Completion Message -->
    <div v-if="completedCount === levels.length && levels.length > 0" class="mt-4 bg-yellow-100 border-2 border-yellow-400 p-4 rounded-2xl text-center shadow-lg animate-pulse">
      <div class="text-3xl mb-2">🏆</div>
      <h3 class="text-lg font-black text-yellow-800">Офарин! Табрик!</h3>
      <p class="text-yellow-700 font-bold text-sm">Шумо ҳамаи марҳилаҳоро гузаштед!</p>
    </div>
    
  </div>
</template>
