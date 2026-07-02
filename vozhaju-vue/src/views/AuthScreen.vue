<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const store = useGameStore();

const isLogin = ref(true);
const username = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    errorMsg.value = t('error_empty');
    return;
  }
  
  if (username.value.length < 3) {
    errorMsg.value = t('error_user_short');
    return;
  }
  
  if (password.value.length < 6) {
    errorMsg.value = t('error_pass_short');
    return;
  }
  
  errorMsg.value = '';
  isLoading.value = true;
  
  try {
    if (isLogin.value) {
      await store.login(username.value, password.value);
    } else {
      await store.register(username.value, password.value);
    }
    router.push({ name: 'MainMenu' });
  } catch (err) {
    // Error is already shown by toast in store, no need to set errorMsg unless we want to
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col h-screen items-center justify-center p-6 bg-orange-50">
    <div class="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border-2 border-amber-200">
      
      <div class="text-center mb-8">
        <h1 class="text-4xl font-black text-amber-950 drop-shadow-sm mb-2">⚔️ {{ $t('app_name') }}</h1>
        <p class="text-amber-700 font-bold">{{ isLogin ? $t('login_subtitle') : $t('register_subtitle') }}</p>
      </div>

      <div class="flex bg-amber-100 rounded-xl p-1 mb-6">
        <button 
          @click="isLogin = true; errorMsg = ''" 
          :class="['flex-1 py-2 font-bold rounded-lg transition-colors', isLogin ? 'bg-white text-amber-900 shadow' : 'text-amber-700']">
          {{ $t('login') }}
        </button>
        <button 
          @click="isLogin = false; errorMsg = ''" 
          :class="['flex-1 py-2 font-bold rounded-lg transition-colors', !isLogin ? 'bg-white text-amber-900 shadow' : 'text-amber-700']">
          {{ $t('register') }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-amber-900 font-bold mb-1 ml-1">{{ $t('username') }}</label>
          <input 
            v-model="username" 
            type="text" 
            class="w-full bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-amber-950 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500" 
            :placeholder="$t('username_placeholder')"
          />
        </div>
        
        <div>
          <label class="block text-amber-900 font-bold mb-1 ml-1">{{ $t('password') }}</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-amber-950 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500" 
            :placeholder="$t('password_placeholder')"
          />
        </div>

        <div v-if="errorMsg" class="text-red-500 font-bold text-center text-sm bg-red-100 p-2 rounded-lg">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-4 mt-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl shadow-lg transform active:scale-95 transition-all font-black text-xl disabled:opacity-50">
          {{ isLoading ? $t('loading') : (isLogin ? $t('login') : $t('register')) }}
        </button>
      </form>
      
    </div>
  </div>
</template>
