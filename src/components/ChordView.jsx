import { useState, useEffect, useMemo } from 'react';
import Fretboard from './Fretboard.jsx';
import ChordDiagram from './ChordDiagram.jsx';
import { NOTES } from '../utils/notes.js';
import { CHORD_TYPES, chordName, getChordVoicings, nearestVoicing, voicingMidis } from '../utils/chords.js';
import { playChord, playMidi } from '../utils/audio.js';
import './ChordView.css';

// Hazır diziler: kökten yarım ton uzaklık + akor türü
const PRESETS = [
  { name: 'I–V–vi–IV', chords: [[0, 'maj'], [7, 'maj'], [9, 'min'], [5, 'maj']] },
  { name: 'ii–V–I', chords: [[2, 'm7'], [7, '7'], [0, 'maj7']] },
  { name: 'i–♭VI–♭III–♭VII', chords: [[0, 'min'], [8, 'maj'], [3, 'maj'], [10, 'maj']] },
  { name: 'Andalusian i–♭VII–♭VI–V', chords: [[0, 'min'], [10, 'maj'], [8, 'maj'], [7, 'maj']] },
];

const sameFrets = (a, b) => !!a && !!b && a.every((f, i) => f === b[i]);
const fretsText = (frets) => frets.map((f) => (f == null ? 'x' : f)).join(frets.some((f) => f > 9) ? '-' : '');

function loadProgression() {
  try {
    const saved = JSON.parse(localStorage.getItem('gtar_progression'));
    return Array.isArray(saved) ? saved.filter((c) => NOTES.includes(c.root) && CHORD_TYPES[c.type] && c.frets?.length === 6) : [];
  } catch {
    return [];
  }
}

function ChordView({ rootNote, chordType, onChordChange, soundOn, onShowMidis }) {
  const voicings = useMemo(() => getChordVoicings(rootNote, chordType), [rootNote, chordType]);
  const [selectedFrets, setSelectedFrets] = useState(null);
  const userPicked = voicings.some((v) => sameFrets(v.frets, selectedFrets));
  const currentVoicing = voicings.find((v) => sameFrets(v.frets, selectedFrets)) || voicings[0];

  const [progression, setProgression] = useState(loadProgression);
  const [activeIndex, setActiveIndex] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [bpm, setBpm] = useState(() => Number(localStorage.getItem('gtar_bpm')) || 80);
  const [beatsPerChord, setBeatsPerChord] = useState(() => Number(localStorage.getItem('gtar_beats')) || 4);

  useEffect(() => {
    localStorage.setItem('gtar_progression', JSON.stringify(progression));
  }, [progression]);

  useEffect(() => {
    localStorage.setItem('gtar_bpm', bpm);
    localStorage.setItem('gtar_beats', beatsPerChord);
  }, [bpm, beatsPerChord]);

  // Çalarken o anki akor, değilse seçili akor gösterilir
  const display = playing && progression[playIndex]
    ? progression[playIndex]
    : { root: rootNote, type: chordType, frets: currentVoicing?.frets };

  const displayKey = `${display.root}|${display.type}|${display.frets?.join(',')}`;
  useEffect(() => {
    onShowMidis(display.frets ? voicingMidis(display.frets) : []);
  }, [displayKey]);

  // Akor dizisini döngüde çal
  useEffect(() => {
    if (!playing) return;
    if (!progression.length) {
      setPlaying(false);
      return;
    }
    let index = 0;
    const tick = () => {
      setPlayIndex(index);
      if (soundOn) playChord(voicingMidis(progression[index].frets));
      index = (index + 1) % progression.length;
    };
    tick();
    const timer = setInterval(tick, (60000 / bpm) * beatsPerChord);
    return () => clearInterval(timer);
  }, [playing, progression, bpm, beatsPerChord, soundOn]);

  const activeMatches = activeIndex != null
    && progression[activeIndex]?.root === rootNote
    && progression[activeIndex]?.type === chordType;

  const handleShapeClick = (voicing) => {
    setSelectedFrets(voicing.frets);
    if (soundOn) playChord(voicingMidis(voicing.frets));
    // Diziden seçili akor düzenleniyorsa şeklini güncelle
    if (activeMatches) {
      setProgression((prog) => prog.map((c, i) => (i === activeIndex ? { ...c, frets: voicing.frets } : c)));
    }
  };

  const addToProgression = () => {
    if (!currentVoicing) return;
    const previous = progression[progression.length - 1];
    // Kullanıcı şekil seçmediyse bir önceki akora en yakın şekil
    const voicing = userPicked ? currentVoicing : nearestVoicing(voicings, previous?.frets);
    setProgression((prog) => [...prog, { root: rootNote, type: chordType, frets: voicing.frets }]);
    setSelectedFrets(voicing.frets);
    setActiveIndex(progression.length);
  };

  const loadPreset = (preset) => {
    const rootPc = NOTES.indexOf(rootNote);
    let previous = null;
    const chords = preset.chords.map(([offset, type]) => {
      const root = NOTES[(rootPc + offset) % 12];
      const voicing = nearestVoicing(getChordVoicings(root, type), previous);
      previous = voicing.frets;
      return { root, type, frets: voicing.frets };
    });
    setProgression(chords);
    setActiveIndex(null);
  };

  const selectChip = (index) => {
    const chord = progression[index];
    setActiveIndex(index);
    onChordChange(chord.root, chord.type);
    setSelectedFrets(chord.frets);
    if (soundOn) playChord(voicingMidis(chord.frets));
  };

  const removeChip = (index) => {
    setProgression((prog) => prog.filter((_, i) => i !== index));
    setActiveIndex(null);
  };

  return (
    <div className="chord-view">
      <Fretboard
        rootNote={display.root}
        scaleType="major"
        numFrets={18}
        chord={display}
        onNoteSelect={(midi) => soundOn && playMidi(midi)}
      />

      <section className="chord-section">
        <div className="chord-section-header">
          <h2 className="chord-section-title">
            {chordName(rootNote, chordType)}
            <span className="chord-section-sub">
              {CHORD_TYPES[chordType].labels.join(' · ')} · {voicings.length} shapes
            </span>
          </h2>
          <button className="chord-btn primary" onClick={addToProgression}>
            + Add to progression
          </button>
        </div>

        <div className="chord-shapes">
          {voicings.map((v) => (
            <ChordDiagram
              key={v.frets.join(',')}
              voicing={v}
              root={rootNote}
              type={chordType}
              active={sameFrets(v.frets, currentVoicing?.frets)}
              onClick={() => handleShapeClick(v)}
            />
          ))}
        </div>
      </section>

      <section className="chord-section">
        <div className="chord-section-header">
          <h2 className="chord-section-title">Progression</h2>
          <div className="progression-controls">
            <button
              className={`chord-btn ${playing ? 'stop' : 'primary'}`}
              onClick={() => setPlaying(!playing)}
              disabled={!progression.length}
            >
              {playing ? 'Stop' : 'Play'}
            </button>
            <label className="chord-field">
              BPM
              <input
                type="number" min="40" max="220" value={bpm}
                onChange={(e) => setBpm(Math.min(220, Math.max(40, Number(e.target.value) || 80)))}
              />
            </label>
            <label className="chord-field">
              Beats
              <select value={beatsPerChord} onChange={(e) => setBeatsPerChord(Number(e.target.value))}>
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </label>
            <button className="chord-btn" onClick={() => { setProgression([]); setPlaying(false); }} disabled={!progression.length}>
              Clear
            </button>
          </div>
        </div>

        <div className="progression-presets">
          <span className="presets-label">Presets in {rootNote}:</span>
          {PRESETS.map((p) => (
            <button key={p.name} className="preset-btn" onClick={() => loadPreset(p)}>{p.name}</button>
          ))}
        </div>

        {progression.length === 0 ? (
          <p className="progression-empty">
            Pick a chord from the sidebar and press "Add to progression", or start from a preset.
            Each new chord gets the shape closest to the previous one.
          </p>
        ) : (
          <div className="progression-chips">
            {progression.map((c, i) => (
              <div
                key={i}
                className={`progression-chip ${playing && i === playIndex ? 'playing' : ''} ${!playing && i === activeIndex && activeMatches ? 'active' : ''}`}
              >
                <button className="chip-main" onClick={() => selectChip(i)}>
                  <span className="chip-name">{chordName(c.root, c.type)}</span>
                  <span className="chip-frets">{fretsText(c.frets)}</span>
                </button>
                <button className="chip-remove" onClick={() => removeChip(i)} title="Remove">×</button>
              </div>
            ))}
          </div>
        )}
        {activeMatches && !playing && (
          <p className="progression-hint">
            Editing chord {activeIndex + 1}: click a shape above to change its voicing.
          </p>
        )}
      </section>
    </div>
  );
}

export default ChordView;
