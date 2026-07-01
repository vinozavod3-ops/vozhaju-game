<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { ChevronLeft, BookOpen } from 'lucide-vue-next';

const router = useRouter();
const store = useGameStore();

const goBack = () => router.push({ name: 'MainMenu' });

const hasWords = computed(() => Object.keys(store.dictionary).length > 0);
</script>

<template>
  <div class="flex flex-col h-screen p-4 max-w-md mx-auto w-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 pt-2">
      <button @click="goBack" class="p-2 bg-amber-200 rounded-full text-amber-900 active:scale-90 transition-transform">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <h2 class="text-2xl font-black text-amber-950 flex items-center gap-2">
        <BookOpen class="w-6 h-6" /> {{ $t('dictionary') }}
      </h2>
      <div class="w-10"></div> <!-- Spacer -->
    </div>

    <!-- Content -->
    <div v-if="!hasWords" class="flex-1 flex flex-col items-center justify-center text-amber-700 opacity-60">
      <div class="text-6xl mb-4">📜</div>
      <p class="font-bold text-center px-8">{{ $t('dictionary_empty') }}</p>
    </div>
    
    <div v-else class="flex-1 overflow-y-auto space-y-3 pb-6 pr-2 custom-scrollbar">
      <div 
        v-for="(meaning, word) in store.dictionary" 
        :key="word"
        class="bg-white border border-amber-200 p-4 rounded-2xl shadow-sm flex flex-col">
        <span class="text-xl font-black text-amber-900">{{ word }}</span>
        <span class="text-amber-700 mt-1 font-medium">{{ meaning }}</span>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(253, 230, 138, 0.5); /* amber-200 */
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(217, 119, 6, 0.5); /* amber-600 */
  border-radius: 10px;
}
</style>
