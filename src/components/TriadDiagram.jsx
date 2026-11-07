import './TriadDiagram.css';

// Mini fretboard diagram for a single triad shape
function TriadDiagram({ triadPosition, triadName, quality }) {
  const { shapeName, shapeLabel, rootFret, notes } = triadPosition;
  
  // Calculate fret range to display (3-4 frets around the shape)
  const frets = notes.map(n => n.fret);
  const minFret = Math.max(0, Math.min(...frets) - 1);
  const maxFret = Math.max(...frets) + 1;
  const displayFrets = [];
  for (let f = minFret; f <= maxFret; f++) {
    displayFrets.push(f);
  }
  
  // String labels (only showing G, B, E for this string set)
  const strings = [
    { index: 3, label: 'G' },
    { index: 4, label: 'B' },
    { index: 5, label: 'e' },
  ];
  
  // Get note at position
  const getNoteAt = (stringIndex, fret) => {
    return notes.find(n => n.stringIndex === stringIndex && n.fret === fret);
  };
  
  return (
    <div className="triad-diagram">
      <div className="triad-diagram-header">
        <span className="shape-label">{shapeLabel}</span>
        <span className="root-fret">Fret {rootFret}</span>
      </div>
      
      <div className="mini-fretboard">
        {/* Fret numbers */}
        <div className="fret-numbers">
          <div className="string-label-space"></div>
          {displayFrets.map(fret => (
            <div key={fret} className="fret-num">{fret}</div>
          ))}
        </div>
        
        {/* Strings */}
        {strings.map(({ index, label }) => (
          <div key={index} className="mini-string-row">
            <div className="mini-string-label">{label}</div>
            {displayFrets.map(fret => {
              const noteData = getNoteAt(index, fret);
              return (
                <div 
                  key={fret} 
                  className={`mini-fret ${noteData ? 'has-note' : ''}`}
                >
                  {noteData && (
                    <div className={`mini-note ${noteData.isRoot ? 'root' : ''}`}>
                      {noteData.interval}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TriadDiagram;

