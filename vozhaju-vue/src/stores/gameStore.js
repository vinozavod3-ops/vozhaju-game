import { defineStore } from 'pinia';
import api from '../services/api';
import { toast } from 'vue3-toastify';
import i18n from '../i18n';

const t = i18n.global.t;

export const useGameStore = defineStore('game', {
  state: () => ({
    isLoading: false,
    user: null,
    token: localStorage.getItem('vozhajuToken') || null,
    coins: 0,
    freeHints: 3,
    completedStoryLevels: [],
    completedStoryLevelsFa: [],
    dictionary: {},
    soundEnabled: true,
    levelsData: [], // Stores all fetched levels
    wordsData: {} // Global dictionary from DB
  }),
  getters: {
    score(state) {
      const calcStars = (arr) => (arr || []).reduce((acc, curr) => acc + ((typeof curr === 'object' ? curr.stars : 1) || 1), 0);
      return (calcStars(state.completedStoryLevels) + calcStars(state.completedStoryLevelsFa)) * 10;
    }
  },
  actions: {
    async fetchWords() {
      try {
        const res = await api.get('/game/words');
        const map = {};
        res.data.forEach(w => { 
            const entry = { meaning: w.meaning, persian: w.persian || w.word, cyrillic: w.word };
            map[w.word] = entry; 
            map[entry.persian] = entry;
        });
        this.wordsData = map;
        localStorage.setItem('vozhajuWordsData', JSON.stringify(map));
      } catch (e) {
        console.error('Failed to fetch words, trying offline cache', e);
        const cached = localStorage.getItem('vozhajuWordsData');
        if (cached) this.wordsData = JSON.parse(cached);
      }
    },
    async register(username, password) {
      this.isLoading = true;
      try {
        const res = await api.post('/auth/register', { username, password });
        this.setAuthData(res.data);
        await this.fetchLevels();
        await this.fetchWords();
        toast.success(t('success_register'));
      } catch (err) {
        toast.error(err.response?.data?.message || t('error_default'));
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    async login(username, password) {
      this.isLoading = true;
      try {
        const res = await api.post('/auth/login', { username, password });
        this.setAuthData(res.data);
        await this.fetchLevels();
        await this.fetchWords();
        toast.success(t('success_login'));
      } catch (err) {
        toast.error(err.response?.data?.message || t('error_default'));
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('vozhajuToken');
    },
    setAuthData(data) {
      this.token = data.token;
      this.user = data.user;
      this.coins = data.user.coins || 150;
      this.freeHints = data.user.freeHints || 3;
      this.completedStoryLevels = data.user.completedStoryLevels || [];
      this.completedStoryLevelsFa = data.user.completedStoryLevelsFa || [];
      this.dictionary = data.user.dictionary || {};
      localStorage.setItem('vozhajuToken', data.token);
      this.persistLocalProfile();
    },
    persistLocalProfile() {
      const profile = {
        coins: this.coins,
        freeHints: this.freeHints,
        completedStoryLevels: this.completedStoryLevels,
        completedStoryLevelsFa: this.completedStoryLevelsFa,
        dictionary: this.dictionary
      };
      localStorage.setItem('vozhajuOfflineProfile', JSON.stringify(profile));
    },
    loadLocalProfile() {
      const cached = localStorage.getItem('vozhajuOfflineProfile');
      if (cached) {
        const data = JSON.parse(cached);
        this.coins = data.coins || 0;
        this.freeHints = data.freeHints || 0;
        this.completedStoryLevels = data.completedStoryLevels || [];
        this.completedStoryLevelsFa = data.completedStoryLevelsFa || [];
        this.dictionary = data.dictionary || {};
      }
    },
    async fetchProfile() {
      if (!this.token) return;
      try {
        const res = await api.get('/auth/profile');
        
        let localData = null;
        try {
          const cached = localStorage.getItem('vozhajuOfflineProfile');
          if (cached) localData = JSON.parse(cached);
        } catch (e) {}

        const serverFa = res.data.completedStoryLevelsFa || [];
        const serverTg = res.data.completedStoryLevels || [];
        
        const localFa = localData ? (localData.completedStoryLevelsFa || []) : [];
        const localTg = localData ? (localData.completedStoryLevels || []) : [];

        // Merge keeping the array with more levels
        this.completedStoryLevelsFa = localFa.length > serverFa.length ? localFa : serverFa;
        this.completedStoryLevels = localTg.length > serverTg.length ? localTg : serverTg;
        
        this.user = res.data;
        // Keep the max of coins (simple merge strategy)
        this.coins = Math.max(res.data.coins || 0, localData ? localData.coins || 0 : 0);
        this.freeHints = Math.max(res.data.freeHints || 0, localData ? localData.freeHints || 0 : 0);
        
        // Merge dictionary
        this.dictionary = res.data.dictionary || {};
        if (localData && localData.dictionary) {
          this.dictionary = { ...this.dictionary, ...localData.dictionary };
        }

        this.persistLocalProfile();
        
        // If local had more data, sync to server
        if (localFa.length > serverFa.length || localTg.length > serverTg.length) {
          this.syncProgress();
        }
      } catch (e) {
        console.warn('Network error fetching profile, using offline mode');
        this.loadLocalProfile();
      }
    },
    async fetchLevels() {
      try {
        const res = await api.get('/game/levels');
        this.levelsData = res.data;
        localStorage.setItem('vozhajuLevelsData', JSON.stringify(res.data));
      } catch (e) {
        console.error('Failed to fetch levels, trying offline cache', e);
        const cached = localStorage.getItem('vozhajuLevelsData');
        if (cached) this.levelsData = JSON.parse(cached);
      }
    },
    async syncProgress() {
      this.persistLocalProfile();
      if (!this.token || !navigator.onLine) return; // Don't try if clearly offline
      try {
        await api.post('/game/sync', {
          coins: this.coins,
          freeHints: this.freeHints,
          completedStoryLevels: this.completedStoryLevels,
          completedStoryLevelsFa: this.completedStoryLevelsFa,
          dictionary: this.dictionary
        });
      } catch (e) {
        console.error('Failed to sync progress, will sync later', e);
      }
    },
    
    // Game logic
    addCoins(amount) {
      this.coins += amount;
      this.syncProgress();
    },
    useCoins(amount) {
      if (this.coins >= amount) {
        this.coins -= amount;
        this.syncProgress();
        return true;
      }
      return false;
    },
    useFreeHint() {
      if (this.freeHints > 0) {
        this.freeHints--;
        this.syncProgress();
        return true;
      }
      return false;
    },
    completeLevel(levelId, stars = 1, timeSeconds = 0, isFa = false) {
      const targetArray = isFa ? this.completedStoryLevelsFa : this.completedStoryLevels;
      const existing = targetArray.find(l => l.levelId === levelId || l === levelId);
      if (!existing) {
        targetArray.push({ levelId, stars, timeSeconds });
        this.syncProgress();
      } else if (typeof existing === 'object' && stars > existing.stars) {
        existing.stars = stars;
        existing.timeSeconds = timeSeconds;
        this.syncProgress();
      }
    },
    addToDictionary(word, meaning) {
      if (!this.dictionary[word]) {
        this.dictionary[word] = meaning;
        this.syncProgress();
      }
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('vozhajuSound', this.soundEnabled);
    },
    loadLocalSettings() {
      const sound = localStorage.getItem('vozhajuSound');
      if (sound !== null) this.soundEnabled = sound === 'true';
    }
  }
});
