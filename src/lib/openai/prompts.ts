import { getOpenAIClient, withErrorHandling } from './client';
import { z } from 'zod';

// Validation schemas
export const MetricSchema = z.object({
    type: z.string(),
    value: z.union([z.number(), z.string(), z.null()]),
    unit: z.string().nullable(),
    derived: z.boolean().optional(),
    timestamp: z.string().optional(), // For relative time parsing
    confidence: z.enum(['high', 'medium', 'low']).optional(),
});

export const InsightSchema = z.object({
    activity: z.string().nullable(),
    metrics: z.array(MetricSchema),
    confidence: z.enum(['high', 'medium', 'low']).optional(),
    error: z.string().optional(),
    timestamp: z.string().optional(), // For relative time parsing
});

export type Metric = z.infer<typeof MetricSchema>;
export type InsightResult = z.infer<typeof InsightSchema>;

const SYSTEM_PROMPT = `You are an expert at analyzing activity logs and extracting structured insights.
Your task is to extract key metrics and insights from user entries about their activities and return them as JSON.
Always maintain consistent units and formats.
If you're unsure about a value, do not guess - return null for that field.
For derived metrics (like pace), only calculate if you have high confidence in the source metrics.

When processing time-related information:
1. Convert relative times (e.g., "yesterday", "last week") to ISO timestamps
2. Use the current time as reference point
3. Include both the original time reference and the calculated timestamp`;

const EXAMPLES = [
    {
        input: "Ran 5k in 30 min yesterday morning",
        output: {
            activity: "run",
            metrics: [
                {
                    type: "distance",
                    value: 5,
                    unit: "km"
                },
                {
                    type: "duration",
                    value: 30,
                    unit: "min"
                },
                {
                    type: "pace",
                    value: 6,
                    unit: "min/km",
                    derived: true,
                    confidence: "high"
                }
            ],
            timestamp: "2024-03-14T08:00:00Z",  // Example timestamp, will be relative to current time
            confidence: "high"
        }
    },
    {
        input: "Did 3 sets of 10 pushups an hour ago",
        output: {
            activity: "pushups",
            metrics: [
                {
                    type: "sets",
                    value: 3,
                    unit: "sets"
                },
                {
                    type: "reps",
                    value: 10,
                    unit: "reps"
                },
                {
                    type: "total_reps",
                    value: 30,
                    unit: "reps",
                    derived: true,
                    confidence: "high"
                },
                {
                    type: "estimated_calories",
                    value: 30,
                    unit: "kcal",
                    derived: true,
                    confidence: "medium"
                }
            ],
            timestamp: "2024-03-15T10:00:00Z",  // Example timestamp, will be relative to current time
            confidence: "high"
        }
    },
    {
        input: "Ate 200g of chicken with rice for lunch",
        output: {
            activity: "meal",
            metrics: [
                {
                    type: "protein_source",
                    value: "chicken",
                    unit: null
                },
                {
                    type: "protein_amount",
                    value: 200,
                    unit: "g"
                },
                {
                    type: "carb_source",
                    value: "rice",
                    unit: null
                },
                {
                    type: "estimated_protein",
                    value: 46,
                    unit: "g",
                    derived: true,
                    confidence: "medium"
                },
                {
                    type: "meal_time",
                    value: "lunch",
                    unit: null
                }
            ],
            timestamp: "2024-03-15T12:00:00Z",  // Example timestamp, will be relative to current time
            confidence: "high"
        }
    }
];

export async function extractInsights(input: string): Promise<InsightResult> {
    const openai = getOpenAIClient();

    const response = await withErrorHandling(() =>
        openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system' as const, content: SYSTEM_PROMPT },
                ...EXAMPLES.flatMap(ex => [
                    { role: 'user' as const, content: ex.input },
                    { role: 'assistant' as const, content: JSON.stringify(ex.output) }
                ]),
                {
                    role: 'user' as const,
                    content: `Extract key insights from this activity entry: "${input}". Current time: ${new Date().toISOString()}`
                }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        })
    );

    if (!('choices' in response) || !response.choices[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
    }

    // Parse and validate the response
    const rawInsights = JSON.parse(response.choices[0].message.content);
    const validationResult = InsightSchema.safeParse(rawInsights);

    if (!validationResult.success) {
        throw new Error(`Invalid insight format: ${validationResult.error.message}`);
    }

    return validationResult.data;
} 