import { createRouter, createWebHistory } from 'vue-router';
import MainMenu from '../views/MainMenu.vue';
import LevelMenu from '../views/LevelMenu.vue';
import GameScreen from '../views/GameScreen.vue';
import DictionaryScreen from '../views/DictionaryScreen.vue';
import AuthScreen from '../views/AuthScreen.vue';
import SettingsScreen from '../views/SettingsScreen.vue';
import AboutScreen from '../views/AboutScreen.vue';
import LeaderboardScreen from '../views/LeaderboardScreen.vue';

const routes = [
  { path: '/', name: 'MainMenu', component: MainMenu },
  { path: '/auth', name: 'AuthScreen', component: AuthScreen },
  { path: '/levels', name: 'LevelMenu', component: LevelMenu },
  { path: '/game', name: 'GameScreen', component: GameScreen },
  { path: '/dictionary', name: 'DictionaryScreen', component: DictionaryScreen },
  { path: '/settings', name: 'SettingsScreen', component: SettingsScreen },
  { path: '/leaderboard', name: 'LeaderboardScreen', component: LeaderboardScreen },
  { path: '/about', name: 'AboutScreen', component: AboutScreen }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach((to, from) => {
  const token = localStorage.getItem('vozhajuToken');
  if (to.name !== 'AuthScreen' && !token) {
    return { name: 'AuthScreen' };
  } else if (to.name === 'AuthScreen' && token) {
    return { name: 'MainMenu' };
  }
  return true;
});

export default router;
