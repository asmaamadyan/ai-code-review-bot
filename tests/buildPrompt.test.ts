import { describe, expect, it } from 'vitest';

import { buildReviewPrompt } from '../src/buildPrompt';

describe('buildReviewPrompt', () => {
  it('asks Copilot to identify languages and apply repository standards', async () => {
    const result = await buildReviewPrompt(
      'diff --git a/src/App.tsx b/src/App.tsx\n+const value = 1;',
    );

    expect(result).toContain('Use the diff to identify each language');
    expect(result).toContain('Do not restrict this process');
    expect(result).toContain('src/App.tsx');
    expect(result).toContain('engineering_standards');
    expect(result).toContain('Search the supplied');
    expect(result).toContain('Review principles');
    expect(result).toContain('Standards for all languages');
    expect(result).not.toContain('Detected languages:');
  });

  it('rejects an empty diff', async () => {
    await expect(buildReviewPrompt('')).rejects.toThrow(
      'The pull-request diff is empty.',
    );
  });
});
