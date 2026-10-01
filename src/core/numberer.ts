import { CrosswordLayout, GridCell, PlacedWord, WordPair } from '../types/crossword';

export function numberCrosswordGrid(
  rows: number,
  cols: number,
  placedWords: PlacedWord[],
  unplacedWords: WordPair[]
): CrosswordLayout {
  const grid: (GridCell | null)[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => null)
  );

  let filledCellCount = 0;

  for (const placed of placedWords) {
    const dRow = placed.direction === 'DOWN' ? 1 : 0;
    const dCol = placed.direction === 'ACROSS' ? 1 : 0;

    for (let i = 0; i < placed.answer.length; i++) {
      const r = placed.startRow + i * dRow;
      const c = placed.startCol + i * dCol;

      if (!grid[r][c]) {
        grid[r][c] = {
          row: r,
          col: c,
          letter: placed.answer[i],
        };
        filledCellCount++;
      }
    }
  }

  let currentNumber = 1;
  const acrossClues: PlacedWord[] = [];
  const downClues: PlacedWord[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (!cell) continue;

      const startingAcross = placedWords.find(
        (p) => p.direction === 'ACROSS' && p.startRow === r && p.startCol === c
      );
      const startingDown = placedWords.find(
        (p) => p.direction === 'DOWN' && p.startRow === r && p.startCol === c
      );

      if (startingAcross || startingDown) {
        cell.number = currentNumber;

        if (startingAcross) {
          startingAcross.number = currentNumber;
          cell.isStartOfAcross = true;
          acrossClues.push(startingAcross);
        }

        if (startingDown) {
          startingDown.number = currentNumber;
          cell.isStartOfDown = true;
          downClues.push(startingDown);
        }

        currentNumber++;
      }
    }
  }

  acrossClues.sort((a, b) => a.number - b.number);
  downClues.sort((a, b) => a.number - b.number);

  const density = rows * cols > 0 ? filledCellCount / (rows * cols) : 0;

  return {
    rows,
    cols,
    grid,
    placedWords,
    unplacedWords,
    acrossClues,
    downClues,
    density,
  };
}
