import { degreeColorIndex } from '../utils/degrees.js';
import './Fret.css';

function Fret({ stringIndex, fret, note, isScaleNote, isRootNote, scaleDegree, isSelected, isDimmed, onClick }) {
  // Renk için derecenin rakamı (♭3 -> 3, 9 -> 2)
  const degreeNumber = degreeColorIndex(scaleDegree);
  const fretClass = [
    'fret',
    isScaleNote && 'scale-note',
    isScaleNote && degreeNumber && `deg-${degreeNumber}`,
    isRootNote && 'root-note',
    isSelected && 'selected',
    isDimmed && 'dimmed',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={fretClass}
      onClick={() => onClick && onClick(stringIndex, fret, note)}
      title={note}
    >
      {isScaleNote && (
        <div className="note-indicator">
          <span className="scale-degree">{scaleDegree}</span>
        </div>
      )}
      {isSelected && !isScaleNote && (
        <div className="note-indicator">
          <span className="scale-degree">{note}</span>
        </div>
      )}
    </div>
  );
}

export default Fret;
