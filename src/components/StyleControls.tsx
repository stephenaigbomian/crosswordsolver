import React from 'react';
import { PuzzleStyleOptions, ThemeName } from '../types/crossword';
import { THEMES } from '../renderers/canvasRenderer';
import { Palette, Type } from 'lucide-react';

interface StyleControlsProps {
  style: PuzzleStyleOptions;
  onChange: (updated: Partial<PuzzleStyleOptions>) => void;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
  style,
  onChange,
}) => {
  const themeList = Object.values(THEMES);

  return (
    <div className="section-card">
      <div className="section-header">
        <Palette className="section-icon" size={18} />
        <h3 className="section-title">Design & Styling</h3>
      </div>

      <div className="form-group">
        <label className="input-label" htmlFor="puzzle-title">
          <Type size={14} /> Worksheet Title
        </label>
        <input
          id="puzzle-title"
          type="text"
          className="input-text"
          value={style.title}
          placeholder="CROSSWORD PUZZLE"
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="input-label" htmlFor="puzzle-subtitle">
          Subtitle / Instructions
        </label>
        <input
          id="puzzle-subtitle"
          type="text"
          className="input-text"
          value={style.subtitle}
          placeholder="Solve the clues to complete the crossword"
          onChange={(e) => onChange({ subtitle: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="input-label">Theme Preset</label>
        <div className="theme-grid">
          {themeList.map((t) => {
            const isSelected = style.theme === t.name;
            return (
              <button
                key={t.name}
                type="button"
                className={`theme-card ${isSelected ? 'theme-card-active' : ''}`}
                onClick={() => onChange({ theme: t.name as ThemeName })}
              >
                <div
                  className="theme-swatch"
                  style={{
                    backgroundColor: t.cellEmptyBg,
                    borderColor: t.gridBorder,
                  }}
                >
                  <div
                    className="theme-mini-cell"
                    style={{
                      backgroundColor: t.cellFill,
                      borderColor: t.gridBorder,
                      color: t.accentColor,
                    }}
                  >
                    A
                  </div>
                </div>
                <span className="theme-name">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label className="input-label" htmlFor="cell-size-slider">
            Grid Cell Size
          </label>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            {style.cellSize}px
          </span>
        </div>
        <input
          id="cell-size-slider"
          type="range"
          min={24}
          max={48}
          step={2}
          value={style.cellSize}
          className="slider"
          onChange={(e) => onChange({ cellSize: parseInt(e.target.value, 10) })}
        />
      </div>
    </div>
  );
};
