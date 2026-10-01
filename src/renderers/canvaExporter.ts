import { CrosswordLayout, ExportResult, ExportType, PuzzleStyleOptions } from '../types/crossword';
import { renderFullWorksheetToCanvas, renderGridToCanvas } from './canvasRenderer';

/**
 * Checks if the current environment is running inside Canva's editor iframe
 */
export function isRunningInCanva(): boolean {
  try {
    const hasCanvaParent = typeof window !== 'undefined' && window.parent !== window;
    const hasRealCanvaHost = Boolean(
      (window as unknown as Record<string, unknown>)?.['__canva__'] ||
      (window.location && window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0)
    );
    return hasCanvaParent && hasRealCanvaHost;
  } catch {
    return false;
  }
}

function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}

export function buildClueText(layout: CrosswordLayout, includeAnswers: boolean = false): string {
  let output = '=== ACROSS ===\n';
  for (const placed of layout.acrossClues) {
    output += `${placed.number}. ${placed.clue}${includeAnswers ? ` [${placed.answer}]` : ''}\n`;
  }

  output += '\n=== DOWN ===\n';
  for (const placed of layout.downClues) {
    output += `${placed.number}. ${placed.clue}${includeAnswers ? ` [${placed.answer}]` : ''}\n`;
  }

  return output;
}

export async function exportToCanva(
  type: ExportType,
  layout: CrosswordLayout,
  style: PuzzleStyleOptions
): Promise<ExportResult> {
  try {
    const inCanva = isRunningInCanva();

    // 1. Text clues export
    if (type === 'clues_text') {
      const clueString = buildClueText(layout, style.showSolution);

      if (inCanva) {
        try {
          const { addElementAtPoint, addElementAtCursor } = await import('@canva/design');
          if (typeof addElementAtPoint === 'function') {
            await addElementAtPoint({
              type: 'text',
              children: [clueString],
              width: 400,
              height: 600,
              top: 100,
              left: 100,
            });
            return { success: true, message: 'Clues added to Canva design as editable text!' };
          } else if (typeof addElementAtCursor === 'function') {
            await addElementAtCursor({
              type: 'text',
              children: [clueString],
            });
            return { success: true, message: 'Clues added to Canva document at cursor!' };
          }
        } catch (canvaErr) {
          console.warn('Canva text insertion failed, falling back to clipboard:', canvaErr);
        }
      }

      await copyToClipboard(clueString);
      return {
        success: true,
        message: 'Clues copied to clipboard! (Paste anywhere in your design)',
      };
    }

    // 2. Render targeted canvas
    let canvas: HTMLCanvasElement;
    let filename: string;

    if (type === 'worksheet') {
      canvas = renderFullWorksheetToCanvas(layout, style, false);
      filename = `${style.title || 'crossword'}-worksheet.png`;
    } else if (type === 'solution') {
      canvas = renderFullWorksheetToCanvas(layout, style, true);
      filename = `${style.title || 'crossword'}-solution.png`;
    } else {
      canvas = renderGridToCanvas(layout, style, style.showSolution);
      filename = `${style.title || 'crossword'}-grid.png`;
    }

    const dataUrl = canvas.toDataURL('image/png');

    // 3. Insert into Canva if running in Canva
    if (inCanva) {
      try {
        const { upload } = await import('@canva/asset');
        const { addElementAtPoint, addElementAtCursor } = await import('@canva/design');

        const asset = await upload({
          type: 'image',
          mimeType: 'image/png',
          url: dataUrl,
          thumbnailUrl: dataUrl,
          aiDisclosure: 'none',
        });

        if (asset?.ref) {
          const imageElement = {
            type: 'image' as const,
            ref: asset.ref,
          };

          try {
            if (typeof addElementAtPoint === 'function') {
              await addElementAtPoint({
                ...imageElement,
                width: Math.min(canvas.width / 2, 800),
                height: Math.min(canvas.height / 2, 1000),
                top: 50,
                left: 50,
              });
              return {
                success: true,
                message: 'Crossword successfully added to your Canva design!',
                dataUrl,
                assetRef: asset.ref,
              };
            }
          } catch {
            if (typeof addElementAtCursor === 'function') {
              await addElementAtCursor(imageElement);
              return {
                success: true,
                message: 'Crossword added to Canva at cursor position!',
                dataUrl,
                assetRef: asset.ref,
              };
            }
          }
        }
      } catch (canvaErr) {
        console.warn('Canva SDK upload/insert failed, falling back to download:', canvaErr);
      }
    }

    // 4. Standalone browser fallback: download the PNG directly
    downloadCanvasAsPng(canvas, filename);
    return {
      success: true,
      message: `Downloaded high-resolution ${filename} (Browser Mode)!`,
      dataUrl,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Export failed: ${errorMsg}`,
    };
  }
}
