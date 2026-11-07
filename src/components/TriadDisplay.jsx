import { useState } from 'react';
import { getDiatonicTriads, getTriadPositions, TRIAD_NAMES, TRIAD_INTERVAL_LABELS } from '../utils/triads.js';
import TriadDiagram from './TriadDiagram.jsx';
import './TriadDisplay.css';

function TriadDisplay({ keyRoot, scaleType }) {
  const [selectedDegree, setSelectedDegree] = useState(0); // 0 = show all, 1-7 = specific degree
  
  const triads = getDiatonicTriads(keyRoot, scaleType);
  
  // Filter triads based on selection
  const displayTriads = selectedDegree === 0 
    ? triads 
    : triads.filter(t => t.degree === selectedDegree);
  
  return (
    <div className="triad-display">
      <div className="triad-header">
        <h2 className="triad-title">
          {keyRoot} {scaleType === 'minor' ? 'Minor' : 'Major'} Diatonic Triads
        </h2>
        <p className="triad-subtitle">G-B-E String Set (3 positions per chord)</p>
      </div>
      
      {/* Degree selector */}
      <div className="degree-selector">
        <button 
          className={`degree-btn ${selectedDegree === 0 ? 'active' : ''}`}
          onClick={() => setSelectedDegree(0)}
        >
          All
        </button>
        {triads.map(triad => (
          <button
            key={triad.degree}
            className={`degree-btn ${selectedDegree === triad.degree ? 'active' : ''} ${triad.quality}`}
            onClick={() => setSelectedDegree(triad.degree)}
            title={triad.fullName}
          >
            {triad.romanNumeral}
          </button>
        ))}
      </div>
      
      {/* Triad cards */}
      <div className="triads-grid">
        {displayTriads.map(triad => (
          <TriadCard 
            key={triad.degree} 
            triad={triad} 
          />
        ))}
      </div>
    </div>
  );
}

// Individual triad card showing chord info and all positions
function TriadCard({ triad }) {
  const { degree, romanNumeral, root, quality, notes, name, fullName } = triad;
  const positions = getTriadPositions(root, quality, 0, 15);
  
  // Get first 3 positions (one for each shape type ideally)
  const displayPositions = positions.slice(0, 6);
  
  // Group by shape type
  const groupedPositions = {
    rootOnG: displayPositions.filter(p => p.shapeName === 'rootOnG').slice(0, 1),
    rootOnB: displayPositions.filter(p => p.shapeName === 'rootOnB').slice(0, 1),
    rootOnE: displayPositions.filter(p => p.shapeName === 'rootOnE').slice(0, 1),
  };
  
  const shapePositions = [
    ...groupedPositions.rootOnG,
    ...groupedPositions.rootOnB,
    ...groupedPositions.rootOnE,
  ];
  
  return (
    <div className={`triad-card ${quality}`}>
      <div className="triad-card-header">
        <div className="chord-info">
          <span className="roman-numeral">{romanNumeral}</span>
          <span className="chord-name">{name}</span>
        </div>
        <div className="chord-meta">
          <span className={`quality-badge ${quality}`}>{TRIAD_NAMES[quality]}</span>
        </div>
      </div>
      
      <div className="chord-notes">
        <span className="notes-label">Notes:</span>
        <span className="notes-list">{notes.join(' - ')}</span>
      </div>
      
      <div className="chord-intervals">
        <span className="intervals-label">Intervals:</span>
        <span className="intervals-list">{TRIAD_INTERVAL_LABELS[quality].join(' - ')}</span>
      </div>
      
      <div className="triad-positions">
        {shapePositions.length > 0 ? (
          shapePositions.map((pos, idx) => (
            <TriadDiagram
              key={`${pos.shapeName}-${pos.rootFret}`}
              triadPosition={pos}
              triadName={name}
              quality={quality}
            />
          ))
        ) : (
          <p className="no-positions">No positions in fret range 0-15</p>
        )}
      </div>
    </div>
  );
}

export default TriadDisplay;

