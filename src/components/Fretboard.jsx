import { isScaleNote, isRootNote, getScaleDegree } from '../utils/scales.js';
import { getNoteAtPosition, getMidiAtPosition } from '../utils/notes.js';
import { chordToneLabel } from '../utils/chords.js';
import Fret from './Fret.jsx';
import './Fretboard.css';

// chord: { root, type, frets } verilirse gam yerine akor notaları gösterilir, frets şekli vurgulanır
function Fretboard({ rootNote, scaleType, numFrets = 18, isMinorMode = false, selectedMidi = null, onNoteSelect, chord = null }) {
  const handleFretClick = (stringIndex, fret) => {
    onNoteSelect && onNoteSelect(getMidiAtPosition(stringIndex, fret));
  };

  // Tel sırası: en üstte en kalın (6. tel E), en altta en ince (1. tel E)
  // Görsel sıralama için reverse ediyoruz
  const strings = ['E', 'A', 'D', 'G', 'B', 'E'].reverse();

  const getChordFretInfo = (realStringIndex, fret) => {
    const pitchClass = getMidiAtPosition(realStringIndex, fret) % 12;
    const label = chordToneLabel(chord.root, chord.type, pitchClass);
    const inShape = chord.frets && chord.frets[realStringIndex] === fret;
    return {
      isScale: label != null,
      scaleDegree: label,
      isRoot: label === '1',
      isSelected: false,
      isDimmed: label != null && !inShape,
    };
  };

  const getScaleFretInfo = (realStringIndex, stringNote, fret) => {
    const isScale = isScaleNote(realStringIndex, fret, rootNote, scaleType, isMinorMode);
    const note = getNoteAtPosition(stringNote, fret);
    const scaleDegreeResult = isScale ? getScaleDegree(note, rootNote, scaleType, realStringIndex, fret, isMinorMode) : null;

    // Minor mode'da degree bir obje döner {value, label, isRoot}
    // Major mode'da sadece sayı döner
    let scaleDegree, isRoot;
    if (isMinorMode && scaleDegreeResult && typeof scaleDegreeResult === 'object') {
      scaleDegree = scaleDegreeResult.label;
      isRoot = scaleDegreeResult.isRoot && isScale;
    } else {
      scaleDegree = scaleDegreeResult;
      isRoot = isRootNote(realStringIndex, fret, rootNote);
    }

    return {
      isScale,
      scaleDegree,
      isRoot,
      isSelected: getMidiAtPosition(realStringIndex, fret) === selectedMidi,
      isDimmed: false,
    };
  };

  return (
    <div className="fretboard-container">
      <div className="fretboard">
        <div className="fretboard-header">
          <div className="string-label-space"></div>
          {Array.from({ length: numFrets + 1 }, (_, i) => (
            <div key={i} className="fret-number">
              {i === 0 ? '0' : i}
            </div>
          ))}
        </div>

        {strings.map((stringNote, visualIndex) => {
          // Görsel index'i gerçek string index'ine çevir
          // visualIndex 0 (en altta, en ince E) -> realIndex 5
          // visualIndex 5 (en üstte, en kalın E) -> realIndex 0
          const realStringIndex = 5 - visualIndex;
          const isMuted = chord && chord.frets && chord.frets[realStringIndex] == null;

          return (
            <div key={visualIndex} className={`string-row ${isMuted ? 'muted' : ''}`}>
              <div className="string-label">{isMuted ? '×' : stringNote}</div>
              <div className="string-line"></div>
              {Array.from({ length: numFrets + 1 }, (_, fret) => {
                const info = chord
                  ? getChordFretInfo(realStringIndex, fret)
                  : getScaleFretInfo(realStringIndex, stringNote, fret);

                return (
                  <Fret
                    key={fret}
                    stringIndex={realStringIndex}
                    fret={fret}
                    note={getNoteAtPosition(stringNote, fret)}
                    isScaleNote={info.isScale}
                    isRootNote={info.isRoot}
                    scaleDegree={info.scaleDegree}
                    isSelected={info.isSelected}
                    isDimmed={info.isDimmed}
                    onClick={handleFretClick}
                  />
                );
              })}
            </div>
          );
        })}

        <div className="fretboard-footer">
          <div className="string-label-space"></div>
          {Array.from({ length: numFrets + 1 }, (_, i) => (
            <div key={i} className="fret-number">
              {i === 0 ? '0' : i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Fretboard;
