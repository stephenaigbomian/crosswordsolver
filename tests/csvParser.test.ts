import { describe, it, expect } from 'vitest';
import { parseCrosswordCsv, normalizeAnswer } from '../src/core/csvParser';

describe('csvParser', () => {
  it('normalizes answer correctly', () => {
    expect(normalizeAnswer('  paris  ')).toBe('PARIS');
    expect(normalizeAnswer('New-York')).toBe('NEWYORK');
    expect(normalizeAnswer('São Paulo')).toBe('SAOPAULO');
    expect(normalizeAnswer('café')).toBe('CAFE');
  });

  it('parses standard CSV with header', () => {
    const csv = `Answer, Clue
PARIS, Capital of France
LONDON, Capital of the UK
ROME, Capital of Italy`;

    const result = parseCrosswordCsv(csv);
    expect(result.validCount).toBe(3);
    expect(result.invalidCount).toBe(0);
    expect(result.pairs[0].answer).toBe('PARIS');
    expect(result.pairs[0].clue).toBe('Capital of France');
  });

  it('handles inverted header (Clue, Answer)', () => {
    const csv = `Clue, Answer
Capital of France, PARIS
Capital of the UK, LONDON`;

    const result = parseCrosswordCsv(csv);
    expect(result.validCount).toBe(2);
    expect(result.pairs[0].answer).toBe('PARIS');
    expect(result.pairs[0].clue).toBe('Capital of France');
  });

  it('handles quoted clues with commas', () => {
    const csv = `Answer, Clue
BERLIN, "Capital of Germany, famous for its historic gate"
TOKYO, "Capital of Japan, a bustling high-tech metropolis"`;

    const result = parseCrosswordCsv(csv);
    expect(result.validCount).toBe(2);
    expect(result.pairs[0].clue).toBe('Capital of Germany, famous for its historic gate');
  });

  it('rejects single-letter answers and empty clues', () => {
    const csv = `A, Single letter word
VALID, Valid clue
INVALID, `;

    const result = parseCrosswordCsv(csv);
    expect(result.validCount).toBe(1);
    expect(result.invalidCount).toBe(2);
    expect(result.pairs[0].isValid).toBe(false);
    expect(result.pairs[2].isValid).toBe(false);
  });

  it('flags duplicate answers', () => {
    const csv = `PARIS, Capital of France
PARIS, Another clue for same city`;

    const result = parseCrosswordCsv(csv);
    expect(result.validCount).toBe(1);
    expect(result.invalidCount).toBe(1);
    expect(result.pairs[1].isValid).toBe(false);
    expect(result.pairs[1].error).toContain('Duplicate');
  });
});
