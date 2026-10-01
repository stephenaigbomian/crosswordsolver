import Papa from 'papaparse';
import { WordPair } from '../types/crossword';

export interface ParseResult {
  pairs: WordPair[];
  validCount: number;
  invalidCount: number;
  warnings: string[];
}

/**
 * Normalizes an answer string:
 * - Removes accents / diacritics
 * - Removes spaces, hyphens, and non-alpha characters
 * - Converts to uppercase
 */
export function normalizeAnswer(rawAnswer: string): string {
  if (!rawAnswer) return '';
  return rawAnswer
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z]/g, '') // remove non-alpha characters
    .toUpperCase()
    .trim();
}

/**
 * Strips surrounding quotes if present
 */
function cleanClueText(raw: string): string {
  let clue = raw.trim();
  if (
    (clue.startsWith('"') && clue.endsWith('"')) ||
    (clue.startsWith("'") && clue.endsWith("'"))
  ) {
    clue = clue.slice(1, -1).trim();
  }
  return clue;
}

/**
 * Parses raw CSV/TSV text into validated WordPair items
 */
export function parseCrosswordCsv(csvContent: string): ParseResult {
  const warnings: string[] = [];
  const trimmed = csvContent.trim();

  if (!trimmed) {
    return { pairs: [], validCount: 0, invalidCount: 0, warnings: ['CSV content is empty.'] };
  }

  // Pre-process: fix spaces before quotes e.g. `, "` -> `,"` so PapaParse treats quotes correctly
  const sanitizedCsv = trimmed.replace(/,\s+"/g, ',"');

  const parsed = Papa.parse<string[]>(sanitizedCsv, {
    skipEmptyLines: 'greedy',
  });

  const rows = parsed.data;
  if (!rows || rows.length === 0) {
    return { pairs: [], validCount: 0, invalidCount: 0, warnings: ['No data rows found in CSV.'] };
  }

  // Detect header if first row contains common header keywords
  let answerColIndex = 0;
  let clueColIndex = 1;
  let startIndex = 0;

  const firstRow = rows[0].map((c) => String(c || '').trim().toLowerCase());
  const hasHeaderKeyword = firstRow.some((col) =>
    ['answer', 'clue', 'word', 'hint', 'question', 'definition'].includes(col)
  );

  if (hasHeaderKeyword) {
    startIndex = 1;
    // Determine column mapping
    const clueIndex = firstRow.findIndex((col) => ['clue', 'hint', 'question', 'definition'].includes(col));
    const wordIndex = firstRow.findIndex((col) => ['answer', 'word', 'solution'].includes(col));

    if (clueIndex !== -1 && wordIndex !== -1) {
      answerColIndex = wordIndex;
      clueColIndex = clueIndex;
    } else if (clueIndex === 0) {
      clueColIndex = 0;
      answerColIndex = 1;
    }
  }

  const seenAnswers = new Set<string>();
  const pairs: WordPair[] = [];

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawAnswer = row[answerColIndex] !== undefined ? String(row[answerColIndex]).trim() : '';
    const rawClue = row[clueColIndex] !== undefined ? cleanClueText(String(row[clueColIndex])) : '';

    const cleanAnswer = normalizeAnswer(rawAnswer);
    const id = `pair-${i}-${Math.random().toString(36).substring(2, 7)}`;

    let isValid = true;
    let error: string | undefined;

    if (!cleanAnswer) {
      isValid = false;
      error = 'Empty or invalid answer word.';
    } else if (cleanAnswer.length < 2) {
      isValid = false;
      error = `Answer "${cleanAnswer}" must be at least 2 letters long.`;
    } else if (cleanAnswer.length > 25) {
      isValid = false;
      error = `Answer "${cleanAnswer}" is too long (max 25 letters).`;
    } else if (!rawClue) {
      isValid = false;
      error = `Missing clue for "${cleanAnswer}".`;
    } else if (seenAnswers.has(cleanAnswer)) {
      isValid = false;
      error = `Duplicate answer "${cleanAnswer}".`;
    }

    if (isValid) {
      seenAnswers.add(cleanAnswer);
    }

    pairs.push({
      id,
      answer: cleanAnswer || rawAnswer,
      clue: rawClue,
      isValid,
      error,
    });
  }

  const validCount = pairs.filter((p) => p.isValid).length;
  const invalidCount = pairs.length - validCount;

  if (validCount === 0) {
    warnings.push('No valid answer/clue pairs found.');
  } else if (validCount < 3) {
    warnings.push('A crossword typically requires at least 3-4 words to form intersections.');
  }

  return {
    pairs,
    validCount,
    invalidCount,
    warnings,
  };
}

