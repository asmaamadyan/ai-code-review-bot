import { describe, expect, it } from 'vitest';

import { detectLanguages, extractChangedFiles } from '../src/detectLanguages';

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

describe('detectLanguages', () => {
  it('detects all supported languages in a mixed PR', () => {
    const diff = `
diff --git a/src/App.tsx b/src/App.tsx
diff --git a/src/helpers.js b/src/helpers.js
diff --git a/server/report.py b/server/report.py
diff --git a/api/Controller.java b/api/Controller.java
diff --git a/services/PaymentService.cs b/services/PaymentService.cs
`;

    expect(detectLanguages(diff)).toEqual([
      'TypeScript',
      'JavaScript',
      'Python',
      'Java',
      'C#',
    ]);
  });

  it('returns each language only once', () => {
    const diff = `
diff --git a/src/App.ts b/src/App.ts
diff --git a/src/Button.tsx b/src/Button.tsx
`;

    expect(detectLanguages(diff)).toEqual(['TypeScript']);
  });

  it('ignores unsupported files', () => {
    const diff = `
diff --git a/README.md b/README.md
diff --git a/styles/main.css b/styles/main.css
`;

    expect(detectLanguages(diff)).toEqual([]);
  });
});
