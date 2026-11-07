import { NOTES, STRING_NOTES, getNoteByInterval, getNoteAtPosition } from './notes.js';

// Major scale interval pattern (degree -> semitones from root)
// Degree: 1=0, 2=2, 3=4, 4=5, 5=7, 6=9, 7=11
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

// Degree to semitone mapping (1-indexed)
export const DEGREE_TO_SEMITONE = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11
};

// ============================================================
// MINOR MODE - Relative Major Relationship
// ============================================================
// Minor key uses the same patterns as its relative major
// A minor = C major patterns (same notes, different root)
// Major degree → Minor degree mapping:
//   Major 1 → Minor ♭3
//   Major 2 → Minor 4
//   Major 3 → Minor 5
//   Major 4 → Minor ♭6
//   Major 5 → Minor ♭7
//   Major 6 → Minor 1  (this is the minor root!)
//   Major 7 → Minor 2
// ============================================================

// Get relative major from minor root (minor + 3 semitones = relative major)
export function getRelativeMajor(minorRoot) {
  return getNoteByInterval(minorRoot, 3);
}

// Get relative minor from major root (major - 3 semitones = relative minor)
export function getRelativeMinor(majorRoot) {
  return getNoteByInterval(majorRoot, 9); // 9 semitones up = 3 semitones down
}

// Major degree to Minor degree mapping
// The 6th degree of major scale becomes the 1 (root) of relative minor
export const MAJOR_TO_MINOR_DEGREE = {
  1: { deg: 3, flat: true },   // Major 1 → Minor ♭3
  2: { deg: 4, flat: false },  // Major 2 → Minor 4
  3: { deg: 5, flat: false },  // Major 3 → Minor 5
  4: { deg: 6, flat: true },   // Major 4 → Minor ♭6
  5: { deg: 7, flat: true },   // Major 5 → Minor ♭7
  6: { deg: 1, flat: false },  // Major 6 → Minor 1 (ROOT)
  7: { deg: 2, flat: false },  // Major 7 → Minor 2
};

// Convert major degree to minor degree info
export function majorDegreeToMinor(majorDeg) {
  return MAJOR_TO_MINOR_DEGREE[majorDeg] || { deg: majorDeg, flat: false };
}

// Format degree for display (adds flat symbol if needed)
export function formatDegree(degreeInfo) {
  if (typeof degreeInfo === 'number') {
    return String(degreeInfo);
  }
  const { deg, flat } = degreeInfo;
  return flat ? `♭${deg}` : String(deg);
}

// Minor degree labels for display
export const MINOR_DEGREE_LABELS = {
  1: '1',
  2: '2',
  3: '♭3',
  4: '4',
  5: '5',
  6: '♭6',
  7: '♭7',
};

// Skala interval pattern'leri
export const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11], // 1-2-3-4-5-6-7
  minor: [0, 2, 3, 5, 7, 8, 10], // 1-2-b3-4-5-b6-b7
  pentatonicMajor: [0, 2, 4, 7, 9], // 1-2-3-5-6
  pentatonicMinor: [0, 3, 5, 7, 10], // 1-b3-4-5-b7

  // Doğu makamları - 12 ton eşit akorda (perdeli gitarda) çalınabilen yaklaşımlar.
  // Çeyrek ses içeren makamlar (Uşşak, Saba, Rast vb.) standart perdelerde tam çalınamaz.
  ajam: [0, 2, 4, 5, 7, 9, 11],      // Acem / Çargah - 12-TET'te Major ile aynı
  hijaz: [0, 1, 4, 5, 7, 8, 10],     // Hicaz (Phrygian Dominant)
  hijazkar: [0, 1, 4, 5, 7, 8, 11],  // Hicazkar (Double Harmonic / "Arabic")
  arabian: [0, 2, 4, 5, 6, 8, 10],   // Arabian (Major Locrian)
  kurdi: [0, 1, 3, 5, 7, 8, 10],     // Kürdi (Phrygian)
  nahawand: [0, 2, 3, 5, 7, 8, 11],  // Nihavend (Harmonic Minor)
  nikriz: [0, 2, 3, 6, 7, 9, 10],    // Nikriz
  neveser: [0, 2, 3, 6, 7, 8, 11],   // Neveser (Hungarian Minor)
};

// Derece etiketleri, Major skalaya göre (♭2, ♯4 vb.)
const SEMITONE_DEGREE_LABELS = {
  0: '1', 1: '♭2', 2: '2', 3: '♭3', 4: '3', 5: '4',
  6: '♯4', 7: '5', 8: '♭6', 9: '6', 10: '♭7', 11: '7',
};
const LABELED_SCALES = ['ajam', 'hijaz', 'hijazkar', 'arabian', 'kurdi', 'nahawand', 'nikriz', 'neveser'];

// Skala isimleri
export const SCALE_NAMES = {
  major: 'Major',
  minor: 'Minor',
  pentatonicMajor: 'Pentatonic Major',
  pentatonicMinor: 'Pentatonic Minor',
  ajam: 'Ajam / Çargah',
  hijaz: 'Hijaz',
  hijazkar: 'Hijazkar (Arabic)',
  arabian: 'Arabian',
  kurdi: 'Kurdi',
  nahawand: 'Nahawand',
  nikriz: 'Nikriz',
  neveser: 'Neveser',
  hexatonicMajor1: 'Pattern 1 (omit 4)',
  hexatonicMajor2: 'Pattern 2 (omit 5)',
  hexatonicMajor3: 'Pattern 3 (omit 6)',
  hexatonicMajor4: 'Pattern 4 (omit 7)',
  hexatonicMajor5: 'Pattern 5 (omit 2)',
};

// ============================================================
// HEXATONIC PATTERN DEFINITIONS
// ============================================================
// Root reference: A string (stringIndex 1) at rootFret
// Format: Each string has 3 notes: [{degree, fretOffset}, ...]
// fretOffset is relative to rootFret on A string
// String indices: 0=E(thick), 1=A, 2=D, 3=G, 4=B, 5=E(thin)
// ============================================================

export const HEXATONIC_PATTERNS = {
  // Pattern 1 (omit 4) – degree set {1,2,3,5,6,7}
  hexatonicMajor1: {
    name: 'Pattern 1',
    omittedDegree: 4,
    degreeSet: [1, 2, 3, 5, 6, 7],
    strings: {
      0: [{ deg: 5, offset: 0 }, { deg: 6, offset: 2 }, { deg: 7, offset: 4 }],  // S6 (E thick)
      1: [{ deg: 1, offset: 0 }, { deg: 2, offset: 2 }, { deg: 3, offset: 4 }],  // S5 (A) - ROOT STRING
      2: [{ deg: 5, offset: 2 }, { deg: 6, offset: 4 }, { deg: 7, offset: 6 }],  // S4 (D)
      3: [{ deg: 1, offset: 2 }, { deg: 2, offset: 4 }, { deg: 3, offset: 6 }],  // S3 (G)
      4: [{ deg: 5, offset: 5 }, { deg: 6, offset: 7 }, { deg: 7, offset: 9 }],  // S2 (B)
      5: [{ deg: 1, offset: 5 }, { deg: 2, offset: 7 }, { deg: 3, offset: 9 }],  // S1 (E thin)
    }
  },

  // Pattern 2 (omit 5) – degree set {1,2,3,4,6,7}
  hexatonicMajor2: {
    name: 'Pattern 2',
    omittedDegree: 5,
    degreeSet: [1, 2, 3, 4, 6, 7],
    strings: {
      0: [{ deg: 6, offset: 2 }, { deg: 7, offset: 4 }, { deg: 1, offset: 5 }],  // S6
      1: [{ deg: 2, offset: 2 }, { deg: 3, offset: 4 }, { deg: 4, offset: 5 }],  // S5 (A)
      2: [{ deg: 6, offset: 4 }, { deg: 7, offset: 6 }, { deg: 1, offset: 7 }],  // S4
      3: [{ deg: 2, offset: 4 }, { deg: 3, offset: 6 }, { deg: 4, offset: 7 }],  // S3
      4: [{ deg: 6, offset: 7 }, { deg: 7, offset: 9 }, { deg: 1, offset: 10 }], // S2
      5: [{ deg: 2, offset: 7 }, { deg: 3, offset: 9 }, { deg: 4, offset: 10 }], // S1
    }
  },

  // Pattern 3 (omit 6) – degree set {1,2,3,4,5,7}
  hexatonicMajor3: {
    name: 'Pattern 3',
    omittedDegree: 6,
    degreeSet: [1, 2, 3, 4, 5, 7],
    strings: {
      0: [{ deg: 7, offset: 4 }, { deg: 1, offset: 5 }, { deg: 2, offset: 7 }],  // S6
      1: [{ deg: 3, offset: 4 }, { deg: 4, offset: 5 }, { deg: 5, offset: 7 }],  // S5 (A)
      2: [{ deg: 7, offset: 6 }, { deg: 1, offset: 7 }, { deg: 2, offset: 9 }],  // S4
      3: [{ deg: 3, offset: 6 }, { deg: 4, offset: 7 }, { deg: 5, offset: 9 }],  // S3
      4: [{ deg: 7, offset: 9 }, { deg: 1, offset: 10 }, { deg: 2, offset: 12 }], // S2
      5: [{ deg: 3, offset: 9 }, { deg: 4, offset: 10 }, { deg: 5, offset: 12 }], // S1
    }
  },

  // Pattern 4 (omit 7) – degree set {1,2,3,4,5,6}
  hexatonicMajor4: {
    name: 'Pattern 4',
    omittedDegree: 7,
    degreeSet: [1, 2, 3, 4, 5, 6],
    strings: {
      0: [{ deg: 1, offset: 5 }, { deg: 2, offset: 7 }, { deg: 3, offset: 9 }],   // S6
      1: [{ deg: 4, offset: 5 }, { deg: 5, offset: 7 }, { deg: 6, offset: 9 }],   // S5 (A)
      2: [{ deg: 1, offset: 7 }, { deg: 2, offset: 9 }, { deg: 3, offset: 11 }],  // S4
      3: [{ deg: 4, offset: 7 }, { deg: 5, offset: 9 }, { deg: 6, offset: 11 }],  // S3
      4: [{ deg: 1, offset: 10 }, { deg: 2, offset: 12 }, { deg: 3, offset: 14 }], // S2
      5: [{ deg: 4, offset: 10 }, { deg: 5, offset: 12 }, { deg: 6, offset: 14 }], // S1
    }
  },

  // Pattern 5 (omit 2, alternating) – degree set {1,3,4,5,6,7}
  hexatonicMajor5: {
    name: 'Pattern 5',
    omittedDegree: 2,
    degreeSet: [1, 3, 4, 5, 6, 7],
    strings: {
      0: [{ deg: 3, offset: 9 }, { deg: 4, offset: 10 }, { deg: 5, offset: 12 }],  // S6
      1: [{ deg: 6, offset: 9 }, { deg: 7, offset: 11 }, { deg: 1, offset: 12 }],  // S5 (A)
      2: [{ deg: 3, offset: 11 }, { deg: 4, offset: 12 }, { deg: 5, offset: 14 }], // S4
      3: [{ deg: 6, offset: 11 }, { deg: 7, offset: 13 }, { deg: 1, offset: 14 }], // S3
      4: [{ deg: 3, offset: 14 }, { deg: 4, offset: 15 }, { deg: 5, offset: 17 }], // S2
      5: [{ deg: 6, offset: 14 }, { deg: 7, offset: 16 }, { deg: 1, offset: 17 }], // S1
    }
  },
};

// Calculate rootFret on A string for a given key
// A string open = A (index 9 in NOTES)
export function getRootFretOnAString(rootNote) {
  const aIndex = NOTES.indexOf('A');
  const rootIndex = NOTES.indexOf(rootNote);
  // How many semitones from A to root?
  const fret = (rootIndex - aIndex + 12) % 12;
  return fret;
}

// Kök notadan skala notalarını hesaplama
export function getScaleNotes(rootNote, scaleType) {
  const pattern = SCALE_PATTERNS[scaleType];
  if (!pattern) return [];
  
  return pattern.map(semitones => getNoteByInterval(rootNote, semitones));
}

// Get all hexatonic pattern positions for a given key
// Returns array of { stringIndex, fret, degree } for the pattern
export function getHexatonicPatternPositions(rootNote, patternId, numFrets = 24) {
  const pattern = HEXATONIC_PATTERNS[patternId];
  if (!pattern) return [];
  
  const rootFret = getRootFretOnAString(rootNote);
  const positions = [];
  
  // For each string in the pattern
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const stringNotes = pattern.strings[stringIndex];
    if (!stringNotes) continue;
    
    for (const noteData of stringNotes) {
      const actualFret = rootFret + noteData.offset;
      
      // Handle octave wrapping - show positions that fit on fretboard
      // Also show lower octave if it fits
      const frets = [actualFret, actualFret - 12, actualFret + 12];
      
      for (const fret of frets) {
        if (fret >= 0 && fret <= numFrets) {
          positions.push({
            stringIndex,
            fret,
            degree: noteData.deg
          });
        }
      }
    }
  }
  
  return positions;
}

// Fretboard üzerinde skala pozisyonlarını hesaplama
export function getScalePositions(rootNote, scaleType, numFrets = 15) {
  const scaleNotes = getScaleNotes(rootNote, scaleType);
  const positions = [];
  
  STRING_NOTES.forEach((stringNote, stringIndex) => {
    for (let fret = 0; fret <= numFrets; fret++) {
      const note = getNoteAtPosition(stringNote, fret);
      if (scaleNotes.includes(note)) {
        const isRoot = note === rootNote;
        positions.push({
          string: stringIndex,
          fret,
          note,
          isRoot,
        });
      }
    }
  });
  
  return positions;
}

// Belirli bir pozisyonun skala içinde olup olmadığını kontrol etme
// isMinorMode: true ise minor key için relative major pattern'leri kullan
export function isScaleNote(stringIndex, fret, rootNote, scaleType, isMinorMode = false) {
  // Hexatonic pattern'ler için özel pozisyon kontrolü
  if (scaleType.startsWith('hexatonicMajor')) {
    const pattern = HEXATONIC_PATTERNS[scaleType];
    if (!pattern) return false;
    
    // Minor mode'da relative major'ın rootFret'ini kullan
    // Çünkü pattern pozisyonları relative major üzerinden tanımlı
    const effectiveRoot = isMinorMode ? getRelativeMajor(rootNote) : rootNote;
    const rootFret = getRootFretOnAString(effectiveRoot);
    const stringNotes = pattern.strings[stringIndex];
    if (!stringNotes) return false;
    
    // Check if this fret matches any note in the pattern for this string
    for (const noteData of stringNotes) {
      const actualFret = rootFret + noteData.offset;
      
      // Check main position and octave variants
      if (fret === actualFret || fret === actualFret - 12 || fret === actualFret + 12) {
        return true;
      }
    }
    return false;
  }
  
  // Normal scale kontrolü
  const stringNote = STRING_NOTES[stringIndex];
  const note = getNoteAtPosition(stringNote, fret);
  const scaleNotes = getScaleNotes(rootNote, scaleType);
  
  return scaleNotes.includes(note);
}

// Belirli bir pozisyonun kök nota olup olmadığını kontrol etme
export function isRootNote(stringIndex, fret, rootNote) {
  const stringNote = STRING_NOTES[stringIndex];
  const note = getNoteAtPosition(stringNote, fret);
  return note === rootNote;
}

// Bir notanın skala içindeki derecesini hesaplama
// isMinorMode: true ise minor degree labels döndür (♭3, ♭6, ♭7)
// Returns: { value: number, label: string } for minor mode, or just number for major mode
export function getScaleDegree(note, rootNote, scaleType, stringIndex, fret, isMinorMode = false) {
  // Hexatonic pattern'ler için pattern'den degree al
  if (scaleType.startsWith('hexatonicMajor')) {
    const pattern = HEXATONIC_PATTERNS[scaleType];
    if (!pattern) return null;
    
    // Minor mode'da relative major'ın rootFret'ini kullan
    const effectiveRoot = isMinorMode ? getRelativeMajor(rootNote) : rootNote;
    const rootFret = getRootFretOnAString(effectiveRoot);
    const stringNotes = pattern.strings[stringIndex];
    if (!stringNotes) return null;
    
    // Find the matching note and return its degree
    for (const noteData of stringNotes) {
      const actualFret = rootFret + noteData.offset;
      
      // Check main position and octave variants
      if (fret === actualFret || fret === actualFret - 12 || fret === actualFret + 12) {
        const majorDeg = noteData.deg;
        
        // Minor mode'da major degree'yi minor degree'ye dönüştür
        if (isMinorMode) {
          const minorInfo = majorDegreeToMinor(majorDeg);
          return {
            value: minorInfo.deg,
            label: MINOR_DEGREE_LABELS[minorInfo.deg] || String(minorInfo.deg),
            isRoot: minorInfo.deg === 1
          };
        }
        
        return majorDeg;
      }
    }
    return null;
  }
  
  // Normal scale degree hesaplama
  let baseScaleType = scaleType;
  if (scaleType.startsWith('hexatonicMajor')) {
    baseScaleType = 'major';
  } else if (scaleType.startsWith('hexatonicMinor')) {
    baseScaleType = 'minor';
  }
  
  const baseScaleNotes = getScaleNotes(rootNote, baseScaleType);
  const noteIndex = baseScaleNotes.indexOf(note);

  if (noteIndex === -1) return null;

  // Doğu makamlarında ♭2, ♯4 gibi aralık etiketleri göster
  if (LABELED_SCALES.includes(baseScaleType)) {
    return SEMITONE_DEGREE_LABELS[SCALE_PATTERNS[baseScaleType][noteIndex]];
  }

  // Base scale'deki index + 1 (çünkü 1-based)
  return noteIndex + 1;
}

