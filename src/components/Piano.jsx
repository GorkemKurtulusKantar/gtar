import { NOTES, PIANO_LOWEST_MIDI, PIANO_HIGHEST_MIDI, midiToNoteName } from '../utils/notes.js';
import './Piano.css';

const isBlackKey = (midi) => NOTES[midi % 12].includes('#');

// 88 tuşu bir kere hesapla: beyaz tuşlar sıralı, siyah tuşlar önceki beyaz tuşa göre konumlanır
const WHITE_KEYS = [];
const BLACK_KEYS = [];
for (let midi = PIANO_LOWEST_MIDI; midi <= PIANO_HIGHEST_MIDI; midi++) {
  if (isBlackKey(midi)) {
    BLACK_KEYS.push({ midi, whiteIndex: WHITE_KEYS.length });
  } else {
    WHITE_KEYS.push({ midi });
  }
}
const WHITE_WIDTH = 100 / WHITE_KEYS.length;
const BLACK_WIDTH = WHITE_WIDTH * 0.6;

// selectedMidis: işaretlenecek notalar (tek nota veya akor)
// scalePitchClasses: gamdaki notaların 0-11 arası pitch class'ları; rootPitchClass: kök nota
function Piano({ selectedMidis = [], onKeyClick, scalePitchClasses = [], rootPitchClass = null, hint }) {
  const selected = new Set(selectedMidis);
  const sortedSelection = [...selected].sort((a, b) => a - b);

  const keyClass = (midi, color) => {
    const pitchClass = midi % 12;
    return [
      'piano-key',
      color,
      selected.has(midi) && 'selected',
      scalePitchClasses.includes(pitchClass) && 'in-scale',
      pitchClass === rootPitchClass && 'scale-root',
      midi === 60 && 'middle-c',
    ].filter(Boolean).join(' ');
  };

  const renderLabel = (midi) => {
    if (selected.has(midi)) return midiToNoteName(midi);
    if (midi % 12 === 0) return midiToNoteName(midi); // Oktav referansı için C'ler
    return null;
  };

  return (
    <div className="piano-container">
      <div className="piano-info">
        {sortedSelection.length === 1 && (
          <>
            <span className="piano-info-note">{midiToNoteName(sortedSelection[0])}</span>
            <span className="piano-info-detail">
              Piano key {sortedSelection[0] - PIANO_LOWEST_MIDI + 1} / 88 · MIDI {sortedSelection[0]}
            </span>
          </>
        )}
        {sortedSelection.length > 1 && (
          <span className="piano-info-note">{sortedSelection.map(midiToNoteName).join(' · ')}</span>
        )}
        {sortedSelection.length === 0 && (
          <span className="piano-info-hint">{hint || 'Click a note on the fretboard to see it on the piano'}</span>
        )}
      </div>

      <div className="piano-scroll">
        <div className="piano">
          {WHITE_KEYS.map(({ midi }) => (
            <div
              key={midi}
              className={keyClass(midi, 'white')}
              style={{ width: `${WHITE_WIDTH}%` }}
              title={midiToNoteName(midi)}
              onClick={() => onKeyClick && onKeyClick(midi)}
            >
              <span className="piano-key-label">{renderLabel(midi)}</span>
            </div>
          ))}
          {BLACK_KEYS.map(({ midi, whiteIndex }) => (
            <div
              key={midi}
              className={keyClass(midi, 'black')}
              style={{
                left: `${whiteIndex * WHITE_WIDTH - BLACK_WIDTH / 2}%`,
                width: `${BLACK_WIDTH}%`,
              }}
              title={midiToNoteName(midi)}
              onClick={() => onKeyClick && onKeyClick(midi)}
            >
              {selected.has(midi) && <span className="piano-key-label">{NOTES[midi % 12]}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Piano;
