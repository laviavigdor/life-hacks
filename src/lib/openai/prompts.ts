import { getOpenAIClient, withErrorHandling } from './client';
import OpenAI from 'openai';

export interface PromptVersion {
    version: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    examples?: Array<{
        input: string;
        output: any;
    }>;
}

export interface PromptTestCase {
    input: string;
    expected_insights: string[];
}

export interface PromptTestResult {
    version: string;
    testCase: PromptTestCase;
    output: any;
    passed: boolean;
    error?: string;
}

// Current prompt version for insight extraction
export const CURRENT_PROMPT_VERSION: PromptVersion = {
    version: '1.0.0',
    description: 'Initial prompt for extracting activity insights',
    systemPrompt: `You are an expert at analyzing activity logs and extracting structured insights.
Your task is to extract key metrics and insights from user entries about their activities.
Always maintain consistent units and formats.
If you're unsure about a value, do not guess - return null for that field.
For derived metrics (like pace), only calculate if you have high confidence in the source metrics.`,
    userPromptTemplate: `Extract key insights from this activity entry: "{input}"`,
    examples: [
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
        }
    ]
};

// Store of all prompt versions for testing and iteration
export const PROMPT_VERSIONS: PromptVersion[] = [CURRENT_PROMPT_VERSION];

export async function testPrompt(
    version: PromptVersion,
    testCases: PromptTestCase[],
): Promise<PromptTestResult[]> {
    const openai = getOpenAIClient();
    const results: PromptTestResult[] = [];

    for (const testCase of testCases) {
        try {
            const response = await withErrorHandling(() =>
                openai.chat.completions.create({
                    model: 'gpt-4-turbo-preview',
                    messages: [
                        { role: 'system' as const, content: version.systemPrompt },
                        ...(version.examples?.map(ex => [
                            { role: 'user' as const, content: ex.input },
                            { role: 'assistant' as const, content: JSON.stringify(ex.output) }
                        ]).flat() || []),
                        {
                            role: 'user' as const,
                            content: version.userPromptTemplate.replace('{input}', testCase.input)
                        }
                    ],
                    temperature: 0.1,
                    response_format: { type: 'json_object' }
                })
            );

            if (!('choices' in response) || !response.choices[0]?.message?.content) {
                throw new Error('Invalid response format from OpenAI');
            }

            const output = JSON.parse(response.choices[0].message.content);
            const extractedMetrics = output.metrics?.map((m: any) => m.type) || [];

            results.push({
                version: version.version,
                testCase,
                output,
                passed: testCase.expected_insights.every(i => extractedMetrics.includes(i))
            });
        } catch (error) {
            results.push({
                version: version.version,
                testCase,
                output: null,
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    return results;
}

export async function extractInsights(input: string): Promise<any> {
    const openai = getOpenAIClient();
    const version = CURRENT_PROMPT_VERSION;

    const response = await withErrorHandling(() =>
        openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system' as const, content: version.systemPrompt },
                ...(version.examples?.map(ex => [
                    { role: 'user' as const, content: ex.input },
                    { role: 'assistant' as const, content: JSON.stringify(ex.output) }
                ]).flat() || []),
                {
                    role: 'user' as const,
                    content: version.userPromptTemplate.replace('{input}', input)
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