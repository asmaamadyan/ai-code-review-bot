import { describe, expect, it } from 'vitest';

import { parseReviewResponse } from '../src/reviewSchema';

const validReview = {
  summary: 'The pull request contains one performance issue.',
  riskLevel: 'medium',
  findings: [
    {
      severity: 'medium',
      category: 'performance',
      language: 'TypeScript',
      file: 'src/App.tsx',
      line: 12,
      title: 'Expensive calculation during render',
      explanation: 'The calculation runs whenever the component renders.',
      suggestedFix: 'Memoize the calculation when its dependencies are stable.',
      confidence: 0.9,
    },
  ],
  positives: ['The component has clear naming.'],
};

describe('parseReviewResponse', () => {
  it('accepts a valid review', () => {
    expect(parseReviewResponse(JSON.stringify(validReview))).toEqual(
      validReview,
    );
  });

  it('accepts JSON surrounded by Markdown fences', () => {
    const response = `\`\`\`json
${JSON.stringify(validReview)}
\`\`\``;

    expect(parseReviewResponse(response)).toEqual(validReview);
  });

  it('rejects an empty response', () => {
    expect(() => parseReviewResponse('')).toThrow(
      'Copilot returned an empty response.',
    );
  });

  it('rejects invalid JSON', () => {
    expect(() => parseReviewResponse('not JSON')).toThrow(
      'Copilot returned invalid JSON.',
    );
  });

  it('rejects an unsupported severity', () => {
    const invalidReview = {
      ...validReview,
      riskLevel: 'dangerous',
    };

    expect(() => parseReviewResponse(JSON.stringify(invalidReview))).toThrow(
      'invalid review structure',
    );
  });

  it('rejects confidence scores above one', () => {
    const invalidReview = {
      ...validReview,
      findings: [
        {
          ...validReview.findings[0],
          confidence: 2,
        },
      ],
    };

    expect(() => parseReviewResponse(JSON.stringify(invalidReview))).toThrow(
      'invalid review structure',
    );
  });
});
