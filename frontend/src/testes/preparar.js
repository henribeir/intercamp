// ============================================================
// Roda antes de cada arquivo de teste do front-end.
// ============================================================
import '@testing-library/jest-dom/vitest'; // toBeInTheDocument(), toHaveTextContent()...
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup(); // desmonta o que o teste desenhou
  vi.restoreAllMocks(); // desfaz fetch falso e outros "dublês"
  localStorage.clear();
});
