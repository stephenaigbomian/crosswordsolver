import React, { useState } from 'react';
import { WordPair } from '../types/crossword';
import { normalizeAnswer } from '../core/csvParser';
import { ListChecks, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

interface WordListEditorProps {
  pairs: WordPair[];
  onChange: (updatedPairs: WordPair[]) => void;
  onRegenerate: () => void;
}

export const WordListEditor: React.FC<WordListEditorProps> = ({
  pairs,
  onChange,
  onRegenerate,
}) => {
  const [newAnswer, setNewAnswer] = useState('');
  const [newClue, setNewClue] = useState('');

  const validCount = pairs.filter((p) => p.isValid !== false).length;

  const handleUpdate = (id: string, field: 'answer' | 'clue', val: string) => {
    const updated = pairs.map((p) => {
      if (p.id !== id) return p;
      const cleanAnswer = field === 'answer' ? normalizeAnswer(val) : p.answer;
      const clue = field === 'clue' ? val : p.clue;
      const isValid = cleanAnswer.length >= 2 && clue.trim().length > 0;
      return {
        ...p,
        answer: field === 'answer' ? cleanAnswer : p.answer,
        clue,
        isValid,
      };
    });
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    const filtered = pairs.filter((p) => p.id !== id);
    onChange(filtered);
  };

  const handleAdd = () => {
    const cleanAnswer = normalizeAnswer(newAnswer);
    if (!cleanAnswer || !newClue.trim()) return;

    const newPair: WordPair = {
      id: `pair-custom-${Date.now()}`,
      answer: cleanAnswer,
      clue: newClue.trim(),
      isValid: cleanAnswer.length >= 2,
    };

    onChange([...pairs, newPair]);
    setNewAnswer('');
    setNewClue('');
  };

  return (
    <div className="section-card">
      <div className="section-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListChecks className="section-icon" size={18} />
          <h3 className="section-title">Word & Clue List</h3>
        </div>
        <div className="badge-count">
          <CheckCircle size={14} color="#16a34a" />
          <span>{validCount} valid words</span>
        </div>
      </div>

      <div className="add-row-form">
        <input
          type="text"
          placeholder="New Answer (e.g. MOON)"
          value={newAnswer}
          className="input-text add-answer-input"
          onChange={(e) => setNewAnswer(e.target.value)}
        />
        <input
          type="text"
          placeholder="New Clue (e.g. Earth's natural satellite)"
          value={newClue}
          className="input-text add-clue-input"
          onChange={(e) => setNewClue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
        />
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={handleAdd}
          title="Add Word"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="word-table-wrapper">
        <table className="word-table">
          <thead>
            <tr>
              <th style={{ width: '32%' }}>Answer</th>
              <th style={{ width: '58%' }}>Clue</th>
              <th style={{ width: '10%' }}></th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p) => (
              <tr key={p.id} className={p.isValid === false ? 'row-invalid' : ''}>
                <td>
                  <input
                    type="text"
                    className="table-input answer-cell"
                    value={p.answer}
                    onChange={(e) => handleUpdate(p.id, 'answer', e.target.value)}
                  />
                  {p.error && (
                    <span className="cell-error">
                      <AlertTriangle size={12} /> {p.error}
                    </span>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    className="table-input"
                    value={p.clue}
                    onChange={(e) => handleUpdate(p.id, 'clue', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-trash"
                    onClick={() => handleDelete(p.id)}
                    title="Delete Word"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: '100%', marginTop: '10px' }}
        onClick={onRegenerate}
      >
        Update & Re-layout Grid
      </button>
    </div>
  );
};
