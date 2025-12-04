import React, { useState, useMemo } from 'react';

// Types
type ColorName = 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet' | 'grey' | 'white' | 'gold' | 'silver';

type BandType = 'digit' | 'multiplier' | 'tolerance' | 'tempCoeff';

interface ColorDefinition {
  hex: string;
  digit: number | null;
  multiplier: number | null;
  tolerance: number | null;
  tempCoeff: number | null;
}

interface BandConfig {
  name: string;
  type: BandType;
  allowZero?: boolean;
}

interface FormattedResistance {
  value: string;
  unit: string;
}

type BandCount = 3 | 4 | 5 | 6;

// Constants
const COLORS: Record<ColorName, ColorDefinition> = {
  black:  { hex: '#1a1a1a', digit: 0, multiplier: 1,         tolerance: null,  tempCoeff: 250 },
  brown:  { hex: '#8B4513', digit: 1, multiplier: 10,        tolerance: 1,     tempCoeff: 100 },
  red:    { hex: '#DC2626', digit: 2, multiplier: 100,       tolerance: 2,     tempCoeff: 50 },
  orange: { hex: '#F97316', digit: 3, multiplier: 1000,      tolerance: null,  tempCoeff: 15 },
  yellow: { hex: '#FACC15', digit: 4, multiplier: 10000,     tolerance: null,  tempCoeff: 25 },
  green:  { hex: '#22C55E', digit: 5, multiplier: 100000,    tolerance: 0.5,   tempCoeff: 20 },
  blue:   { hex: '#3B82F6', digit: 6, multiplier: 1000000,   tolerance: 0.25,  tempCoeff: 10 },
  violet: { hex: '#8B5CF6', digit: 7, multiplier: 10000000,  tolerance: 0.1,   tempCoeff: 5 },
  grey:   { hex: '#6B7280', digit: 8, multiplier: 100000000, tolerance: 0.05,  tempCoeff: 1 },
  white:  { hex: '#F8FAFC', digit: 9, multiplier: 1000000000,tolerance: null,  tempCoeff: null },
  gold:   { hex: 'gold',    digit: null, multiplier: 0.1,    tolerance: 5,     tempCoeff: null },
  silver: { hex: 'silver',  digit: null, multiplier: 0.01,   tolerance: 10,    tempCoeff: null }
};

const BAND_CONFIGS: Record<BandCount, BandConfig[]> = {
  3: [
    { name: '1st Digit', type: 'digit', allowZero: false },
    { name: '2nd Digit', type: 'digit', allowZero: true },
    { name: 'Multiplier', type: 'multiplier' }
  ],
  4: [
    { name: '1st Digit', type: 'digit', allowZero: false },
    { name: '2nd Digit', type: 'digit', allowZero: true },
    { name: 'Multiplier', type: 'multiplier' },
    { name: 'Tolerance', type: 'tolerance' }
  ],
  5: [
    { name: '1st Digit', type: 'digit', allowZero: false },
    { name: '2nd Digit', type: 'digit', allowZero: true },
    { name: '3rd Digit', type: 'digit', allowZero: true },
    { name: 'Multiplier', type: 'multiplier' },
    { name: 'Tolerance', type: 'tolerance' }
  ],
  6: [
    { name: '1st Digit', type: 'digit', allowZero: false },
    { name: '2nd Digit', type: 'digit', allowZero: true },
    { name: '3rd Digit', type: 'digit', allowZero: true },
    { name: 'Multiplier', type: 'multiplier' },
    { name: 'Tolerance', type: 'tolerance' },
    { name: 'Temp. Coeff.', type: 'tempCoeff' }
  ]
};

const DEFAULT_SELECTIONS: Record<BandCount, ColorName[]> = {
  3: ['green', 'red', 'blue'],
  4: ['green', 'red', 'blue', 'gold'],
  5: ['green', 'red', 'black', 'orange', 'gold'],
  6: ['green', 'red', 'black', 'orange', 'gold', 'brown']
};

// Utility functions
const getValidColors = (bandConfig: BandConfig): ColorName[] => {
  const validColors: ColorName[] = [];
  
  (Object.entries(COLORS) as [ColorName, ColorDefinition][]).forEach(([name, color]) => {
    let isValid = false;
    
    switch (bandConfig.type) {
      case 'digit':
        if (color.digit !== null) {
          isValid = bandConfig.allowZero !== false || color.digit !== 0;
        }
        break;
      case 'multiplier':
        isValid = color.multiplier !== null;
        break;
      case 'tolerance':
        isValid = color.tolerance !== null;
        break;
      case 'tempCoeff':
        isValid = color.tempCoeff !== null;
        break;
    }
    
    if (isValid) {
      validColors.push(name);
    }
  });
  
  return validColors;
};

const formatResistance = (ohms: number): FormattedResistance => {
  if (ohms >= 1000000000) {
    return { value: (ohms / 1000000000).toFixed(2).replace(/\.?0+$/, ''), unit: 'GΩ' };
  } else if (ohms >= 1000000) {
    return { value: (ohms / 1000000).toFixed(2).replace(/\.?0+$/, ''), unit: 'MΩ' };
  } else if (ohms >= 1000) {
    return { value: (ohms / 1000).toFixed(2).replace(/\.?0+$/, ''), unit: 'kΩ' };
  } else if (ohms >= 1) {
    return { value: ohms.toFixed(2).replace(/\.?0+$/, ''), unit: 'Ω' };
  } else {
    return { value: (ohms * 1000).toFixed(2).replace(/\.?0+$/, ''), unit: 'mΩ' };
  }
};

// Components
interface ColorSwatchProps {
  colorName: ColorName;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ colorName, isSelected, isDisabled, onSelect }) => {
  const color = COLORS[colorName];
  const isMetallic = colorName === 'gold' || colorName === 'silver';
  
  return (
    <label className={`color-option ${isDisabled ? 'disabled' : ''}`}>
      <input
        type="radio"
        checked={isSelected}
        disabled={isDisabled}
        onChange={onSelect}
      />
      <div className={`color-swatch ${isSelected ? 'selected' : ''}`}>
        <div 
          className={`swatch-color ${isMetallic ? colorName : ''}`}
          style={!isMetallic ? { backgroundColor: color.hex } : undefined}
        />
        <span className="swatch-label">
          {colorName.charAt(0).toUpperCase() + colorName.slice(1, 3)}
        </span>
      </div>
    </label>
  );
};

interface BandRowProps {
  index: number;
  config: BandConfig;
  selectedColor: ColorName;
  onColorSelect: (color: ColorName) => void;
}

const BandRow: React.FC<BandRowProps> = ({ index, config, selectedColor, onColorSelect }) => {
  const validColors = useMemo(() => getValidColors(config), [config]);
  
  return (
    <div className="band-row">
      <div className="band-label">
        <span className="band-number">{index + 1}</span>
        {config.name}
      </div>
      <div className="color-options">
        {(Object.keys(COLORS) as ColorName[]).map((colorName) => (
          <ColorSwatch
            key={colorName}
            colorName={colorName}
            isSelected={selectedColor === colorName}
            isDisabled={!validColors.includes(colorName)}
            onSelect={() => onColorSelect(colorName)}
          />
        ))}
      </div>
    </div>
  );
};

interface ResistorVisualProps {
  colors: ColorName[];
}

const ResistorVisual: React.FC<ResistorVisualProps> = ({ colors }) => {
  return (
    <div className="resistor-visual">
      <div className="resistor">
        <div className="resistor-lead" />
        <div className="resistor-body">
          {colors.map((colorName, index) => {
            const color = COLORS[colorName];
            const isMetallic = colorName === 'gold' || colorName === 'silver';
            
            return (
              <div
                key={index}
                className={`band ${isMetallic ? colorName : ''}`}
                style={!isMetallic ? { backgroundColor: color.hex } : undefined}
              />
            );
          })}
        </div>
        <div className="resistor-lead" />
      </div>
    </div>
  );
};

interface ResultDisplayProps {
  resistance: number;
  tolerance: number;
  tempCoeff: number | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ resistance, tolerance, tempCoeff }) => {
  const formatted = formatResistance(resistance);
  const minVal = resistance * (1 - tolerance / 100);
  const maxVal = resistance * (1 + tolerance / 100);
  const minFormatted = formatResistance(minVal);
  const maxFormatted = formatResistance(maxVal);
  
  const rangeText = minFormatted.unit === maxFormatted.unit
    ? `${minFormatted.value} - ${maxFormatted.value}${maxFormatted.unit}`
    : `${minFormatted.value}${minFormatted.unit} - ${maxFormatted.value}${maxFormatted.unit}`;
  
  return (
    <div className="result-card">
      <div className="result-label">Resistance Value</div>
      <div className="result-value">
        <span>{formatted.value}</span>
        <span className="result-unit">{formatted.unit}</span>
      </div>
      <div className="result-tolerance">
        <div className="tolerance-item">
          <span className="tolerance-label">Tolerance</span>
          <span className="tolerance-value">±{tolerance}%</span>
        </div>
        {tempCoeff !== null && (
          <div className="tolerance-item">
            <span className="tolerance-label">Temp. Coeff.</span>
            <span className="tolerance-value">{tempCoeff} ppm/K</span>
          </div>
        )}
        <div className="tolerance-item">
          <span className="tolerance-label">Range</span>
          <span className="tolerance-value">{rangeText}</span>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ResistorCalculator: React.FC = () => {
  const [bandCount, setBandCount] = useState<BandCount>(4);
  const [selectedColors, setSelectedColors] = useState<ColorName[]>(DEFAULT_SELECTIONS[4]);

  const handleBandCountChange = (newCount: BandCount) => {
    setBandCount(newCount);
    setSelectedColors(DEFAULT_SELECTIONS[newCount]);
  };

  const handleColorSelect = (bandIndex: number, color: ColorName) => {
    setSelectedColors(prev => {
      const newColors = [...prev];
      newColors[bandIndex] = color;
      return newColors;
    });
  };

  const calculatedResult = useMemo(() => {
    const config = BAND_CONFIGS[bandCount];
    let significantDigits = '';
    let multiplier = 1;
    let tolerance = 20;
    let tempCoeff: number | null = null;

    config.forEach((band, index) => {
      const colorName = selectedColors[index];
      const color = COLORS[colorName];

      switch (band.type) {
        case 'digit':
          significantDigits += color.digit;
          break;
        case 'multiplier':
          multiplier = color.multiplier!;
          break;
        case 'tolerance':
          tolerance = color.tolerance!;
          break;
        case 'tempCoeff':
          tempCoeff = color.tempCoeff;
          break;
      }
    });

    const baseValue = parseInt(significantDigits, 10);
    const resistance = baseValue * multiplier;

    return { resistance, tolerance, tempCoeff };
  }, [bandCount, selectedColors]);

  const config = BAND_CONFIGS[bandCount];

  return (
    <div className="calculator-container">
      <style>{styles}</style>
      
      <header>
        <div className="logo">
          <div className="logo-icon">Ω</div>
          <h1>Resistor Calculator</h1>
        </div>
        <p className="subtitle">IEC 60062 Color Code Decoder</p>
      </header>

      <ResultDisplay
        resistance={calculatedResult.resistance}
        tolerance={calculatedResult.tolerance}
        tempCoeff={calculatedResult.tempCoeff}
      />

      <ResistorVisual colors={selectedColors} />

      <div className="section">
        <div className="section-header">
          <span className="section-title">Band Configuration</span>
          <span className="info-badge">IEC 60062</span>
        </div>
        <div className="select-wrapper">
          <select
            className="band-select"
            value={bandCount}
            onChange={(e) => handleBandCountChange(parseInt(e.target.value) as BandCount)}
          >
            <option value={3}>3 Band Resistor</option>
            <option value={4}>4 Band Resistor</option>
            <option value={5}>5 Band Resistor</option>
            <option value={6}>6 Band Resistor</option>
          </select>
        </div>
      </div>

      <div className="section">
        {config.map((bandConfig, index) => (
          <BandRow
            key={`${bandCount}-${index}`}
            index={index}
            config={bandConfig}
            selectedColor={selectedColors[index]}
            onColorSelect={(color) => handleColorSelect(index, color)}
          />
        ))}
      </div>

      <footer>
        <p>Built with precision for engineers & hobbyists</p>
      </footer>
    </div>
  );
};

// Styles
const styles = `
  :root {
    --bg-primary: #0a0c0f;
    --bg-secondary: #12151a;
    --bg-tertiary: #1a1e25;
    --bg-card: #181c23;
    --border-color: #2a3040;
    --border-active: #4a5568;
    --text-primary: #f0f4f8;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent-cyan: #06b6d4;
    --accent-amber: #f59e0b;
    --accent-green: #10b981;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .calculator-container {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
    line-height: 1.5;
    max-width: 480px;
    margin: 0 auto;
    padding: 16px;
    padding-bottom: 32px;
    position: relative;
  }

  .calculator-container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  header {
    text-align: center;
    padding: 24px 0 32px;
    position: relative;
    z-index: 1;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 18px;
    color: var(--bg-primary);
  }

  h1 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .result-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  .result-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green), var(--accent-amber));
  }

  .result-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .result-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--accent-cyan);
    text-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
    line-height: 1.2;
  }

  .result-unit {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-left: 4px;
  }

  .result-tolerance {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .tolerance-item {
    display: flex;
    flex-direction: column;
  }

  .tolerance-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  .tolerance-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    color: var(--accent-amber);
    font-weight: 600;
  }

  .resistor-visual {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px 16px;
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .resistor {
    position: relative;
    display: flex;
    align-items: center;
  }

  .resistor-lead {
    width: 40px;
    height: 4px;
    background: linear-gradient(to bottom, #9CA3AF, #6B7280, #9CA3AF);
    border-radius: 2px;
  }

  .resistor-body {
    position: relative;
    width: 160px;
    height: 56px;
    background: linear-gradient(to bottom, 
      #E8D4B8 0%, 
      #D4B896 15%, 
      #C4A87A 50%, 
      #B89860 85%, 
      #A88850 100%
    );
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 12px;
    box-shadow: 
      inset 0 -2px 4px rgba(0,0,0,0.2),
      inset 0 2px 4px rgba(255,255,255,0.2),
      0 4px 12px rgba(0,0,0,0.3);
  }

  .band {
    width: 12px;
    height: 100%;
    border-radius: 2px;
    transition: all 0.3s ease;
    box-shadow: 
      inset 0 0 4px rgba(0,0,0,0.3),
      0 0 2px rgba(0,0,0,0.2);
  }

  .band.gold {
    background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #C9A227 100%);
  }

  .band.silver {
    background: linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 50%, #9CA3AF 100%);
  }

  .section {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title::before {
    content: '';
    width: 4px;
    height: 16px;
    background: var(--accent-cyan);
    border-radius: 2px;
  }

  .info-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 4px;
    font-size: 0.7rem;
    color: var(--accent-cyan);
  }

  .select-wrapper {
    position: relative;
  }

  .band-select {
    width: 100%;
    padding: 14px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    font-weight: 500;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-primary);
    cursor: pointer;
    appearance: none;
    transition: all 0.2s ease;
  }

  .band-select:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
  }

  .select-wrapper::after {
    content: '▼';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.7rem;
    color: var(--text-muted);
    pointer-events: none;
  }

  .band-row {
    margin-bottom: 20px;
    animation: fadeIn 0.3s ease;
  }

  .band-row:last-child {
    margin-bottom: 0;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .band-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .band-number {
    width: 20px;
    height: 20px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--accent-cyan);
  }

  .color-options {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }

  .color-option {
    position: relative;
    cursor: pointer;
  }

  .color-option.disabled {
    cursor: not-allowed;
  }

  .color-option input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .color-swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    border-radius: 8px;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    background: var(--bg-tertiary);
  }

  .color-swatch:hover {
    background: var(--bg-secondary);
    transform: translateY(-2px);
  }

  .color-swatch.selected {
    border-color: var(--accent-cyan);
    background: rgba(6, 182, 212, 0.1);
    box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
  }

  .color-option.disabled .color-swatch {
    opacity: 0.3;
    pointer-events: none;
  }

  .swatch-color {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    box-shadow: 
      inset 0 1px 2px rgba(255,255,255,0.3),
      inset 0 -1px 2px rgba(0,0,0,0.3),
      0 2px 4px rgba(0,0,0,0.2);
  }

  .swatch-color.gold {
    background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #C9A227 100%);
  }

  .swatch-color.silver {
    background: linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 50%, #9CA3AF 100%);
  }

  .swatch-label {
    font-size: 0.6rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    text-align: center;
  }

  footer {
    text-align: center;
    padding: 24px 0;
    color: var(--text-muted);
    font-size: 0.75rem;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 360px) {
    .color-options {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;

export default ResistorCalculator;
