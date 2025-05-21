
'use server';

/**
 * @fileOverview An AI agent that provides personalized budget adjustment suggestions based on spending trends by category.
 *
 * - suggestBudgetAdjustments - A function that analyzes spending and suggests budget adjustments.
 * - SuggestBudgetAdjustmentsInput - The input type for the suggestBudgetAdjustments function.
 * - SuggestBudgetAdjustmentsOutput - The return type for the suggestBudgetAdjustments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetAdjustmentsInputSchema = z.object({
  monthlyIncome: z.number().describe('The user\'s total monthly income.'),
  totalExpenses: z.number().describe('The user\'s total monthly expenses.'),
  spendingByCategory: z
    .record(z.number()) // Key is category name (or "Uncategorized"), value is amount spent
    .describe(
      'A record of the user\'s spending, grouped by category. Keys are category names (e.g., "Groceries", "Utilities", "Uncategorized"), values are the amount spent in that category.'
    ),
});
export type SuggestBudgetAdjustmentsInput = z.infer<
  typeof SuggestBudgetAdjustmentsInputSchema
>;

const SuggestBudgetAdjustmentsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of personalized budget adjustment suggestions to help the user save money.'
    ),
  summary: z
    .string()
    .describe('A summary of the spending analysis and key recommendations.'),
});
export type SuggestBudgetAdjustmentsOutput = z.infer<
  typeof SuggestBudgetAdjustmentsOutputSchema
>;

export async function suggestBudgetAdjustments(
  input: SuggestBudgetAdjustmentsInput
): Promise<SuggestBudgetAdjustmentsOutput> {
  return suggestBudgetAdjustmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetAdjustmentsPrompt',
  input: {schema: SuggestBudgetAdjustmentsInputSchema},
  output: {schema: SuggestBudgetAdjustmentsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending habits and provide personalized budget adjustment suggestions to help them save money. Be concise, clear, and actionable. Consider the income to expense ratio.

  Monthly Income: {{{monthlyIncome}}}
  Total Expenses: {{{totalExpenses}}}
  Spending by Category:
  {{#if (size spendingByCategory)}}
    {{#each spendingByCategory}}
  - {{@key}}: {{{this}}}
    {{/each}}
  {{else}}
  - No categorized spending data available.
  {{/if}}

  Based on this information, provide a summary of your analysis and a list of specific suggestions the user can implement.
  Format the suggestions as a numbered list. If there are no specific suggestions due to lack of spending data or if the budget is well-managed, state that.
  `,
});

const suggestBudgetAdjustmentsFlow = ai.defineFlow(
  {
    name: 'suggestBudgetAdjustmentsFlow',
    inputSchema: SuggestBudgetAdjustmentsInputSchema,
    outputSchema: SuggestBudgetAdjustmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
