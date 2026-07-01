<script setup>
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { useI18n } from 'vue-i18n';
import { Volume2, VolumeX, Globe, Gauge, ArrowRight } from 'lucide-vue-next';

const router = useRouter();
const store = useGameStore();
const { t, locale } = useI18n();

const toggleLang = () => {
  locale.value = locale.value === 'tg' ? 'fa' : 'tg';
  localStorage.setItem('vozhajuLocale', locale.value);
};

const goBack = () => {
  router.push({ name: 'MainMenu' });
};
</script>

<template>
  <div class="min-h-screen bg-orange-50 flex flex-col items-center py-8 px-4">
    
    <!-- Header -->
    <div class="w-full max-w-md flex items-center mb-8 relative">
      <button 
        @click="goBack" 
        class="absolute left-0 p-3 bg-white text-amber-900 rounded-full shadow-md active:scale-95 transition-transform"
      >
        <ArrowRight class="w-6 h-6 rotate-180" />
      </button>
      <h1 class="w-full text-center text-3xl font-black text-amber-950">{{ t('settings') }}</h1>
    </div>

    <!-- Content -->
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border-4 border-amber-900 overflow-hidden p-6 space-y-8">
      
      <!-- Language -->
      <div class="space-y-3">
        <div class="flex items-center gap-3 text-amber-950 font-bold text-lg">
          <Globe class="w-6 h-6 text-amber-700" /> {{ $t('settings_lang') }}
        </div>
        <div class="p-4 bg-amber-50 rounded-2xl flex items-center justify-between border border-amber-200">
          <span class="font-medium text-amber-900">{{ $t('settings_lang_ui') }}</span>
          <button 
            @click="toggleLang"
            class="px-6 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm active:scale-95 transition">
            {{ locale === 'tg' ? 'Тоҷикӣ' : 'فارسی' }}
          </button>
        </div>
      </div>

      <!-- Sound -->
      <div class="space-y-3">
        <div class="flex items-center gap-3 text-amber-950 font-bold text-lg">
          <component :is="store.soundEnabled ? Volume2 : VolumeX" class="w-6 h-6 text-amber-700" /> 
          {{ $t('settings_sound') }}
        </div>
        <div class="p-4 bg-amber-50 rounded-2xl flex items-center justify-between border border-amber-200">
          <span class="font-medium text-amber-900">{{ $t('settings_music') }}</span>
          <button 
            @click="store.toggleSound()"
            class="px-6 py-2 rounded-xl font-bold shadow-sm active:scale-95 transition"
            :class="store.soundEnabled ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'">
            {{ store.soundEnabled ? $t('settings_on') : $t('settings_off') }}
          </button>
        </div>
      </div>



    </div>
  </div>
</template>
