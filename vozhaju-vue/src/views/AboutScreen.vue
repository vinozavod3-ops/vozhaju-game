<script setup>
import { useRouter } from 'vue-router';
import { BookOpen, ArrowRight } from 'lucide-vue-next';

const router = useRouter();

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
      <h1 class="w-full text-center text-3xl font-black text-amber-950">Дар бораи мо</h1>
    </div>

    <!-- Content -->
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border-4 border-amber-900 overflow-hidden flex flex-col items-center text-center p-8 space-y-6 text-amber-950">
      
      <div class="p-6 bg-orange-100 rounded-full shadow-inner mb-2">
        <BookOpen class="w-16 h-16 text-amber-700" />
      </div>
      
      <h3 class="text-3xl font-black text-amber-900 drop-shadow-sm">Вожаҷӯи Шоҳнома</h3>
      <div class="text-sm font-mono text-amber-700 bg-amber-100 px-3 py-1 rounded-full shadow-sm">Версия: 1.0.0</div>

      <p class="text-base font-medium leading-relaxed bg-orange-50 p-5 rounded-2xl border border-orange-200 shadow-sm text-justify">
        Ин бозӣ бо мақсади эҳё ва омӯзиши калимаҳои нодири забони порсӣ, ки дар 
        «Шоҳнома»-и Ҳаким Абулқосим Фирдавсӣ омадаанд, сохта шудааст. 
        Ҳадафи мо шиносонидани насли наврас бо мероси бойи гузаштагон мебошад.
      </p>
      
      <div class="w-full h-px bg-amber-200 my-4"></div>

      <div class="text-base font-bold bg-stone-50 w-full p-4 rounded-2xl border border-stone-200">
        <div class="mb-2">Созанда: <span class="text-amber-700">Масрур</span></div>
        <div>Технология: <span class="text-amber-700">Vue.js 3, Tailwind CSS</span></div>
      </div>

    </div>
  </div>
</template>
