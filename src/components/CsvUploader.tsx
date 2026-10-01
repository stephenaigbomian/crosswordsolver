import React, { useRef, useState } from 'react';
import { SAMPLE_DATASETS } from '../core/sampleData';
import { WordPair } from '../types/crossword';
import { parseCrosswordCsv } from '../core/csvParser';
import { Upload, FileText, Sparkles, AlertCircle } from 'lucide-react';

interface CsvUploaderProps {
  onParsed: (pairs: WordPair[], warnings: string[]) => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onParsed }) => {
  const [rawText, setRawText] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessText = (content: string) => {
    setErrorMessage(null);
    const result = parseCrosswordCsv(content);

    if (result.validCount === 0) {
      setErrorMessage(
        result.warnings[0] || 'Could not find valid answer/clue pairs. Check CSV format.'
      );
      return;
    }

    onParsed(result.pairs, result.warnings);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawText(content);
      handleProcessText(content);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (csv: string) => {
    setRawText(csv);
    handleProcessText(csv);
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <Upload className="section-icon" size={18} />
        <h3 className="section-title">Upload or Paste CSV</h3>
      </div>

      <div
        className={`drop-zone ${dragOver ? 'drop-zone-active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,.txt,.tsv"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        <FileText size={28} className="drop-icon" />
        <p className="drop-title">Drop your CSV file here, or click to browse</p>
        <span className="drop-hint">Format: Answer, Clue (one per line)</span>
      </div>

      <div className="sample-presets">
        <div className="sample-label">
          <Sparkles size={14} />
          <span>Try a 1-click sample:</span>
        </div>
        <div className="sample-chips">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="chip-btn"
              onClick={() => handleSelectSample(sample.csvContent)}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      <div className="paste-area-wrapper">
        <label className="input-label" htmlFor="csv-textarea">
          Or paste CSV / text:
        </label>
        <textarea
          id="csv-textarea"
          className="csv-textarea"
          rows={5}
          placeholder={"Answer, Clue\nPARIS, Capital of France\nTOKYO, Capital of Japan\nLONDON, Capital of the UK"}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '8px' }}
          onClick={() => handleProcessText(rawText)}
        >
          Parse & Generate Puzzle
        </button>
      </div>

      {errorMessage && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
