import { describe, expect, it } from 'vitest';

import { extractChangedFiles } from '../src/detectLanguages';

describe('extractChangedFiles', () => {
  it('extracts changed file paths from a Git diff', () => {
    const diff = `
diff --git a/src/App.tsx b/src/App.tsx
diff --git a/server/report.py b/server/report.py
`;

    expect(extractChangedFiles(diff)).toEqual([
      'src/App.tsx',
      'server/report.py',
    ]);
  });

  it('does not return the same file more than once', () => {
    const diff = `
diff --git a/src/App.tsx b/src/App.tsx
diff --git a/src/App.tsx b/src/App.tsx
`;

    expect(extractChangedFiles(diff)).toEqual(['src/App.tsx']);
  });

  it('ignores content that is not a Git file header', () => {
    const diff = `
+ const value = 1
- const value = 2
`;

    expect(extractChangedFiles(diff)).toEqual([]);
  });
});
