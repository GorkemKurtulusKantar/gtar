import { NOTES, getNoteByInterval, getNoteAtPosition } from './notes.js';
import { MAJOR_SCALE_INTERVALS } from './scales.js';

// ============================================================
// TRIAD DEFINITIONS
// ============================================================
// Interval sets for each triad quality (semitones from root)
// ============================================================

export const TRIAD_INTERVALS = {
  major: [0, 4, 7],      // 1 - 3 - 5
  minor: [0, 3, 7],      // 1 - b3 - 5
  diminished: [0, 3, 6], // 1 - b3 - b5
  augmented: [0, 4, 8],  // 1 - 3 - #5
};

// Triad interval labels (for display)
export const TRIAD_INTERVAL_LABELS = {
  major: ['1', '3', '5'],
  minor: ['1', '♭3', '5'],
  diminished: ['1', '♭3', '♭5'],
  augmented: ['1', '3', '♯5'],
};

// Triad quality names
export const TRIAD_NAMES = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
};

// Triad quality abbreviations
export const TRIAD_ABBREV = {
  major: '',      // C
  minor: 'm',     // Cm
  diminished: '°', // C°
  augmented: '+',  // C+
};

// ============================================================
// DIATONIC HARMONIZATION
// ============================================================
// Which triad quality for each scale degree
// ============================================================

// Major key: I, ii, iii, IV, V, vi, vii°
export const MAJOR_DIATONIC_QUALITIES = [
  'major',      // I
  'minor',      // ii
  'minor',      // iii
  'major',      // IV
  'major',      // V
  'minor',      // vi
  'diminished', // vii°
];

// Natural minor key: i, ii°, III, iv, v, VI, VII
export const MINOR_DIATONIC_QUALITIES = [
  'minor',      // i
  'diminished', // ii°
  'major',      // III
  'minor',      // iv
  'minor',      // v
  'major',      // VI
  'major',      // VII
];

// Roman numeral labels for major key
export const MAJOR_ROMAN_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

// Roman numeral labels for minor key
export const MINOR_ROMAN_NUMERALS = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

// ============================================================
// 3-STRING TRIAD SHAPES (G-B-E string set)
// ============================================================
// String indices: G=3, B=4, E=5 (thin E)
// Each shape: { stringIndex, interval, offset }
// offset is relative to root fret
// interval: 1, 3, b3, 5, b5, #5
// ============================================================

// Interval to semitone mapping for shape validation
const INTERVAL_SEMITONES = {
  '1': 0,
  '3': 4,
  'b3': 3,
  '5': 7,
  'b5': 6,
  '#5': 8,
};

// MAJOR triad shapes (1-3-5)
export const MAJOR_SHAPES = {
  // Root on G string (string 3)
  rootOnG: [
    { stringIndex: 3, interval: '1', offset: 0 },
    { stringIndex: 4, interval: '3', offset: 0 },
    { stringIndex: 5, interval: '5', offset: -2 },
  ],
  // Root on B string (string 4)
  rootOnB: [
    { stringIndex: 3, interval: '5', offset: -1 },
    { stringIndex: 4, interval: '1', offset: 0 },
    { stringIndex: 5, interval: '3', offset: -1 },
  ],
  // Root on E string (string 5)
  rootOnE: [
    { stringIndex: 3, interval: '3', offset: 1 },
    { stringIndex: 4, interval: '5', offset: 0 },
    { stringIndex: 5, interval: '1', offset: 0 },
  ],
};

// MINOR triad shapes (1-b3-5)
export const MINOR_SHAPES = {
  rootOnG: [
    { stringIndex: 3, interval: '1', offset: 0 },
    { stringIndex: 4, interval: 'b3', offset: -1 },
    { stringIndex: 5, interval: '5', offset: -2 },
  ],
  rootOnB: [
    { stringIndex: 3, interval: '5', offset: -1 },
    { stringIndex: 4, interval: '1', offset: 0 },
    { stringIndex: 5, interval: 'b3', offset: -2 },
  ],
  rootOnE: [
    { stringIndex: 3, interval: 'b3', offset: 0 },
    { stringIndex: 4, interval: '5', offset: 0 },
    { stringIndex: 5, interval: '1', offset: 0 },
  ],
};

// DIMINISHED triad shapes (1-b3-b5)
export const DIMINISHED_SHAPES = {
  rootOnG: [
    { stringIndex: 3, interval: '1', offset: 0 },
    { stringIndex: 4, interval: 'b3', offset: -1 },
    { stringIndex: 5, interval: 'b5', offset: -3 },
  ],
  rootOnB: [
    { stringIndex: 3, interval: 'b5', offset: -2 },
    { stringIndex: 4, interval: '1', offset: 0 },
    { stringIndex: 5, interval: 'b3', offset: -2 },
  ],
  rootOnE: [
    { stringIndex: 3, interval: 'b3', offset: 0 },
    { stringIndex: 4, interval: 'b5', offset: -1 },
    { stringIndex: 5, interval: '1', offset: 0 },
  ],
};

// AUGMENTED triad shapes (1-3-#5)
export const AUGMENTED_SHAPES = {
  rootOnG: [
    { stringIndex: 3, interval: '1', offset: 0 },
    { stringIndex: 4, interval: '3', offset: 0 },
    { stringIndex: 5, interval: '#5', offset: -1 },
  ],
  rootOnB: [
    { stringIndex: 3, interval: '#5', offset: 0 },
    { stringIndex: 4, interval: '1', offset: 0 },
    { stringIndex: 5, interval: '3', offset: -1 },
  ],
  rootOnE: [
    { stringIndex: 3, interval: '3', offset: 1 },
    { stringIndex: 4, interval: '#5', offset: 1 },
    { stringIndex: 5, interval: '1', offset: 0 },
  ],
};

// All shapes by quality
export const TRIAD_SHAPES = {
  major: MAJOR_SHAPES,
  minor: MINOR_SHAPES,
  diminished: DIMINISHED_SHAPES,
  augmented: AUGMENTED_SHAPES,
};

// Shape position names
export const SHAPE_NAMES = {
  rootOnG: 'Root on G',
  rootOnB: 'Root on B',
  rootOnE: 'Root on E',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Get triad notes from root and quality
export function getTriadNotes(rootNote, quality) {
  const intervals = TRIAD_INTERVALS[quality];
  if (!intervals) return [];
  
  return intervals.map(semitones => getNoteByInterval(rootNote, semitones));
}

// Get scale notes for a key
export function getScaleNotes(keyRoot, scaleType) {
  const intervals = scaleType === 'minor' 
    ? [0, 2, 3, 5, 7, 8, 10]  // Natural minor
    : MAJOR_SCALE_INTERVALS;  // Major
  
  return intervals.map(semitones => getNoteByInterval(keyRoot, semitones));
}

// Get all diatonic triads for a key
export function getDiatonicTriads(keyRoot, scaleType) {
  const scaleNotes = getScaleNotes(keyRoot, scaleType);
  const qualities = scaleType === 'minor' ? MINOR_DIATONIC_QUALITIES : MAJOR_DIATONIC_QUALITIES;
  const romanNumerals = scaleType === 'minor' ? MINOR_ROMAN_NUMERALS : MAJOR_ROMAN_NUMERALS;
  
  return scaleNotes.map((root, degree) => {
    const quality = qualities[degree];
    const romanNumeral = romanNumerals[degree];
    const notes = getTriadNotes(root, quality);
    const name = `${root}${TRIAD_ABBREV[quality]}`;
    
    return {
      degree: degree + 1,
      romanNumeral,
      root,
      quality,
      notes,
      name,
      fullName: `${romanNumeral} = ${name}`,
    };
  });
}

// Get root fret positions on a specific string
export function getRootFretsOnString(rootNote, stringIndex, minFret = 0, maxFret = 15) {
  const stringNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
  const openNote = stringNotes[stringIndex];
  const frets = [];
  
  for (let fret = minFret; fret <= maxFret; fret++) {
    const noteAtFret = getNoteAtPosition(openNote, fret);
    if (noteAtFret === rootNote) {
      frets.push(fret);
    }
  }
  
  return frets;
}

// Get all triad positions for a given root, quality, and fret range
export function getTriadPositions(rootNote, quality, minFret = 0, maxFret = 15) {
  const shapes = TRIAD_SHAPES[quality];
  if (!shapes) return [];
  
  const positions = [];
  
  // For each shape type (rootOnG, rootOnB, rootOnE)
  Object.entries(shapes).forEach(([shapeName, shapeNotes]) => {
    // Find which string has the root (offset = 0 and interval = '1')
    const rootNoteData = shapeNotes.find(n => n.interval === '1');
    if (!rootNoteData) return;
    
    const rootStringIndex = rootNoteData.stringIndex;
    
    // Find all positions where root can be placed on this string
    const rootFrets = getRootFretsOnString(rootNote, rootStringIndex, minFret, maxFret);
    
    rootFrets.forEach(rootFret => {
      // Calculate all note positions for this shape
      const notePositions = shapeNotes.map(noteData => {
        const fret = rootFret + noteData.offset;
        return {
          stringIndex: noteData.stringIndex,
          fret,
          interval: noteData.interval,
          isRoot: noteData.interval === '1',
        };
      });
      
      // Check if all frets are within valid range
      const allValid = notePositions.every(p => p.fret >= 0 && p.fret <= maxFret);
      
      if (allValid) {
        positions.push({
          shapeName,
          shapeLabel: SHAPE_NAMES[shapeName],
          rootFret,
          notes: notePositions,
        });
      }
    });
  });
  
  // Sort by root fret
  positions.sort((a, b) => a.rootFret - b.rootFret);
  
  return positions;
}

// Validate that a shape produces correct triad notes
export function validateTriadShape(rootNote, quality, shapeNotes, rootFret) {
  const expectedNotes = getTriadNotes(rootNote, quality);
  const stringNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
  
  const actualNotes = shapeNotes.map(noteData => {
    const fret = rootFret + noteData.offset;
    const openNote = stringNotes[noteData.stringIndex];
    return getNoteAtPosition(openNote, fret);
  });
  
  // Check if all actual notes are in expected notes (may be in different octaves)
  return actualNotes.every(note => expectedNotes.includes(note));
}

