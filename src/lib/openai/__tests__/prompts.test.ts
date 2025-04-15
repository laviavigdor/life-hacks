import { testPrompt, CURRENT_PROMPT_VERSION, extractInsights } from '../prompts';
import { getOpenAIClient } from '../client';
import { mock } from 'jest-mock-extended';
import OpenAI from 'openai';

// Mock OpenAI client
jest.mock('../client', () => ({
    getOpenAIClient: jest.fn(),
    withErrorHandling: jest.fn((fn) => fn()),
}));

describe('OpenAI Prompts', () => {
    let mockOpenAI: jest.Mocked<OpenAI>;

    beforeEach(() => {
        mockOpenAI = {
            chat: {
                completions: {
                    create: jest.fn(),
                } as any,
            } as any,
        } as any;

        (getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAI);
    });

    describe('testPrompt', () => {
        it('should test prompts and return results', async () => {
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                activity: 'run',
                                metrics: [
                                    { type: 'distance', value: 5, unit: 'km' },
                                    { type: 'duration', value: 30, unit: 'min' },
                                ],
                            }),
                        },
                    },
                ],
            };

            mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any);

            const testCases = [
                {
                    input: 'Ran 5k in 30 min',
                    expected_insights: ['distance', 'duration'],
                },
            ];

            const results = await testPrompt(CURRENT_PROMPT_VERSION, testCases);

            expect(results).toHaveLength(1);
            expect(results[0].passed).toBe(true);
            expect(results[0].output.metrics).toHaveLength(2);
        });

        it('should handle API errors gracefully', async () => {
            mockOpenAI.chat.completions.create.mockRejectedValue(
                new Error('API Error')
            );

            const testCases = [
                {
                    input: 'Ran 5k in 30 min',
                    expected_insights: ['distance', 'duration'],
                },
            ];

            const results = await testPrompt(CURRENT_PROMPT_VERSION, testCases);

            expect(results).toHaveLength(1);
            expect(results[0].passed).toBe(false);
            expect(results[0].error).toBe('API Error');
        });
    });

    describe('extractInsights', () => {
        it('should extract insights from input', async () => {
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                activity: 'run',
                                metrics: [
                                    { type: 'distance', value: 5, unit: 'km' },
                                    { type: 'duration', value: 30, unit: 'min' },
                                ],
                            }),
                        },
                    },
                ],
            };

            mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any);

            const result = await extractInsights('Ran 5k in 30 min');

            expect(result.activity).toBe('run');
            expect(result.metrics).toHaveLength(2);
        });

        it('should handle invalid responses', async () => {
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: 'invalid json',
                        },
                    },
                ],
            };

            mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any);

            await expect(extractInsights('Ran 5k in 30 min')).rejects.toThrow();
        });
    });
}); 