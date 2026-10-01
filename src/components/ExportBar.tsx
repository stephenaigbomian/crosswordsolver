import React, { useState } from 'react';
import { CrosswordLayout, ExportType, PuzzleStyleOptions } from '../types/crossword';
import { exportToCanva } from '../renderers/canvaExporter';
import {
  Share2,
  FileCheck,
  Grid,
  CheckCircle,
  FileText,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportBarProps {
  layout: CrosswordLayout | null;
  style: PuzzleStyleOptions;
}

export const ExportBar: React.FC<ExportBarProps> = ({ layout, style }) => {
  const [loadingType, setLoadingType] = useState<ExportType | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleExport = async (type: ExportType) => {
    if (!layout) return;

    setLoadingType(type);
    setFeedback(null);

    const result = await exportToCanva(type, layout, style);
    setLoadingType(null);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // Confetti is decorative
      }
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  if (!layout) return null;

  return (
    <div className="section-card export-card">
      <div className="section-header">
        <Share2 className="section-icon" size={18} />
        <h3 className="section-title">Add to Canva Design</h3>
      </div>

      <p className="export-desc">
        Click to insert into your active Canva design or download high-resolution graphics.
      </p>

      <button
        type="button"
        className="btn btn-canva-primary"
        disabled={loadingType !== null}
        onClick={() => handleExport('worksheet')}
      >
        {loadingType === 'worksheet' ? (
          <Loader2 className="spinner" size={18} />
        ) : (
          <FileCheck size={18} />
        )}
        <span>Add Full Worksheet to Design</span>
      </button>

      <div className="export-btn-grid">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={loadingType !== null}
          onClick={() => handleExport('grid')}
        >
          {loadingType === 'grid' ? (
            <Loader2 className="spinner" size={14} />
          ) : (
            <Grid size={14} />
          )}
          <span>Add Grid Only</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={loadingType !== null}
          onClick={() => handleExport('solution')}
        >
          {loadingType === 'solution' ? (
            <Loader2 className="spinner" size={14} />
          ) : (
            <CheckCircle size={14} />
          )}
          <span>Add Solution Sheet</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={loadingType !== null}
          onClick={() => handleExport('clues_text')}
        >
          {loadingType === 'clues_text' ? (
            <Loader2 className="spinner" size={14} />
          ) : (
            <FileText size={14} />
          )}
          <span>Add Editable Clues Text</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={loadingType !== null}
          onClick={() => handleExport('grid')}
        >
          <Download size={14} />
          <span>Save PNG Asset</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ marginTop: '12px' }}
        >
          {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};
