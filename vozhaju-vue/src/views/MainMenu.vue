<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { useI18n } from 'vue-i18n';
import { Settings, Info, Swords, ScrollText, Trophy, Coins, Globe } from 'lucide-vue-next';
import { getUserRank } from '../utils/ranks';
import DailyRewardModal from '../components/DailyRewardModal.vue';

const router = useRouter();
const store = useGameStore();
const { locale } = useI18n();

const isOnline = ref(navigator.onLine);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (isOnline.value) {
    store.syncProgress();
  }
};

onMounted(() => {
  store.fetchProfile().then(() => {
    // Only check daily reward after profile is fetched so it syncs properly
    store.checkDailyReward();
  });
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});

const navigate = (name, query = {}) => {
  router.push({ name, query });
};

const toggleLanguage = () => {
  locale.value = locale.value === 'tg' ? 'fa' : 'tg';
  localStorage.setItem('vozhajuLocale', locale.value);
};

const userRank = computed(() => getRankForScore(store.score));
</script>

<template>
  <div class="flex flex-col h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-200 via-orange-100 to-amber-200 relative overflow-hidden" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'#b45309\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
    
    <!-- Offline Indicator -->
    <div v-if="!isOnline" class="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-20 animate-pulse">
      Офлайн - Интернет нест
    </div>

    <!-- Transparent Custom TopBar for Main Menu -->
    <div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
      <div class="flex items-center gap-3">
        <button 
          @click="toggleLanguage" 
          class="flex items-center bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm text-amber-950 font-bold hover:bg-white/90 transition text-sm cursor-pointer border border-amber-300/50"
        >
          <Globe class="w-5 h-5 mr-1" />
          {{ locale === 'tg' ? 'Тоҷикӣ' : 'فارسی' }}
        </button>
      </div>

      <div class="flex gap-2">
        <div class="flex items-center bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-amber-300/50" title="Рутбаи шумо">
          <span class="mr-2 text-lg">{{ userRank.icon }}</span>
          <span class="font-black text-amber-950 text-md mr-2">{{ userRank.title }}</span>
          <div class="w-px h-4 bg-amber-950/20 mx-1"></div>
          <span class="font-black text-amber-950 text-md ml-1">{{ store.score }}</span>
        </div>
        <div class="flex items-center bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-amber-300/50">
          <Coins class="w-5 h-5 text-yellow-500 mr-2 drop-shadow-sm" />
          <span class="font-black text-amber-950 text-md">{{ store.coins }}</span>
        </div>
      </div>
    </div>
    
    <div class="flex-1 flex flex-col items-center justify-center p-6 space-y-10 z-10 pt-20">
      
      <!-- Hero Section -->
      <div class="text-center space-y-3 mb-6">
        <h1 class="text-5xl md:text-6xl font-black text-amber-950 drop-shadow-xl tracking-tight leading-none">
          <span class="text-6xl md:text-7xl">🏰</span><br>{{ $t('game_title') }}
        </h1>
        <p class="text-amber-800 font-bold italic text-lg md:text-xl px-4 opacity-80">{{ $t('game_subtitle') }}</p>
        <p class="text-amber-900/70 text-xs md:text-sm px-6 max-w-xs mx-auto font-medium leading-tight">
          {{ $t('game_mission') }}
        </p>
      </div>

      <div class="w-full max-w-sm space-y-4">
        <button 
          @click="navigate('LevelMenu', { type: 'story' })"
          class="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl shadow-lg transform active:scale-95 transition-all font-bold text-xl flex items-center justify-center gap-2">
          <Swords class="w-6 h-6" /> {{ $t('menu_story') }}
        </button>

        <div class="flex gap-4">
          <button 
            @click="navigate('LevelMenu', { type: 'challenge' })" 
            class="flex-1 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Swords class="w-5 h-5" /> {{ $t('menu_challenge') }}
          </button>

          <button 
            @click="navigate('LeaderboardScreen')" 
            class="flex-1 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Trophy class="w-5 h-5" /> {{ $t('menu_leaderboard') || 'Пешсафон' }}
          </button>
        </div>

        <button 
          @click="navigate('DictionaryScreen')"
          class="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
          <ScrollText class="w-5 h-5" /> {{ $t('dictionary') }}
        </button>

        <div class="flex gap-4 pt-2">
          <button 
            @click="navigate('AboutScreen')"
            class="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Info class="w-5 h-5" /> {{ $t('menu_about') }}
          </button>
          
          <button 
            @click="navigate('SettingsScreen')"
            class="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Settings class="w-5 h-5" /> {{ $t('settings') }}
          </button>
        </div>
      </div>
      
    </div>
    
    <!-- Daily Reward Modal -->
    <DailyRewardModal 
      :show="store.showDailyReward"
      :streak="store.dailyRewardData?.streak"
      :coinsReward="store.dailyRewardData?.coinsReward"
      :hintsReward="store.dailyRewardData?.hintsReward"
      @claim="store.claimDailyReward"
    />
  </div>
</template>
