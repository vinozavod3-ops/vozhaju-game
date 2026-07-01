import { ref } from 'vue';

export function useTimer() {
  const timeSeconds = ref(0);
  let interval = null;

  const startTimer = () => {
    if (interval) clearInterval(interval);
    timeSeconds.value = 0;
    interval = setInterval(() => {
      timeSeconds.value++;
    }, 1000);
  };

  const stopTimer = () => {
    if (interval) clearInterval(interval);
  };

  const formattedTime = () => {
    const m = Math.floor(timeSeconds.value / 60).toString().padStart(2, '0');
    const s = (timeSeconds.value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return { timeSeconds, startTimer, stopTimer, formattedTime };
}
