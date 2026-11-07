import { SCALE_NAMES } from '../utils/scales.js';
import './ScaleSelector.css';

const SCALE_GROUPS = [
  { title: 'Western', ids: ['major', 'minor', 'pentatonicMajor', 'pentatonicMinor'] },
  { title: 'Eastern', ids: ['ajam', 'hijaz', 'hijazkar', 'arabian', 'kurdi', 'nahawand', 'nikriz', 'neveser'] },
];

function ScaleSelector({ selectedScale, onScaleChange }) {
  return (
    <div className="scale-selector">
      <h3 className="selector-title">Scale</h3>
      {SCALE_GROUPS.map((group) => (
        <div key={group.title} className="scale-group">
          <span className="scale-group-title">{group.title}</span>
          <div className="scale-buttons">
            {group.ids.map((id) => (
              <button
                key={id}
                className={`scale-button ${selectedScale === id ? 'active' : ''}`}
                onClick={() => onScaleChange(id)}
              >
                {SCALE_NAMES[id]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScaleSelector;
