import { describe, it, expect } from 'vitest';
import { generateCrossword } from '../src/core/generator';
import { WordPair } from '../src/types/crossword';

describe('crossword generator', () => {
  const samplePairs: WordPair[] = [
    { id: '1', answer: 'CANVA', clue: 'Visual design platform', isValid: true },
    { id: '2', answer: 'APPLE', clue: 'Fruit or tech company', isValid: true },
    { id: '3', answer: 'NODE', clue: 'JavaScript runtime', isValid: true },
    { id: '4', answer: 'VITE', clue: 'Next generation frontend tooling', isValid: true },
  ];

  it('returns null for empty word list', () => {
    const layout = generateCrossword([]);
    expect(layout).toBeNull();
  });

  it('generates a valid interlocking crossword layout', () => {
    const layout = generateCrossword(samplePairs, { maxTrials: 50 });
    expect(layout).not.toBeNull();
    if (!layout) return;

    expect(layout.rows).toBeGreaterThan(0);
    expect(layout.cols).toBeGreaterThan(0);
    expect(layout.placedWords.length).toBeGreaterThanOrEqual(2);

    // Verify all placed words have correct letters in the grid
    for (const placed of layout.placedWords) {
      const dRow = placed.direction === 'DOWN' ? 1 : 0;
      const dCol = placed.direction === 'ACROSS' ? 1 : 0;

      for (let i = 0; i < placed.answer.length; i++) {
        const r = placed.startRow + i * dRow;
        const c = placed.startCol + i * dCol;
        const cell = layout.grid[r][c];

        expect(cell).not.toBeNull();
        expect(cell?.letter).toBe(placed.answer[i]);
      }
    }
  });

  it('ensures intersection cells have matching letters', () => {
    const layout = generateCrossword(samplePairs, { maxTrials: 50 });
    if (!layout) return;

    // Check every cell in the grid
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        const cell = layout.grid[r][c];
        if (!cell) continue;

        // Find all placed words covering this cell
        const coveringWords = layout.placedWords.filter((w) => {
          if (w.direction === 'ACROSS') {
            return w.startRow === r && c >= w.startCol && c < w.startCol + w.answer.length;
          } else {
            return w.startCol === c && r >= w.startRow && r < w.startRow + w.answer.length;
          }
        });

        // If cell is an intersection, both words must have the same letter at this position
        for (const word of coveringWords) {
          const letterIdx = word.direction === 'ACROSS' ? c - word.startCol : r - word.startRow;
          expect(word.answer[letterIdx]).toBe(cell.letter);
        }
      }
    }
  });
});
