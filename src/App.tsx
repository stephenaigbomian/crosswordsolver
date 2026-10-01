import React, { useState, useEffect, useCallback } from 'react';
import { CrosswordLayout, PuzzleStyleOptions, WordPair } from './types/crossword';
import { parseCrosswordCsv } from './core/csvParser';
import { generateCrossword } from './core/generator';
import { SAMPLE_DATASETS } from './core/sampleData';
import { CsvUploader } from './components/CsvUploader';
import { WordListEditor } from './components/WordListEditor';
import { PuzzlePreview } from './components/PuzzlePreview';
import { ClueListPreview } from './components/ClueListPreview';
import { StyleControls } from './components/StyleControls';
import { ExportBar } from './components/ExportBar';
import { Grid3X3, Sliders, FileSpreadsheet } from 'lucide-react';

export const App: React.FC = () => {
  const [style, setStyle] = useState<PuzzleStyleOptions>({
    title: "STEPHEN & NATASHA'S CROSSWORD",
    subtitle: 'How well do you know the couple?',
    theme: 'classic',
    cellSize: 34,
    showSolution: false,
    fontFamily: '"Inter", sans-serif',
    headerFont: '"Playfair Display", Georgia, serif',
    gridBorderColor: '#111827',
    cellFillColor: '#ffffff',
    textColor: '#111827',
    accentColor: '#1d4ed8',
    sheetWidth: 1200,
    sheetHeight: 1600,
  });

  const [wordPairs, setWordPairs] = useState<WordPair[]>(() => {
    const parsed = parseCrosswordCsv(SAMPLE_DATASETS[0].csvContent);
    return parsed.pairs;
  });

  const [layout, setLayout] = useState<CrosswordLayout | null>(null);
  const [activeTab, setActiveTab] = useState<'puzzle' | 'words' | 'design'>('puzzle');

  const handleGenerate = useCallback(() => {
    const validPairs = wordPairs.filter((p) => p.isValid !== false && p.answer.length >= 2);
    if (validPairs.length === 0) {
      setLayout(null);
      return;
    }

    const newLayout = generateCrossword(validPairs, { maxTrials: 80 });
    setLayout(newLayout);
  }, [wordPairs]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCsvParsed = (pairs: WordPair[]) => {
    setWordPairs(pairs);
    setActiveTab('puzzle');
  };

  const handleUpdateStyle = (updated: Partial<PuzzleStyleOptions>) => {
    setStyle((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo">
          <Grid3X3 size={24} />
        </div>
        <div className="app-titles">
          <h1 className="app-main-title">Crossword Puzzle Maker</h1>
          <span className="app-subtitle">Build custom puzzles from CSV answer & clue pairs</span>
        </div>
      </header>

      <CsvUploader onParsed={handleCsvParsed} />

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'puzzle' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '7px 4px', fontSize: '12px' }}
          onClick={() => setActiveTab('puzzle')}
        >
          <Grid3X3 size={14} />
          <span>Preview & Export</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'words' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '7px 4px', fontSize: '12px' }}
          onClick={() => setActiveTab('words')}
        >
          <FileSpreadsheet size={14} />
          <span>Words ({wordPairs.length})</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'design' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '7px 4px', fontSize: '12px' }}
          onClick={() => setActiveTab('design')}
        >
          <Sliders size={14} />
          <span>Style & Theme</span>
        </button>
      </div>

      {activeTab === 'puzzle' && (
        <>
          <ExportBar layout={layout} style={style} />

          <PuzzlePreview
            layout={layout}
            style={style}
            onToggleSolution={(show) => handleUpdateStyle({ showSolution: show })}
            onRegenerate={handleGenerate}
          />

          <ClueListPreview layout={layout} showSolution={style.showSolution} />
        </>
      )}

      {activeTab === 'words' && (
        <WordListEditor
          pairs={wordPairs}
          onChange={setWordPairs}
          onRegenerate={handleGenerate}
        />
      )}

      {activeTab === 'design' && (
        <StyleControls style={style} onChange={handleUpdateStyle} />
      )}
    </div>
  );
};
