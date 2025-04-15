import { getOpenAIClient } from './client';
import { InsightResult, InsightSchema, RawInsights, RawMetric } from '@/types/metrics';
import { SYSTEM_PROMPT, EXAMPLES } from './prompts/diary-analysis';

export async function extractInsights(entry: string): Promise<InsightResult & { error?: string }> {
    try {
        const openai = getOpenAIClient();

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Here are some examples of how to analyze entries:\n${JSON.stringify(EXAMPLES, null, 2)}` },
                { role: "user", content: `Please analyze this entry:\n${entry}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
        });

        const rawResponse = completion.choices[0]?.message?.content;
        if (!rawResponse) {
            return {
                summary: '',
                metrics: [],
                confidence: 0.5,
                tags: [],
                error: 'No response from OpenAI'
            };
        }

        let rawInsights: RawInsights;
        try {
            rawInsights = JSON.parse(rawResponse);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError);
            return {
                summary: '',
                metrics: [],
                confidence: 0.5,
                tags: [],
                error: 'Failed to parse OpenAI response'
            };
        }

        // Ensure metrics is always an array
        if (!Array.isArray(rawInsights.metrics)) {
            rawInsights.metrics = [];
        }

        // Normalize and validate the response
        const normalizedInsights = {
            summary: rawInsights.summary || '',
            metrics: rawInsights.metrics.map((metric: RawMetric) => ({
                type: metric.type || 'unknown',
                value: metric.value ?? 0,
                unit: metric.unit || null,
                confidence: typeof metric.confidence === 'number' ? metric.confidence : 0.5
            })),
            confidence: typeof rawInsights.confidence === 'number' ? rawInsights.confidence : 0.5,
            tags: Array.isArray(rawInsights.tags) ? rawInsights.tags : []
        };

        // Validate against schema
        const validationResult = InsightSchema.safeParse(normalizedInsights);
        if (!validationResult.success) {
            console.error('Validation failed:', validationResult.error);
            return {
                summary: '',
                metrics: [],
                confidence: 0.5,
                tags: [],
                error: `Validation failed: ${validationResult.error.message}`
            };
        }

        return validationResult.data;
    } catch (error) {
        console.error('Error extracting insights:', error);
        return {
            summary: '',
            metrics: [],
            confidence: 0.5,
            tags: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
} 