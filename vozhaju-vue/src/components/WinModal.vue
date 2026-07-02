<script setup>
import { ref, watch } from 'vue';
import { Star } from 'lucide-vue-next';
import { getRandomQuote } from '../utils/quotes';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const props = defineProps({
  show: Boolean,
  title: String,
  message: String,
  stars: {
    type: Number,
    default: 0
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  scoreEarned: {
    type: Number,
    default: 0
  },
  buttonText: {
    type: String,
    default: 'Давом додан ➜'
  }
});

const emit = defineEmits(['close']);

const currentQuote = ref(null);

watch(() => props.show, (newVal) => {
  if (newVal) {
    currentQuote.value = getRandomQuote();
  }
});
</script>

<template>
  <transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-orange-50 border-4 border-amber-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-transform overflow-hidden relative">
        <!-- Optional background pattern inside modal -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'#b45309\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
        
        <h2 class="text-3xl font-black text-amber-900 mb-2 relative z-10">{{ title }}</h2>
        
        <!-- Stars Display -->
        <div v-if="stars > 0" class="flex justify-center gap-2 mb-4 relative z-10">
          <Star v-for="i in 3" :key="i" 
            :class="[
              'w-10 h-10 transition-all duration-500', 
              i <= stars ? 'text-yellow-500 fill-yellow-400 drop-shadow-md scale-110' : 'text-stone-300 fill-stone-200'
            ]" 
          />
        </div>

        <p class="text-lg text-amber-800 font-bold mb-4 relative z-10">{{ message }}</p>

        <!-- Rewards Display -->
        <div v-if="coinsEarned > 0 || scoreEarned > 0" class="flex justify-center gap-4 mb-6 bg-amber-100 p-3 rounded-2xl border-2 border-amber-300 relative z-10">
          <div v-if="scoreEarned > 0" class="flex flex-col items-center">
            <span class="text-xs text-amber-700 uppercase font-bold tracking-wider">Хол</span>
            <span class="text-2xl font-black text-amber-600">+{{ scoreEarned }}</span>
          </div>
          <div v-if="coinsEarned > 0" class="flex flex-col items-center">
            <span class="text-xs text-yellow-600 uppercase font-bold tracking-wider">Танга</span>
            <span class="text-2xl font-black text-yellow-500">+{{ coinsEarned }}</span>
          </div>
        </div>

        <!-- Quote -->
        <div v-if="currentQuote" class="mb-6 bg-amber-900/10 p-4 rounded-xl relative z-10">
          <div class="text-xl text-amber-950 font-bold leading-relaxed italic opacity-90 whitespace-pre-wrap">
            "{{ locale === 'tg' ? currentQuote.tg : currentQuote.fa }}"
          </div>
          <div class="text-xs text-amber-700 font-bold mt-2">— Абулқосим Фирдавсӣ, Шоҳнома</div>
        </div>

        <button 
          @click="emit('close')"
          class="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all relative z-10">
          {{ buttonText }}
        </button>
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
  animation: modal-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes modal-pop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
