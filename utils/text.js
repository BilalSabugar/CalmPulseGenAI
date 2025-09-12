// utils/text.js
export const truncate = (value, max = 16, ellipsis = '…') => {
  const s = String(value ?? '');
  if (s.length <= max) return s;
  // handles emojis/surrogates a bit better than plain slice
  const units = Array.from(s); 
  return units.slice(0, Math.max(0, max - 1)).join('').trimEnd() + ellipsis;
};
