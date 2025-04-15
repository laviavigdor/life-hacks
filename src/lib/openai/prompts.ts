import { getOpenAIClient, withErrorHandling } from './client';

interface Metric {
    type: string;
    value: number | string | null;
    unit: string | null;
    derived?: boolean;
}

interface InsightResult {
    activity: string | null;
    metrics: Metric[];
    confidence?: 'high' | 'medium' | 'low';
    error?: string;
}

const SYSTEM_PROMPT = `You are an expert at analyzing activity logs and extracting structured insights.
Your task is to extract key metrics and insights from user entries about their activities and return them as JSON.
Always maintain consistent units and formats.
If you're unsure about a value, do not guess - return null for that field.
For derived metrics (like pace), only calculate if you have high confidence in the source metrics.`;

const EXAMPLES = [
    {
        input: "Ran 5k in 30 min",
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
                    derived: true
                }
            ]
        }
    },
    {
        input: "Did 3 sets of 10 pushups",
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
                    derived: true
                }
            ]
        }
    },
    {
        input: "Ate 200g of chicken with rice",
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
                }
            ]
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
                    content: `Extract key insights from this activity entry: "${input}"`
                }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        })
    );

    if (!('choices' in response) || !response.choices[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
    }

    return JSON.parse(response.choices[0].message.content);
} 