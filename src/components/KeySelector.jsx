import { NOTES } from '../utils/notes.js';
import './KeySelector.css';

function KeySelector({ selectedKey, onKeyChange }) {
  return (
    <div className="key-selector">
      <h3 className="selector-title">Root Note</h3>
      <div className="key-buttons">
        {NOTES.map((note) => (
          <button
            key={note}
            className={`key-button ${selectedKey === note ? 'active' : ''}`}
            onClick={() => onKeyChange(note)}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}

export default KeySelector;

