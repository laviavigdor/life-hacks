import { z } from 'zod';
import { getOpenAIClient, withErrorHandling } from '../openai/client';

export const IntentSchema = z.object({
    type: z.enum(['log_entry', 'query_metrics', 'modify_ui']),
    confidence: z.enum(['high', 'medium', 'low']),
    action: z.string(),
    parameters: z.record(z.any()).optional()
});

export type Intent = z.infer<typeof IntentSchema>;

const SYSTEM_PROMPT = `You are an expert at understanding user intent in a personal activity tracking app.
Classify each input into one of these categories:

1. log_entry: User wants to log a new activity or event
   Example: "ran 5k today", "ate a sandwich for lunch"

2. query_metrics: User wants to see or analyze their data
   Example: "show my activities from last month", "how many times did I run?"

3. modify_ui: User wants to change how data is displayed
   Example: "show more entries", "hide the chart"

Return a JSON response with this structure:
{
    "type": "log_entry" | "query_metrics" | "modify_ui",
    "confidence": "high" | "medium" | "low",
    "action": "brief description of intended action",
    "parameters": { optional parameters object }
}`;

export async function classifyIntent(input: string): Promise<Intent> {
    const openai = getOpenAIClient();

    console.log('[Intent Classification Request]', {
        input,
        timestamp: new Date().toISOString()
    });

    const response = await withErrorHandling(() =>
        openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: input }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        })
    );

    try {
        const result = JSON.parse(response.choices?.[0]?.message?.content || '{}');
        const validationResult = IntentSchema.safeParse(result);

        if (!validationResult.success) {
            console.error('[Intent Validation Error]', {
                error: validationResult.error,
                input: result,
                timestamp: new Date().toISOString()
            });
            return {
                type: 'log_entry', // Default to log entry on validation failure
                confidence: 'low',
                action: 'fallback to logging entry due to validation error'
            };
        }

        return validationResult.data;
    } catch (error) {
        console.error('[Intent Parse Error]', {
            error,
            response: response.choices?.[0]?.message?.content,
            timestamp: new Date().toISOString()
        });
        return {
            type: 'log_entry', // Default to log entry on parse failure
            confidence: 'low',
            action: 'fallback to logging entry due to parse error'
        };
    }
} 