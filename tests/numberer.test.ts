import { describe, it, expect } from 'vitest';
import { numberCrosswordGrid } from '../src/core/numberer';
import { PlacedWord } from '../src/types/crossword';

describe('crossword numberer', () => {
  it('correctly numbers words and handles shared origin cells', () => {
    const placedWords: PlacedWord[] = [
      { id: '1', answer: 'CAT', clue: 'Feline', direction: 'ACROSS', startRow: 0, startCol: 0, number: 0 },
      { id: '2', answer: 'COW', clue: 'Bovine', direction: 'DOWN', startRow: 0, startCol: 0, number: 0 },
      { id: '3', answer: 'TWO', clue: 'Number', direction: 'DOWN', startRow: 0, startCol: 2, number: 0 },
    ];

    const layout = numberCrosswordGrid(3, 3, placedWords, []);

    expect(layout.acrossClues[0].number).toBe(1);
    expect(layout.acrossClues[0].answer).toBe('CAT');

    expect(layout.downClues[0].number).toBe(1);
    expect(layout.downClues[0].answer).toBe('COW');

    expect(layout.downClues[1].number).toBe(2);
    expect(layout.downClues[1].answer).toBe('TWO');

    expect(layout.grid[0][0]?.number).toBe(1);
    expect(layout.grid[0][2]?.number).toBe(2);
  });
});
