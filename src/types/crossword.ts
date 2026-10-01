export interface WordPair {
  id: string;
  answer: string;
  clue: string;
  isValid?: boolean;
  error?: string;
}

export type Direction = 'ACROSS' | 'DOWN';

export interface PlacedWord {
  id: string;
  answer: string;
  clue: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  number: number;
}

export interface GridCell {
  row: number;
  col: number;
  letter: string;
  number?: number;
  isStartOfAcross?: boolean;
  isStartOfDown?: boolean;
}

export interface CrosswordLayout {
  rows: number;
  cols: number;
  grid: (GridCell | null)[][];
  placedWords: PlacedWord[];
  unplacedWords: WordPair[];
  acrossClues: PlacedWord[];
  downClues: PlacedWord[];
  density: number;
}

export type ThemeName = 'classic' | 'modern' | 'pastel' | 'dark' | 'newspaper';

export interface PuzzleTheme {
  name: ThemeName;
  label: string;
  gridBorder: string;
  cellFill: string;
  cellEmptyBg: string;
  textColor: string;
  numberColor: string;
  accentColor: string;
  headerFont: string;
  bodyFont: string;
  cellFont: string;
}

export interface PuzzleStyleOptions {
  title: string;
  subtitle: string;
  theme: ThemeName;
  cellSize: number;
  showSolution: boolean;
  fontFamily: string;
  headerFont: string;
  gridBorderColor: string;
  cellFillColor: string;
  textColor: string;
  accentColor: string;
  sheetWidth: number;
  sheetHeight: number;
}

export type ExportType = 'worksheet' | 'grid' | 'solution' | 'clues_text';

export interface ExportResult {
  success: boolean;
  message: string;
  dataUrl?: string;
  assetRef?: string;
}
