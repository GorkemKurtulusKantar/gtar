import { HEXATONIC_PATTERNS, SCALE_NAMES, MAJOR_TO_MINOR_DEGREE, MINOR_DEGREE_LABELS } from '../utils/scales.js';
import './HexatonicPatternSelector.css';

function HexatonicPatternSelector({ scaleType, selectedPattern, onPatternChange, visible = true }) {
  // Major veya Minor seçildiğinde göster
  // Layout shift'i önlemek için null döndürmek yerine visibility: hidden kullanıyoruz
  const isScaleValid = scaleType === 'major' || scaleType === 'minor';
  const isVisible = isScaleValid && visible;

  const patterns = [1, 2, 3, 4, 5];
  const patternType = 'hexatonicMajor';
  const isMinorMode = scaleType === 'minor';

  // Minor mode'da omitted degree'yi minor degree'ye çevir
  const getOmittedLabel = (majorOmitted) => {
    if (!isMinorMode) return majorOmitted;
    const minorInfo = MAJOR_TO_MINOR_DEGREE[majorOmitted];
    return MINOR_DEGREE_LABELS[minorInfo.deg] || minorInfo.deg;
  };

  return (
    <div
      className="hexatonic-pattern-selector"
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      <h3 className="selector-title">Hexatonic Pattern</h3>
      <div className="pattern-buttons">
        {patterns.map((patternNum) => {
          const patternId = `${patternType}${patternNum}`;
          const pattern = HEXATONIC_PATTERNS[patternId];
          const majorOmitted = pattern ? pattern.omittedDegree : patternNum;
          const omittedLabel = getOmittedLabel(majorOmitted);

          return (
            <button
              key={patternNum}
              className={`pattern-button ${selectedPattern === patternId ? 'active' : ''}`}
              onClick={() => onPatternChange(patternId)}
              title={`${SCALE_NAMES[patternId]}${isMinorMode ? ' (Minor mode)' : ''}`}
            >
              <span className="pattern-num">{patternNum}</span>
              <span className="pattern-omit">-{omittedLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HexatonicPatternSelector;

