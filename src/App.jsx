import { useState, useEffect } from 'react';
import Fretboard from './components/Fretboard.jsx';
import ScaleSelector from './components/ScaleSelector.jsx';
import KeySelector from './components/KeySelector.jsx';
import HexatonicPatternSelector from './components/HexatonicPatternSelector.jsx';
import TriadDisplay from './components/TriadDisplay.jsx';
import ChordView from './components/ChordView.jsx';
import Piano from './components/Piano.jsx';
import { SCALE_NAMES, SCALE_PATTERNS, getRelativeMajor } from './utils/scales.js';
import { CHORD_TYPES, CHORD_TYPE_IDS, chordName } from './utils/chords.js';
import { NOTES } from './utils/notes.js';
import { degreeColorIndex } from './utils/degrees.js';
import { playMidi } from './utils/audio.js';
import './styles/App.css';

// Gam dereceleri için renk açıklaması (Fret.css'teki deg-N renkleriyle aynı)
const SCALE_LEGEND = ['1', '2', '3', '4', '5', '6', '7'];

function App() {
  // localStorage'dan son kullanılan değerleri yükle
  const [rootNote, setRootNote] = useState(() => {
    const saved = localStorage.getItem('gtar_rootNote');
    return saved || 'C';
  });

  const [scaleType, setScaleType] = useState(() => {
    const saved = localStorage.getItem('gtar_scaleType');
    return saved && SCALE_NAMES[saved] ? saved : 'major';
  });

  const [hexatonicPattern, setHexatonicPattern] = useState(() => {
    const saved = localStorage.getItem('gtar_hexatonicPattern');
    return saved || null;
  });

  // View mode: 'patterns', 'triads' or 'chords'
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('gtar_viewMode');
    return saved || 'patterns';
  });

  const [chordType, setChordType] = useState(() => {
    const saved = localStorage.getItem('gtar_chordType');
    return saved && CHORD_TYPES[saved] ? saved : 'maj';
  });

  // localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('gtar_rootNote', rootNote);
  }, [rootNote]);

  useEffect(() => {
    localStorage.setItem('gtar_scaleType', scaleType);
  }, [scaleType]);

  useEffect(() => {
    if (hexatonicPattern) {
      localStorage.setItem('gtar_hexatonicPattern', hexatonicPattern);
    } else {
      localStorage.removeItem('gtar_hexatonicPattern');
    }
  }, [hexatonicPattern]);

  useEffect(() => {
    localStorage.setItem('gtar_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('gtar_chordType', chordType);
  }, [chordType]);

  // Scale type değiştiğinde hexatonic pattern'i sıfırla veya ayarla
  useEffect(() => {
    if (scaleType === 'major' || scaleType === 'minor') {
      // Major ve Minor için hexatonic pattern'ler mevcut
      if (!hexatonicPattern || !hexatonicPattern.startsWith('hexatonicMajor')) {
        setHexatonicPattern('hexatonicMajor1');
      }
    } else {
      // Diğer scale'ler için hexatonic pattern yok
      setHexatonicPattern(null);
    }
  }, [scaleType]);

  // Minor mode kontrolü
  const isMinorMode = scaleType === 'minor';

  // Minor mode'da relative major'ı hesapla
  const parentMajor = isMinorMode ? getRelativeMajor(rootNote) : null;

  // Aktif skalayı belirle
  const activeScaleType = hexatonicPattern || scaleType;
  const displayScaleName = hexatonicPattern
    ? SCALE_NAMES[hexatonicPattern]
    : SCALE_NAMES[scaleType];

  // Check if triads are available for current scale type
  const triadsAvailable = scaleType === 'major' || scaleType === 'minor';

  // Triad görünümü olmayan skalalarda triad yerine pattern görünümü
  const effectiveView = viewMode === 'triads' && !triadsAvailable ? 'patterns' : viewMode;
  const isChordView = effectiveView === 'chords';

  // Seçili nota (MIDI) - fretboard ve piyano arasında paylaşılır
  const [selectedMidi, setSelectedMidi] = useState(null);
  // Akor görünümünde piyanoda gösterilen akor notaları
  const [chordMidis, setChordMidis] = useState([]);

  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('gtar_soundOn') !== 'false');

  useEffect(() => {
    localStorage.setItem('gtar_soundOn', soundOn);
  }, [soundOn]);

  const handleNoteSelect = (midi) => {
    setSelectedMidi(midi);
    if (soundOn) playMidi(midi);
  };

  const handleChordChange = (root, type) => {
    setRootNote(root);
    setChordType(type);
  };

  // Piyanoda gamın notalarını göstermek için pitch class'lar (hexatonic pattern'lerde ana gam)
  const rootPitchClass = NOTES.indexOf(rootNote);
  const scalePitchClasses = (SCALE_PATTERNS[scaleType] || []).map((s) => (rootPitchClass + s) % 12);

  const legend = isChordView ? CHORD_TYPES[chordType].labels : SCALE_LEGEND;

  const viewButtons = [
    { id: 'patterns', label: 'Patterns' },
    ...(triadsAvailable ? [{ id: 'triads', label: 'Triads' }] : []),
    { id: 'chords', label: 'Chords' },
  ];

  return (
    <div className="app">
      {/* Sol yan panel - tüm ayarlar */}
      <aside className="sidebar">
        <div className="sidebar-brand">Gtar</div>

        <div className="view-mode-selector">
          <h3 className="selector-title">View</h3>
          <div className="view-mode-buttons" style={{ gridTemplateColumns: `repeat(${viewButtons.length}, 1fr)` }}>
            {viewButtons.map((b) => (
              <button
                key={b.id}
                className={`view-mode-btn ${effectiveView === b.id ? 'active' : ''}`}
                onClick={() => setViewMode(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <KeySelector
          selectedKey={rootNote}
          onKeyChange={setRootNote}
        />

        {isChordView ? (
          <div className="scale-selector">
            <h3 className="selector-title">Chord</h3>
            <div className="scale-buttons">
              {CHORD_TYPE_IDS.map((id) => (
                <button
                  key={id}
                  className={`scale-button ${chordType === id ? 'active' : ''}`}
                  onClick={() => setChordType(id)}
                >
                  {CHORD_TYPES[id].name}
                  <span className="scale-button-hint">{chordName(rootNote, id)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ScaleSelector
            selectedScale={scaleType}
            onScaleChange={setScaleType}
          />
        )}

        {triadsAvailable && effectiveView === 'patterns' && (
          <HexatonicPatternSelector
            scaleType={scaleType}
            selectedPattern={hexatonicPattern}
            onPatternChange={setHexatonicPattern}
          />
        )}

        {isMinorMode && hexatonicPattern && effectiveView === 'patterns' && (
          <p className="parent-major-label">
            Parent: {parentMajor || rootNote} Major
          </p>
        )}

        <button
          className={`sound-toggle ${soundOn ? 'active' : ''}`}
          onClick={() => setSoundOn(!soundOn)}
          title="Play notes when clicked"
        >
          <span className="sound-dot" />
          {soundOn ? 'Sound on' : 'Sound off'}
        </button>
      </aside>

      <main className="app-main">
        <header className="app-header">
          {isChordView ? (
            <>
              <span className="header-key">{chordName(rootNote, chordType)}</span>
              <span className="header-scale">{CHORD_TYPES[chordType].name}</span>
            </>
          ) : (
            <>
              <span className="header-key">{rootNote}</span>
              <span className="header-scale">{SCALE_NAMES[scaleType]}</span>
              {effectiveView === 'triads' && <span className="header-view">Diatonic Triads</span>}
              {effectiveView === 'patterns' && hexatonicPattern && (
                <span className="header-view">{displayScaleName}</span>
              )}
            </>
          )}
        </header>

        {effectiveView !== 'triads' && (
          <div className="degree-legend">
            {legend.map((label) => (
              <span key={label} className={`legend-item deg-${degreeColorIndex(label)}`}>
                <span className="legend-dot" />
                {label}
              </span>
            ))}
          </div>
        )}

        {effectiveView === 'patterns' && (
          <Fretboard
            rootNote={rootNote}
            scaleType={activeScaleType}
            numFrets={18}
            isMinorMode={isMinorMode}
            selectedMidi={selectedMidi}
            onNoteSelect={handleNoteSelect}
          />
        )}
        {effectiveView === 'triads' && (
          <TriadDisplay
            keyRoot={rootNote}
            scaleType={scaleType}
          />
        )}

        {isChordView && (
          <ChordView
            rootNote={rootNote}
            chordType={chordType}
            onChordChange={handleChordChange}
            soundOn={soundOn}
            onShowMidis={setChordMidis}
          />
        )}

        <Piano
          selectedMidis={isChordView ? chordMidis : selectedMidi != null ? [selectedMidi] : []}
          onKeyClick={isChordView ? (midi) => soundOn && playMidi(midi) : handleNoteSelect}
          scalePitchClasses={isChordView ? [] : scalePitchClasses}
          rootPitchClass={isChordView ? null : rootPitchClass}
        />
      </main>
    </div>
  );
}

export default App;
