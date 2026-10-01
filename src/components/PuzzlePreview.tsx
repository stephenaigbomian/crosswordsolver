import React, { useEffect, useRef, useState } from 'react';
import { CrosswordLayout, PuzzleStyleOptions } from '../types/crossword';
import { renderGridToCanvas } from '../renderers/canvasRenderer';
import { LayoutGrid, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PuzzlePreviewProps {
  layout: CrosswordLayout | null;
  style: PuzzleStyleOptions;
  onToggleSolution: (show: boolean) => void;
  onRegenerate: () => void;
}

export const PuzzlePreview: React.FC<PuzzlePreviewProps> = ({
  layout,
  style,
  onToggleSolution,
  onRegenerate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom] = useState<number>(1);

  useEffect(() => {
    if (!layout || !containerRef.current) return;

    const canvas = renderGridToCanvas(layout, style, style.showSolution);

    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '6px';
    canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(canvas);
  }, [layout, style]);

  if (!layout) {
    return (
      <div className="section-card preview-empty">
        <LayoutGrid size={36} color="#94a3b8" />
        <p className="preview-empty-text">
          Upload a CSV or select a sample dataset above to generate a crossword puzzle.
        </p>
      </div>
    );
  }

  const placedCount = layout.placedWords.length;
  const totalCount = placedCount + layout.unplacedWords.length;
  const isAllPlaced = layout.unplacedWords.length === 0;

  return (
    <div className="section-card">
      <div className="section-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutGrid className="section-icon" size={18} />
          <h3 className="section-title">Puzzle Preview</h3>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
          onClick={() => onToggleSolution(!style.showSolution)}
        >
          {style.showSolution ? (
            <>
              <EyeOff size={14} />
              <span>Blank Puzzle</span>
            </>
          ) : (
            <>
              <Eye size={14} />
              <span>Show Answers</span>
            </>
          )}
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-pill">
          <span>Grid: </span>
          <strong>{layout.cols} × {layout.rows}</strong>
        </div>
        <div className={`stat-pill ${isAllPlaced ? 'stat-pill-success' : 'stat-pill-warning'}`}>
          {isAllPlaced ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          <span>
            {placedCount} / {totalCount} words placed
          </span>
        </div>
        <button
          type="button"
          className="btn-refresh"
          onClick={onRegenerate}
          title="Regenerate Layout"
        >
          <RefreshCw size={13} />
          <span>Shuffle Layout</span>
        </button>
      </div>

      {layout.unplacedWords.length > 0 && (
        <div className="alert alert-warning" style={{ margin: '10px 0' }}>
          <AlertCircle size={16} />
          <div>
            <strong>Unplaced Words ({layout.unplacedWords.length}):</strong>{' '}
            {layout.unplacedWords.map((u) => u.answer).join(', ')}.
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              Tip: Click "Shuffle Layout" or add more words with common letters to help them connect!
            </div>
          </div>
        </div>
      )}

      <div
        className="canvas-preview-container"
        ref={containerRef}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      />
    </div>
  );
};
