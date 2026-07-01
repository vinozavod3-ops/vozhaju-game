<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import api from '../services/api';
import { ChevronLeft, Trophy, Medal } from 'lucide-vue-next';

const router = useRouter();
const store = useGameStore();
const leaderboard = ref([]);
const isLoading = ref(true);

const goBack = () => router.push({ name: 'MainMenu' });

onMounted(async () => {
  try {
    const res = await api.get('/game/leaderboard');
    leaderboard.value = res.data;
  } catch (error) {
    console.error('Failed to load leaderboard', error);
  } finally {
    isLoading.value = false;
  }
});

const getMedalColor = (index) => {
  if (index === 0) return 'text-yellow-400'; // Gold
  if (index === 1) return 'text-gray-400'; // Silver
  if (index === 2) return 'text-amber-600'; // Bronze
  return 'text-stone-400';
};
</script>

<template>
  <div class="flex flex-col h-screen p-4 max-w-md mx-auto w-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 pt-2">
      <button @click="goBack" class="p-2 bg-amber-200 rounded-full text-amber-900 active:scale-90 transition-transform">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <h2 class="text-2xl font-black text-amber-950 flex items-center gap-2">
        <Trophy class="w-6 h-6 text-yellow-500" />
        {{ $t('menu_leaderboard') || 'Пешсафон' }}
      </h2>
      <div class="w-10"></div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
    </div>

    <!-- Leaderboard List -->
    <div v-else class="flex-1 bg-white/50 backdrop-blur-sm rounded-3xl p-4 shadow-sm border border-amber-200 overflow-y-auto">
      <div class="space-y-3">
        <div 
          v-for="(user, index) in leaderboard" 
          :key="user._id"
          :class="[
            'flex items-center justify-between p-3 rounded-2xl border-2 transition-all',
            store.user?.username === user.username 
              ? 'bg-amber-100 border-amber-400 shadow-md' 
              : 'bg-white border-stone-100 shadow-sm'
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 flex justify-center font-black text-lg">
              <Medal v-if="index < 3" :class="['w-7 h-7', getMedalColor(index)]" />
              <span v-else class="text-stone-400">{{ index + 1 }}</span>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-stone-800 text-lg">{{ user.username }}</span>
              <span v-if="store.user?.username === user.username" class="text-xs text-amber-600 font-bold">Ин шумо ҳастед</span>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <span class="font-black text-amber-600 text-xl">{{ user.score }}</span>
            <span class="text-xs text-stone-500 uppercase tracking-widest font-bold">Хол</span>
          </div>
        </div>
        
        <div v-if="leaderboard.length === 0" class="text-center py-10 text-stone-500 font-bold">
          Ҳоло ҳеҷ кас дар рӯйхат нест.
        </div>
      </div>
    </div>
  </div>
</template>
