<script setup>
import { computed } from 'vue';
import { Gift, Coins, Lightbulb } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  show: Boolean,
  streak: {
    type: Number,
    default: 1
  },
  coinsReward: {
    type: Number,
    default: 10
  },
  hintsReward: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['claim']);
const { locale } = useI18n();

const getDayText = () => {
  return locale.value === 'tg' ? `Рӯзи ${props.streak}` : `روز ${props.streak}`;
};
</script>

<template>
  <transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div class="bg-orange-50 border-4 border-amber-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_40px_rgba(245,158,11,0.5)] transform transition-transform relative overflow-hidden">
        
        <!-- Background rays animation -->
        <div class="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
           <div class="w-64 h-64 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div class="relative z-10">
          <div class="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg animate-bounce">
            <Gift class="w-10 h-10 text-white" />
          </div>
          
          <h2 class="text-3xl font-black text-amber-900 mb-1">{{ locale === 'tg' ? 'Ҷоизаи Ҳаррӯза!' : 'جایزه روزانه!' }}</h2>
          <p class="text-amber-700 font-bold mb-6 text-lg">{{ getDayText() }}</p>
          
          <div class="flex justify-center gap-4 mb-8">
            <div class="flex flex-col items-center bg-white p-3 rounded-2xl border-2 border-yellow-400 shadow-inner min-w-[80px]">
              <Coins class="w-8 h-8 text-yellow-500 mb-1 drop-shadow-sm" />
              <span class="text-2xl font-black text-yellow-600">+{{ coinsReward }}</span>
            </div>
            
            <div v-if="hintsReward > 0" class="flex flex-col items-center bg-white p-3 rounded-2xl border-2 border-green-400 shadow-inner min-w-[80px]">
              <Lightbulb class="w-8 h-8 text-green-500 mb-1 drop-shadow-sm" />
              <span class="text-2xl font-black text-green-600">+{{ hintsReward }}</span>
            </div>
          </div>
          
          <button 
            @click="emit('claim')"
            class="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white rounded-2xl font-black text-xl border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all shadow-lg">
            {{ locale === 'tg' ? 'Гирифтан!' : 'دریافت!' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active > div {
  animation: modal-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes modal-pop {
  0% { transform: scale(0.7) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
</style>
