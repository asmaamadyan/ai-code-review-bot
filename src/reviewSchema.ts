import { z } from 'zod';

export const findingSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum([
    'correctness',
    'security',
    'performance',
    'accessibility',
    'testing',
    'maintainability',
    'reliability',
  ]),
  language: z.enum(['TypeScript', 'JavaScript', 'Python', 'Java', 'C#']),
  file: z.string().min(1),
  line: z.number().int().positive().nullable(),
  title: z.string().min(1),
  explanation: z.string().min(1),
  suggestedFix: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const reviewSchema = z.object({
  summary: z.string().min(1),
  riskLevel: z.enum(['critical', 'high', 'medium', 'low']),
  findings: z.array(findingSchema),
  positives: z.array(z.string().min(1)),
});

export type ReviewFinding = z.infer<typeof findingSchema>;
export type CodeReview = z.infer<typeof reviewSchema>;

function removeMarkdownFence(response: string): string {
  const trimmedResponse = response.trim();

  if (
    trimmedResponse.startsWith('```json') &&
    trimmedResponse.endsWith('```')
  ) {
    return trimmedResponse.slice('```json'.length, -'```'.length).trim();
  }

  if (trimmedResponse.startsWith('```') && trimmedResponse.endsWith('```')) {
    return trimmedResponse.slice('```'.length, -'```'.length).trim();
  }

  return trimmedResponse;
}

export function parseReviewResponse(response: string): CodeReview {
  if (!response.trim()) {
    throw new Error('Copilot returned an empty response.');
  }

  const cleanedResponse = removeMarkdownFence(response);

  let parsedResponse: unknown;

  try {
    parsedResponse = JSON.parse(cleanedResponse);
  } catch {
    throw new Error('Copilot returned invalid JSON.');
  }

  const validationResult = reviewSchema.safeParse(parsedResponse);

  if (!validationResult.success) {
    const reasons = validationResult.error.issues
      .map((issue) => {
        const location = issue.path.join('.');

        return `${location || 'response'}: ${issue.message}`;
      })
      .join('; ');

    throw new Error(`Copilot returned an invalid review structure: ${reasons}`);
  }

  return validationResult.data;
}
