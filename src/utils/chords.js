// Akor türleri ve gitar klavyesinde çalınabilir akor şekillerini (voicing) bulan arama
import { NOTES, STRING_MIDI } from './notes.js';

// intervals: kökten yarım ton; labels: dereceler (renk ve etiket için)
export const CHORD_TYPES = {
  maj:   { name: 'Major',      symbol: '',     intervals: [0, 4, 7],         labels: ['1', '3', '5'] },
  min:   { name: 'Minor',      symbol: 'm',    intervals: [0, 3, 7],         labels: ['1', '♭3', '5'] },
  '5':   { name: 'Power',      symbol: '5',    intervals: [0, 7],            labels: ['1', '5'], minStrings: 2 },
  '7':   { name: 'Dominant 7', symbol: '7',    intervals: [0, 4, 7, 10],     labels: ['1', '3', '5', '♭7'] },
  maj7:  { name: 'Major 7',    symbol: 'maj7', intervals: [0, 4, 7, 11],     labels: ['1', '3', '5', '7'] },
  m7:    { name: 'Minor 7',    symbol: 'm7',   intervals: [0, 3, 7, 10],     labels: ['1', '♭3', '5', '♭7'] },
  '6':   { name: 'Major 6',    symbol: '6',    intervals: [0, 4, 7, 9],      labels: ['1', '3', '5', '6'] },
  m6:    { name: 'Minor 6',    symbol: 'm6',   intervals: [0, 3, 7, 9],      labels: ['1', '♭3', '5', '6'] },
  sus2:  { name: 'Sus 2',      symbol: 'sus2', intervals: [0, 2, 7],         labels: ['1', '2', '5'] },
  sus4:  { name: 'Sus 4',      symbol: 'sus4', intervals: [0, 5, 7],         labels: ['1', '4', '5'] },
  '7sus4': { name: '7 Sus 4',  symbol: '7sus4', intervals: [0, 5, 7, 10],    labels: ['1', '4', '5', '♭7'] },
  add9:  { name: 'Add 9',      symbol: 'add9', intervals: [0, 4, 7, 2],      labels: ['1', '3', '5', '9'] },
  '9':   { name: 'Dominant 9', symbol: '9',    intervals: [0, 4, 7, 10, 2],  labels: ['1', '3', '5', '♭7', '9'] },
  dim:   { name: 'Diminished', symbol: 'dim',  intervals: [0, 3, 6],         labels: ['1', '♭3', '♭5'] },
  m7b5:  { name: 'Half-dim',   symbol: 'm7♭5', intervals: [0, 3, 6, 10],     labels: ['1', '♭3', '♭5', '♭7'] },
  dim7:  { name: 'Dim 7',      symbol: 'dim7', intervals: [0, 3, 6, 9],      labels: ['1', '♭3', '♭5', '𝄫7'] },
  aug:   { name: 'Augmented',  symbol: 'aug',  intervals: [0, 4, 8],         labels: ['1', '3', '♯5'] },
};

// Sıra açıkça yazılı: Object.keys sayı görünümlü anahtarları ('5', '7'...) başa alır
export const CHORD_TYPE_IDS = [
  'maj', 'min', '5', '7', 'maj7', 'm7', '6', 'm6', 'sus2', 'sus4', '7sus4', 'add9', '9', 'dim', 'm7b5', 'dim7', 'aug',
];

const MAX_SPAN = 3;       // en düşük ve en yüksek basılan perde arası en fazla 3 perde (4 perdelik pencere)
const MAX_FINGERS = 4;
const OPEN_MAX_FRET = 4;  // boş teller sadece alt pozisyonlardaki şekillerde kullanılır

export function chordName(root, typeId) {
  return `${root}${CHORD_TYPES[typeId].symbol}`;
}

// Akordaki bir notanın derece etiketi (yoksa null)
export function chordToneLabel(rootNote, typeId, pitchClass) {
  const type = CHORD_TYPES[typeId];
  const interval = (pitchClass - NOTES.indexOf(rootNote) + 12) % 12;
  const index = type.intervals.findIndex((i) => i % 12 === interval);
  return index === -1 ? null : type.labels[index];
}

// frets: 6 elemanlı dizi (0 = kalın E), null = susturulmuş tel
export function voicingMidis(frets) {
  return frets.map((f, s) => (f == null ? null : STRING_MIDI[s] + f)).filter((m) => m != null);
}

// Barre: en düşük perdede 2+ tel basılıyorsa ve aralarında boş tel yoksa tek parmakla basılır
function analyzeFingering(frets) {
  const fretted = frets.map((f, s) => ({ f, s })).filter(({ f }) => f != null && f > 0);
  if (fretted.length === 0) return { fingers: 0, barre: null };

  const minFret = Math.min(...fretted.map(({ f }) => f));
  const atMin = fretted.filter(({ f }) => f === minFret);
  const from = atMin[0].s;
  const to = atMin[atMin.length - 1].s;
  const openUnderBarre = frets.slice(from, to + 1).some((f) => f === 0);
  // İşaret parmağı barresinin altında (bas tarafında) basılı tel olamaz
  const frettedBelowBarre = fretted.some(({ s }) => s < from);

  if (atMin.length >= 2 && !openUnderBarre && !frettedBelowBarre) {
    const fingers = 1 + fretted.filter(({ f }) => f > minFret).length;
    // Barre gerekmiyorsa (4 parmak yetiyorsa) barre çizme - open akorlar gibi
    if (fretted.length <= MAX_FINGERS) return { fingers: fretted.length, barre: null };
    return { fingers, barre: { fret: minFret, from, to } };
  }
  return { fingers: fretted.length, barre: null };
}

export function getChordVoicings(rootNote, typeId, maxFret = 15) {
  const type = CHORD_TYPES[typeId];
  const rootPc = NOTES.indexOf(rootNote);
  const chordPcs = [...new Set(type.intervals.map((i) => (rootPc + i) % 12))];
  // 4+ notalı akorlarda 5'li atlanabilir (gitarda yaygın)
  const fifthPc = (rootPc + 7) % 12;
  const requiredPcs = type.intervals.length >= 4 ? chordPcs.filter((pc) => pc !== fifthPc) : chordPcs;
  const minStrings = type.minStrings ?? 4;

  const found = new Map();

  for (let start = 1; start <= maxFret - MAX_SPAN; start++) {
    const options = STRING_MIDI.map((open) => {
      const opts = [null];
      if (start <= OPEN_MAX_FRET && chordPcs.includes(open % 12)) opts.push(0);
      for (let f = start; f <= start + MAX_SPAN; f++) {
        if (chordPcs.includes((open + f) % 12)) opts.push(f);
      }
      return opts;
    });

    const current = [];
    const walk = (s) => {
      if (s === 6) {
        const result = evaluate(current, rootPc, requiredPcs, minStrings);
        if (result) found.set(current.join(','), result);
        return;
      }
      for (const opt of options[s]) {
        current[s] = opt;
        walk(s + 1);
      }
    };
    walk(0);
  }

  return pickBest([...found.values()]);
}

function evaluate(frets, rootPc, requiredPcs, minStrings) {
  const sounding = frets.map((f, s) => (f == null ? null : s)).filter((s) => s != null);
  if (sounding.length < minStrings) return null;

  // Susturulan teller sadece kenarlarda olabilir (ortada susturulmuş tel yok)
  const first = sounding[0];
  const last = sounding[sounding.length - 1];
  if (last - first + 1 !== sounding.length) return null;

  // Bas notası kök olmalı (kök pozisyon akorlar)
  if ((STRING_MIDI[first] + frets[first]) % 12 !== rootPc) return null;

  const pcs = new Set(sounding.map((s) => (STRING_MIDI[s] + frets[s]) % 12));
  if (!requiredPcs.every((pc) => pcs.has(pc))) return null;

  const fretted = frets.filter((f) => f != null && f > 0);
  if (fretted.length && Math.max(...fretted) - Math.min(...fretted) > MAX_SPAN) return null;

  // Boş tel kullanan şekillerde basılan perdeler alt pozisyonda kalmalı (gerçek open akorlar)
  const hasOpen = frets.some((f) => f === 0);
  if (hasOpen && fretted.some((f) => f > OPEN_MAX_FRET)) return null;
  // Bas basılıysa hemen üstündeki tel boş olamaz (1-0-3-2-1-x gibi doğal olmayan şekiller)
  if (frets[first] > 0 && frets[first + 1] === 0) return null;

  const { fingers, barre } = analyzeFingering(frets);
  if (fingers > MAX_FINGERS) return null;

  const minFret = fretted.length ? Math.min(...fretted) : 0;
  const mutes = 6 - sounding.length;

  return {
    frets: [...frets],
    barre,
    fingers,
    position: hasOpen ? 0 : minFret,
    kind: hasOpen ? 'Open' : barre ? 'Barre' : 'Movable',
    // Düşük puan daha iyi: daha çok tel çalan, daha az parmak gerektiren şekiller öne.
    // İnce tellerin susturulması tararken (strum) daha zor, ayrıca cezalandırılır.
    score: mutes * 1.2 + (5 - last) * 1.0 + fingers * 0.5 + (barre ? 0.3 : 0),
  };
}

// Bir şekil, diğerinin sadece kenar telleri susturulmuş hali mi?
function isSubsetOf(v, other) {
  return v.frets.every((f, s) => f == null || f === other.frets[s]);
}

// Her pozisyon için en iyi 2 farklı şekli tut, perde sırasına göre diz
function pickBest(voicings) {
  const byPosition = new Map();
  for (const v of voicings) {
    if (!byPosition.has(v.position)) byPosition.set(v.position, []);
    byPosition.get(v.position).push(v);
  }
  const result = [];
  for (const [, group] of [...byPosition.entries()].sort((a, b) => a[0] - b[0])) {
    group.sort((a, b) => a.score - b.score);
    const kept = [];
    for (const v of group) {
      if (kept.length === 2) break;
      if (!kept.some((k) => isSubsetOf(v, k))) kept.push(v);
    }
    result.push(...kept);
  }
  return result;
}

// Elin pozisyonu: open şekiller 0, diğerleri en düşük basılan perde
function handPosition(frets) {
  if (frets.some((f) => f === 0)) return 0;
  const fretted = frets.filter((f) => f != null && f > 0);
  return fretted.length ? Math.min(...fretted) : 0;
}

// Bir önceki akora en yakın şekli seç (voice leading); eşitlikte daha rahat şekil kazanır
export function nearestVoicing(voicings, previousFrets) {
  if (!voicings.length) return null;
  if (!previousFrets) return voicings[0];
  const target = handPosition(previousFrets);
  const cost = (v) => Math.abs(handPosition(v.frets) - target) * 0.5 + v.score * 0.3;
  return voicings.reduce((best, v) => (cost(v) < cost(best) ? v : best));
}
