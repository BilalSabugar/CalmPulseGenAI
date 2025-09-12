// utils/getGreeting.js
export function getGreeting(date = new Date()) {
  const h = date.getHours(); // device local time
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
}
