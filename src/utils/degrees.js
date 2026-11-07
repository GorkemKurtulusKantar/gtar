// Derece etiketinden (1, ♭3, ♯4, 9, 𝄫7...) renk indeksi 1-7: 9 -> 2, 11 -> 4, 13 -> 6
export function degreeColorIndex(label) {
  if (label == null) return null;
  const n = parseInt(String(label).replace(/[^0-9]/g, ''), 10);
  if (Number.isNaN(n)) return null;
  return ((n - 1) % 7) + 1;
}
