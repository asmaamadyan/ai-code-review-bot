import { describe, expect, it } from 'vitest';

import { buildReviewPrompt } from '../src/buildPrompt';

describe('buildReviewPrompt', () => {
  it('asks Copilot to identify languages without predefined standards', async () => {
    const result = await buildReviewPrompt(
      'diff --git a/src/App.tsx b/src/App.tsx\n+const value = 1;',
    );

    expect(result).toContain('Identify the programming language');
    expect(result).toContain('Do not restrict language detection');
    expect(result).toContain('src/App.tsx');
    expect(result).not.toContain('engineering_standards');
    expect(result).not.toContain('Detected languages:');
  });

  it('rejects an empty diff', async () => {
    await expect(buildReviewPrompt('')).rejects.toThrow(
      'The pull-request diff is empty.',
    );
  });
});
