export const getRankForScore = (score) => {
  if (score >= 2000) return { title: 'Сипаҳсолор', icon: '👑', id: 6 };
  if (score >= 1001) return { title: 'Сарлашкар', icon: '🚩', id: 5 };
  if (score >= 601) return { title: 'Паҳлавон', icon: '🦸‍♂️', id: 4 };
  if (score >= 301) return { title: 'Сипаҳдор', icon: '🐎', id: 3 };
  if (score >= 101) return { title: 'Ҷанговар', icon: '⚔️', id: 2 };
  return { title: 'Сарбоз', icon: '🛡', id: 1 };
};
