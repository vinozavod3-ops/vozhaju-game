<script setup>
import { useGameStore } from '../stores/gameStore';
import { Coins, Globe } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const store = useGameStore();
const { locale } = useI18n();

const toggleLanguage = () => {
  locale.value = locale.value === 'tg' ? 'fa' : 'tg';
  localStorage.setItem('vozhajuLocale', locale.value);
};
</script>

<template>
  <div class="flex items-center justify-between p-4 bg-amber-100 shadow-sm border-b border-amber-200">
    <div class="font-bold text-xl text-amber-900 flex items-center gap-2">
      <span class="text-2xl">⚔️</span> {{ $t('app_name') }} <span class="text-sm text-amber-700">Шоҳнома</span>
    </div>
    
    <div class="flex items-center gap-3">
      <button 
        @click="toggleLanguage" 
        class="flex items-center bg-amber-50 rounded-full px-3 py-1 border border-amber-300 shadow-inner text-amber-900 font-bold hover:bg-amber-200 transition text-sm cursor-pointer"
      >
        <Globe class="w-4 h-4 mr-1" />
        {{ locale === 'tg' ? 'Тоҷикӣ' : 'فارسی' }}
      </button>

      <div class="flex items-center bg-amber-50 rounded-full px-4 py-1.5 border border-amber-300 shadow-inner">
        <Coins class="w-5 h-5 text-yellow-500 mr-2" />
        <span class="font-bold text-amber-900">{{ store.coins }}</span>
      </div>
    </div>
  </div>
</template>
