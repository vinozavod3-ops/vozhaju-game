<script setup>
import { onMounted, ref, watch } from 'vue';
import { useGameStore } from './stores/gameStore';
import { initMusic, playMusic, pauseMusic } from './utils/soundService';

const store = useGameStore();

watch(() => store.soundEnabled, (newVal) => {
  if (newVal) playMusic();
  else pauseMusic();
});

const startMusic = () => {
  if (store.soundEnabled) {
    playMusic();
  }
  document.removeEventListener('click', startMusic);
};

onMounted(async () => {
  initMusic();
  store.loadLocalSettings();
  document.addEventListener('click', startMusic);
  if (store.token) {
    await store.fetchProfile();
    await store.fetchLevels();
    await store.fetchWords();
  }
});
</script>

<template>
  <div class="min-h-screen bg-orange-50 font-sans text-amber-950 relative flex flex-col">
    <!-- Router View with Transition -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* Global Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
