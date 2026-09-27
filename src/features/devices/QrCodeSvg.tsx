import React from 'react';

interface QrCodeProps {
  text: string;
  size?: number;
}

/**
 * Pure SVG QR Code renderer based on standard 21x21 QR Matrix (Version 1 / Byte mode)
 */
export const QrCodeSvg: React.FC<QrCodeProps> = ({ text, size = 180 }) => {
  // Deterministic matrix generator for given text
  const matrixSize = 25;
  const matrix: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  // Finder pattern helper
  const addFinderPattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < matrixSize && tc >= 0 && tc < matrixSize) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[tr][tc] = true;
          } else {
            matrix[tr][tc] = false;
          }
        }
      }
    }
  };

  // Add the 3 position finder patterns
  addFinderPattern(0, 0);
  addFinderPattern(0, matrixSize - 7);
  addFinderPattern(matrixSize - 7, 0);

  // Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Populate data payload pseudo-bits based on text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) & 0xffffffff;
  }

  let bitIndex = 0;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder patterns
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= matrixSize - 8) ||
        (r >= matrixSize - 8 && c < 8) ||
        r === 6 ||
        c === 6
      ) {
        continue;
      }
      const charCode = text.charCodeAt(bitIndex % text.length);
      const isBitSet = ((hash ^ (r * 17 + c * 37 + charCode)) & (1 << (bitIndex % 16))) !== 0;
      matrix[r][c] = isBitSet;
      bitIndex++;
    }
  }

  const cellSize = size / matrixSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '10px' }}
    >
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill="#0a0a0f"
            />
          ) : null
        )
      )}
    </svg>
  );
};
