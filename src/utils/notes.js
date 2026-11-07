// Nota hesaplama yardımcı fonksiyonları

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Gitarda tel notaları (en kalından en inceye)
export const STRING_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];

// Bir notadan belirli bir interval kadar ileri gitme
export function getNoteByInterval(rootNote, semitones) {
  const rootIndex = NOTES.indexOf(rootNote);
  if (rootIndex === -1) return null;
  const newIndex = (rootIndex + semitones) % 12;
  return NOTES[newIndex];
}

// Bir tel ve perde kombinasyonundan nota hesaplama
export function getNoteAtPosition(stringNote, fret) {
  const stringIndex = NOTES.indexOf(stringNote);
  if (stringIndex === -1) return null;
  const noteIndex = (stringIndex + fret) % 12;
  return NOTES[noteIndex];
}

// Standart akortta açık tellerin MIDI numaraları (en kalından en inceye: E2 A2 D3 G3 B3 E4)
export const STRING_MIDI = [40, 45, 50, 55, 59, 64];

// 88 tuşlu piyano aralığı: A0 (21) - C8 (108)
export const PIANO_LOWEST_MIDI = 21;
export const PIANO_HIGHEST_MIDI = 108;

// Tel (0 = en kalın E) ve perdeden MIDI numarası
export function getMidiAtPosition(stringIndex, fret) {
  return STRING_MIDI[stringIndex] + fret;
}

// MIDI numarasından nota adı + oktav (örn. 40 -> "E2")
export function midiToNoteName(midi) {
  return `${NOTES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

// İki nota arasındaki yarım ton farkını hesaplama
export function getSemitoneDifference(note1, note2) {
  const index1 = NOTES.indexOf(note1);
  const index2 = NOTES.indexOf(note2);
  if (index1 === -1 || index2 === -1) return null;
  return (index2 - index1 + 12) % 12;
}

