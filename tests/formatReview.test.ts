import { describe, expect, it } from 'vitest';

import { formatReviewComment } from '../src/formatReview';
import type { CodeReview } from '../src/reviewSchema';

describe('formatReviewComment', () => {
  it('formats review findings as Markdown', () => {
    const review: CodeReview = {
      summary: 'One performance concern was found.',
      riskLevel: 'medium',
      findings: [
        {
          severity: 'medium',
          category: 'performance',
          language: 'TypeScript',
          file: 'src/App.tsx',
          line: 12,
          title: 'Repeated calculation',
          explanation: 'The calculation runs during every render.',
          suggestedFix: 'Memoize it when its dependencies are stable.',
          confidence: 0.92,
        },
      ],
      positives: ['The component naming is clear.'],
    };

    const result = formatReviewComment(review, 'request-123');

    expect(result).toContain('<!-- ai-code-review-bot -->');
    expect(result).toContain('MEDIUM — Repeated calculation');
    expect(result).toContain('`src/App.tsx:12`');
    expect(result).toContain('92%');
    expect(result).toContain('request-123');
  });

  it('handles reviews without findings', () => {
    const review: CodeReview = {
      summary: 'No meaningful problems were found.',
      riskLevel: 'low',
      findings: [],
      positives: ['The implementation is easy to understand.'],
    };

    const result = formatReviewComment(review, 'request-456');

    expect(result).toContain('No meaningful issues were found');
    expect(result).toContain('The implementation is easy to understand.');
  });

  it('escapes backticks from AI-generated content', () => {
    const review: CodeReview = {
      summary: 'Check the `value` variable.',
      riskLevel: 'low',
      findings: [],
      positives: [],
    };

    const result = formatReviewComment(review, 'request-789');

    expect(result).toContain('Check the \\`value\\` variable.');
  });
});
