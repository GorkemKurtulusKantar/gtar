import { STRING_MIDI } from '../utils/notes.js';
import { chordToneLabel } from '../utils/chords.js';
import { degreeColorIndex } from '../utils/degrees.js';
import './ChordDiagram.css';

const STRING_GAP = 16;
const FRET_GAP = 22;
const LEFT = 24;
const TOP = 22;
const SHOWN_FRETS = 5;

// Dikey akor diyagramı: soldan sağa kalın E -> ince E, yukarıdan aşağı perdeler
function ChordDiagram({ voicing, root, type, active, onClick, compact = false }) {
  const { frets, barre } = voicing;
  const fretted = frets.filter((f) => f != null && f > 0);
  const maxFret = fretted.length ? Math.max(...fretted) : 0;
  const minFret = fretted.length ? Math.min(...fretted) : 1;
  // Alt pozisyonlarda eşik (nut) gösterilir, yukarıda başlangıç perdesi yazılır
  const startFret = maxFret <= SHOWN_FRETS ? 1 : minFret;

  const width = LEFT + STRING_GAP * 5 + 14;
  const height = TOP + FRET_GAP * SHOWN_FRETS + 8;
  const x = (s) => LEFT + s * STRING_GAP;
  const y = (f) => TOP + (f - startFret + 0.5) * FRET_GAP;

  return (
    <button
      className={`chord-diagram ${active ? 'active' : ''} ${compact ? 'compact' : ''}`}
      onClick={onClick}
      title={frets.map((f) => (f == null ? 'x' : f)).join('-')}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={compact ? width * 0.7 : width} height={compact ? height * 0.7 : height}>
        {/* Perde çizgileri */}
        {Array.from({ length: SHOWN_FRETS + 1 }, (_, i) => (
          <line
            key={`f${i}`}
            className={i === 0 && startFret === 1 ? 'nut' : 'fret-line'}
            x1={x(0)} x2={x(5)}
            y1={TOP + i * FRET_GAP} y2={TOP + i * FRET_GAP}
          />
        ))}
        {/* Teller */}
        {frets.map((_, s) => (
          <line key={`s${s}`} className="string-line-svg" x1={x(s)} x2={x(s)} y1={TOP} y2={TOP + SHOWN_FRETS * FRET_GAP} />
        ))}

        {startFret > 1 && (
          <text className="start-fret" x={LEFT - 8} y={y(startFret) + 4} textAnchor="end">{startFret}</text>
        )}

        {/* Üstte: susturulan (×) ve boş (○) teller */}
        {frets.map((f, s) => {
          if (f == null) return <text key={`m${s}`} className="mute" x={x(s)} y={TOP - 7} textAnchor="middle">×</text>;
          if (f === 0) return <circle key={`o${s}`} className="open" cx={x(s)} cy={TOP - 10} r={4} />;
          return null;
        })}

        {barre && (
          <rect
            className="barre"
            x={x(barre.from) - 7} width={x(barre.to) - x(barre.from) + 14}
            y={y(barre.fret) - 7} height={14} rx={7}
          />
        )}

        {/* Basılan notalar, dereceye göre renkli */}
        {frets.map((f, s) => {
          if (f == null || f === 0) return null;
          const label = chordToneLabel(root, type, (STRING_MIDI[s] + f) % 12);
          return (
            <g key={`n${s}`} className={`dot deg-${degreeColorIndex(label)}`}>
              <circle cx={x(s)} cy={y(f)} r={7} />
              <text x={x(s)} y={y(f) + 3} textAnchor="middle">{label}</text>
            </g>
          );
        })}
      </svg>
      {!compact && <span className="chord-diagram-kind">{voicing.kind}</span>}
    </button>
  );
}

export default ChordDiagram;
