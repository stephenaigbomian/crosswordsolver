import React from 'react';
import { CrosswordLayout } from '../types/crossword';
import { AlignLeft } from 'lucide-react';

interface ClueListPreviewProps {
  layout: CrosswordLayout | null;
  showSolution: boolean;
}

export const ClueListPreview: React.FC<ClueListPreviewProps> = ({
  layout,
  showSolution,
}) => {
  if (!layout) return null;

  return (
    <div className="section-card">
      <div className="section-header">
        <AlignLeft className="section-icon" size={18} />
        <h3 className="section-title">Clues Summary</h3>
      </div>

      <div className="clues-grid">
        <div className="clue-column">
          <h4 className="clue-column-title">Across ({layout.acrossClues.length})</h4>
          <ul className="clue-list">
            {layout.acrossClues.map((clue) => (
              <li key={`across-${clue.number}-${clue.id}`} className="clue-item">
                <span className="clue-num">{clue.number}.</span>
                <span className="clue-text">{clue.clue}</span>
                {showSolution && (
                  <span className="clue-answer-badge">{clue.answer}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="clue-column">
          <h4 className="clue-column-title">Down ({layout.downClues.length})</h4>
          <ul className="clue-list">
            {layout.downClues.map((clue) => (
              <li key={`down-${clue.number}-${clue.id}`} className="clue-item">
                <span className="clue-num">{clue.number}.</span>
                <span className="clue-text">{clue.clue}</span>
                {showSolution && (
                  <span className="clue-answer-badge">{clue.answer}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
