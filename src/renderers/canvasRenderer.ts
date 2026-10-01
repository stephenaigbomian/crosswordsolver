import { CrosswordLayout, PuzzleStyleOptions, PuzzleTheme, ThemeName } from '../types/crossword';

export const THEMES: Record<ThemeName, PuzzleTheme> = {
  classic: {
    name: 'classic',
    label: 'Classic Black & White',
    gridBorder: '#111827',
    cellFill: '#ffffff',
    cellEmptyBg: '#f3f4f6',
    textColor: '#111827',
    numberColor: '#374151',
    accentColor: '#1d4ed8',
    headerFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    cellFont: '"Roboto Mono", monospace, sans-serif',
  },
  modern: {
    name: 'modern',
    label: 'Modern Slate & Indigo',
    gridBorder: '#334155',
    cellFill: '#ffffff',
    cellEmptyBg: '#f8fafc',
    textColor: '#0f172a',
    numberColor: '#64748b',
    accentColor: '#4f46e5',
    headerFont: '"Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    cellFont: '"Inter", system-ui, sans-serif',
  },
  newspaper: {
    name: 'newspaper',
    label: 'Vintage Newsprint',
    gridBorder: '#27272a',
    cellFill: '#faf7f2',
    cellEmptyBg: '#ede8df',
    textColor: '#18181b',
    numberColor: '#52525b',
    accentColor: '#b91c1c',
    headerFont: '"Playfair Display", Georgia, serif',
    bodyFont: 'Georgia, serif',
    cellFont: 'Georgia, serif',
  },
  pastel: {
    name: 'pastel',
    label: 'Pastel Warmth',
    gridBorder: '#57534e',
    cellFill: '#ffffff',
    cellEmptyBg: '#f5f5f4',
    textColor: '#292524',
    numberColor: '#78716c',
    accentColor: '#ea580c',
    headerFont: '"Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    cellFont: '"Inter", system-ui, sans-serif',
  },
  dark: {
    name: 'dark',
    label: 'Midnight Dark',
    gridBorder: '#475569',
    cellFill: '#1e293b',
    cellEmptyBg: '#0f172a',
    textColor: '#f8fafc',
    numberColor: '#94a3b8',
    accentColor: '#38bdf8',
    headerFont: '"Inter", system-ui, sans-serif',
    bodyFont: '"Inter", system-ui, sans-serif',
    cellFont: '"Roboto Mono", monospace, sans-serif',
  },
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function renderGridToCanvas(
  layout: CrosswordLayout,
  style: PuzzleStyleOptions,
  showSolution: boolean = false
): HTMLCanvasElement {
  const theme = THEMES[style.theme] || THEMES.classic;
  const cellSize = style.cellSize || 36;
  const padding = 20;

  const width = layout.cols * cellSize + padding * 2;
  const height = layout.rows * cellSize + padding * 2;

  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(dpr, dpr);

  ctx.fillStyle = theme.name === 'dark' ? '#0f172a' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  drawGridCells(ctx, layout, theme, style, padding, padding, cellSize, showSolution);

  return canvas;
}

function drawGridCells(
  ctx: CanvasRenderingContext2D,
  layout: CrosswordLayout,
  theme: PuzzleTheme,
  style: PuzzleStyleOptions,
  startX: number,
  startY: number,
  cellSize: number,
  showSolution: boolean
) {
  const { rows, cols, grid } = layout;

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = style.gridBorderColor || theme.gridBorder;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const x = startX + c * cellSize;
      const y = startY + r * cellSize;

      if (cell) {
        ctx.fillStyle = style.cellFillColor || theme.cellFill;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeRect(x, y, cellSize, cellSize);

        if (cell.number) {
          ctx.fillStyle = theme.numberColor;
          ctx.font = `600 ${Math.max(9, Math.round(cellSize * 0.28))}px ${theme.bodyFont}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(String(cell.number), x + 2.5, y + 2.5);
        }

        if (showSolution && cell.letter) {
          ctx.fillStyle = theme.accentColor || theme.textColor;
          ctx.font = `700 ${Math.round(cellSize * 0.55)}px ${theme.cellFont}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.letter, x + cellSize / 2, y + cellSize / 2 + 1);
        }
      }
    }
  }
}

export function renderFullWorksheetToCanvas(
  layout: CrosswordLayout,
  style: PuzzleStyleOptions,
  showSolution: boolean = false
): HTMLCanvasElement {
  const theme = THEMES[style.theme] || THEMES.classic;

  const canvasWidth = style.sheetWidth || 1200;
  const canvasHeight = style.sheetHeight || 1600;

  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(dpr, dpr);

  ctx.fillStyle = theme.cellFill === '#1e293b' ? '#0f172a' : '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = theme.gridBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60);

  const margin = 60;
  let currentY = margin + 20;

  ctx.fillStyle = theme.textColor;
  ctx.font = `700 38px ${theme.headerFont}`;
  ctx.textAlign = 'center';
  ctx.fillText(style.title || 'CROSSWORD PUZZLE', canvasWidth / 2, currentY);
  currentY += 36;

  if (style.subtitle) {
    ctx.fillStyle = theme.numberColor;
    ctx.font = `400 16px ${theme.bodyFont}`;
    ctx.fillText(style.subtitle, canvasWidth / 2, currentY);
    currentY += 28;
  }

  currentY += 10;
  ctx.fillStyle = theme.numberColor;
  ctx.font = `500 15px ${theme.bodyFont}`;
  ctx.textAlign = 'left';
  ctx.fillText('Name: _______________________________', margin + 20, currentY);
  ctx.textAlign = 'right';
  ctx.fillText('Date: ________________', canvasWidth - margin - 20, currentY);
  currentY += 35;

  ctx.strokeStyle = theme.numberColor + '40';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, currentY);
  ctx.lineTo(canvasWidth - margin, currentY);
  ctx.stroke();
  currentY += 30;

  const maxGridWidth = canvasWidth - margin * 2 - 40;
  const maxGridHeight = 560;
  const cellSizeByWidth = Math.floor(maxGridWidth / layout.cols);
  const cellSizeByHeight = Math.floor(maxGridHeight / layout.rows);
  const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight, 40);

  const gridPixelWidth = layout.cols * cellSize;
  const gridPixelHeight = layout.rows * cellSize;
  const gridStartX = Math.round((canvasWidth - gridPixelWidth) / 2);
  const gridStartY = currentY;

  drawGridCells(
    ctx,
    layout,
    theme,
    style,
    gridStartX,
    gridStartY,
    cellSize,
    showSolution
  );

  currentY += gridPixelHeight + 40;

  const cluesStartY = currentY;
  const colWidth = (canvasWidth - margin * 2 - 40) / 2;
  const acrossColX = margin + 10;
  const downColX = margin + colWidth + 30;

  ctx.font = `700 20px ${theme.headerFont}`;
  ctx.fillStyle = theme.accentColor;
  ctx.textAlign = 'left';
  ctx.fillText('ACROSS', acrossColX, cluesStartY);
  ctx.fillText('DOWN', downColX, cluesStartY);

  ctx.font = `400 14px ${theme.bodyFont}`;
  let acrossY = cluesStartY + 26;
  const lineSpacing = 19;

  for (const placed of layout.acrossClues) {
    if (acrossY > canvasHeight - margin - 30) break;

    const prefix = `${placed.number}. `;
    ctx.font = `600 14px ${theme.bodyFont}`;
    ctx.fillStyle = theme.textColor;
    ctx.fillText(prefix, acrossColX, acrossY);

    const prefixWidth = ctx.measureText(prefix).width;
    const clueText = showSolution ? `${placed.clue} (${placed.answer})` : placed.clue;

    ctx.font = `400 14px ${theme.bodyFont}`;
    const wrapped = wrapText(ctx, clueText, colWidth - prefixWidth - 10);

    for (let i = 0; i < wrapped.length; i++) {
      ctx.fillText(wrapped[i], acrossColX + (i === 0 ? prefixWidth : prefixWidth + 4), acrossY);
      acrossY += lineSpacing;
    }
    acrossY += 4;
  }

  let downY = cluesStartY + 26;
  for (const placed of layout.downClues) {
    if (downY > canvasHeight - margin - 30) break;

    const prefix = `${placed.number}. `;
    ctx.font = `600 14px ${theme.bodyFont}`;
    ctx.fillStyle = theme.textColor;
    ctx.fillText(prefix, downColX, downY);

    const prefixWidth = ctx.measureText(prefix).width;
    const clueText = showSolution ? `${placed.clue} (${placed.answer})` : placed.clue;

    ctx.font = `400 14px ${theme.bodyFont}`;
    const wrapped = wrapText(ctx, clueText, colWidth - prefixWidth - 10);

    for (let i = 0; i < wrapped.length; i++) {
      ctx.fillText(wrapped[i], downColX + (i === 0 ? prefixWidth : prefixWidth + 4), downY);
      downY += lineSpacing;
    }
    downY += 4;
  }

  ctx.font = `400 12px ${theme.bodyFont}`;
  ctx.fillStyle = theme.numberColor + '99';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Created with Crossword Generator for Canva',
    canvasWidth / 2,
    canvasHeight - margin + 15
  );

  return canvas;
}
