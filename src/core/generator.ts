import { Direction, PlacedWord, WordPair } from '../types/crossword';
import { numberCrosswordGrid } from './numberer';

interface CandidatePlacement {
  row: number;
  col: number;
  direction: Direction;
  intersections: number;
  score: number;
}

interface InternalPlacement {
  wordPair: WordPair;
  direction: Direction;
  startRow: number;
  startCol: number;
}

/**
 * Checks if a word can legally be placed at (row, col) in direction on gridMap.
 */
function canPlaceWord(
  gridMap: Map<string, string>,
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): { valid: boolean; intersections: number } {
  const len = word.length;
  const dRow = direction === 'DOWN' ? 1 : 0;
  const dCol = direction === 'ACROSS' ? 1 : 0;

  // 1. Check cell immediately before word start
  const preRow = startRow - dRow;
  const preCol = startCol - dCol;
  if (gridMap.has(`${preRow},${preCol}`)) {
    return { valid: false, intersections: 0 };
  }

  // 2. Check cell immediately after word end
  const postRow = startRow + len * dRow;
  const postCol = startCol + len * dCol;
  if (gridMap.has(`${postRow},${postCol}`)) {
    return { valid: false, intersections: 0 };
  }

  let intersections = 0;

  // 3. Check each cell of the word
  for (let i = 0; i < len; i++) {
    const r = startRow + i * dRow;
    const c = startCol + i * dCol;
    const key = `${r},${c}`;
    const existing = gridMap.get(key);

    if (existing !== undefined) {
      // Overlapping cell: must be exact same character
      if (existing !== word[i]) {
        return { valid: false, intersections: 0 };
      }
      intersections++;
    } else {
      // Cell is currently empty. Check lateral parallel neighbors.
      if (direction === 'ACROSS') {
        if (gridMap.has(`${r - 1},${c}`) || gridMap.has(`${r + 1},${c}`)) {
          return { valid: false, intersections: 0 };
        }
      } else {
        if (gridMap.has(`${r},${c - 1}`) || gridMap.has(`${r},${c + 1}`)) {
          return { valid: false, intersections: 0 };
        }
      }
    }
  }

  return { valid: true, intersections };
}

/**
 * Evaluates candidate placement score.
 */
function scorePlacement(
  gridMap: Map<string, string>,
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
  intersections: number,
  currMinR: number,
  currMaxR: number,
  currMinC: number,
  currMaxC: number
): number {
  const dRow = direction === 'DOWN' ? 1 : 0;
  const dCol = direction === 'ACROSS' ? 1 : 0;
  const endRow = startRow + (word.length - 1) * dRow;
  const endCol = startCol + (word.length - 1) * dCol;

  const newMinR = Math.min(currMinR, startRow);
  const newMaxR = Math.max(currMaxR, endRow);
  const newMinC = Math.min(currMinC, startCol);
  const newMaxC = Math.max(currMaxC, endCol);

  const newWidth = newMaxC - newMinC + 1;
  const newHeight = newMaxR - newMinR + 1;
  const area = newWidth * newHeight;
  const aspectDiff = Math.abs(newWidth - newHeight);

  return intersections * 100 - area * 2 - aspectDiff * 8;
}

/**
 * Single trial attempt to generate a crossword layout
 */
function runGenerationTrial(
  words: WordPair[],
  shuffleFactor: number = 0
): {
  placements: InternalPlacement[];
  gridMap: Map<string, string>;
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
  unplaced: WordPair[];
} {
  const wordsToPlace = [...words];

  if (shuffleFactor > 0) {
    wordsToPlace.sort((a, b) => {
      const diff = b.answer.length - a.answer.length;
      return diff + (Math.random() - 0.5) * shuffleFactor;
    });
  } else {
    wordsToPlace.sort((a, b) => b.answer.length - a.answer.length);
  }

  const gridMap = new Map<string, string>();
  const placements: InternalPlacement[] = [];
  const unplaced: WordPair[] = [];

  if (wordsToPlace.length === 0) {
    return { placements, gridMap, minRow: 0, maxRow: 0, minCol: 0, maxCol: 0, unplaced };
  }

  // Place first (longest) word in horizontal direction at (0, 0)
  const first = wordsToPlace[0];
  for (let i = 0; i < first.answer.length; i++) {
    gridMap.set(`0,${i}`, first.answer[i]);
  }
  placements.push({
    wordPair: first,
    direction: 'ACROSS',
    startRow: 0,
    startCol: 0,
  });

  let minRow = 0;
  let maxRow = 0;
  let minCol = 0;
  let maxCol = first.answer.length - 1;

  // Place remaining words
  for (let w = 1; w < wordsToPlace.length; w++) {
    const pair = wordsToPlace[w];
    const word = pair.answer;
    let bestCandidate: CandidatePlacement | null = null;

    for (const [key, existingLetter] of gridMap.entries()) {
      const [rStr, cStr] = key.split(',');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);

      for (let idx = 0; idx < word.length; idx++) {
        if (word[idx] !== existingLetter) continue;

        const directions: Direction[] = ['ACROSS', 'DOWN'];
        for (const dir of directions) {
          const testStartRow = dir === 'DOWN' ? r - idx : r;
          const testStartCol = dir === 'ACROSS' ? c - idx : c;

          const check = canPlaceWord(gridMap, word, testStartRow, testStartCol, dir);
          if (check.valid && check.intersections > 0) {
            const score = scorePlacement(
              gridMap,
              word,
              testStartRow,
              testStartCol,
              dir,
              check.intersections,
              minRow,
              maxRow,
              minCol,
              maxCol
            );

            const finalScore = score + (shuffleFactor > 0 ? Math.random() * 5 : 0);

            if (!bestCandidate || finalScore > bestCandidate.score) {
              bestCandidate = {
                row: testStartRow,
                col: testStartCol,
                direction: dir,
                intersections: check.intersections,
                score: finalScore,
              };
            }
          }
        }
      }
    }

    if (bestCandidate) {
      const dRow = bestCandidate.direction === 'DOWN' ? 1 : 0;
      const dCol = bestCandidate.direction === 'ACROSS' ? 1 : 0;
      for (let i = 0; i < word.length; i++) {
        const curR = bestCandidate.row + i * dRow;
        const curC = bestCandidate.col + i * dCol;
        gridMap.set(`${curR},${curC}`, word[i]);
      }

      placements.push({
        wordPair: pair,
        direction: bestCandidate.direction,
        startRow: bestCandidate.row,
        startCol: bestCandidate.col,
      });

      const endR = bestCandidate.row + (word.length - 1) * dRow;
      const endC = bestCandidate.col + (word.length - 1) * dCol;
      minRow = Math.min(minRow, bestCandidate.row);
      maxRow = Math.max(maxRow, endR);
      minCol = Math.min(minCol, bestCandidate.col);
      maxCol = Math.max(maxCol, endC);
    } else {
      unplaced.push(pair);
    }
  }

  return { placements, gridMap, minRow, maxRow, minCol, maxCol, unplaced };
}

/**
 * Main crossword generation function with Monte Carlo multi-restart
 */
export function generateCrossword(
  wordPairs: WordPair[],
  options: { maxTrials?: number } = {}
) {
  const validPairs = wordPairs.filter((p) => p.isValid !== false && p.answer.length >= 2);

  if (validPairs.length === 0) {
    return null;
  }

  const maxTrials = options.maxTrials || 60;
  let bestResult: ReturnType<typeof runGenerationTrial> | null = null;
  let bestScore = -Infinity;

  for (let trial = 0; trial < maxTrials; trial++) {
    const shuffleFactor = trial === 0 ? 0 : 3.0;
    const result = runGenerationTrial(validPairs, shuffleFactor);

    const width = result.maxCol - result.minCol + 1;
    const height = result.maxRow - result.minRow + 1;
    const area = width * height;
    const aspectDiff = Math.abs(width - height);
    const placedRatio = result.placements.length / validPairs.length;

    const trialScore =
      result.placements.length * 1000 -
      area * 1.5 -
      aspectDiff * 5 +
      placedRatio * 500;

    if (trialScore > bestScore || !bestResult) {
      bestScore = trialScore;
      bestResult = result;
      if (result.unplaced.length === 0 && trial >= 25) {
        break;
      }
    }
  }

  if (!bestResult || bestResult.placements.length === 0) {
    return null;
  }

  const rOffset = -bestResult.minRow;
  const cOffset = -bestResult.minCol;
  const totalRows = bestResult.maxRow - bestResult.minRow + 1;
  const totalCols = bestResult.maxCol - bestResult.minCol + 1;

  const normalizedPlacements: PlacedWord[] = bestResult.placements.map((p) => ({
    id: p.wordPair.id,
    answer: p.wordPair.answer,
    clue: p.wordPair.clue,
    direction: p.direction,
    startRow: p.startRow + rOffset,
    startCol: p.startCol + cOffset,
    number: 0,
  }));

  return numberCrosswordGrid(
    totalRows,
    totalCols,
    normalizedPlacements,
    bestResult.unplaced
  );
}
