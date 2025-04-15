import { testPrompt, CURRENT_PROMPT_VERSION, extractInsights } from '../prompts';
import { getOpenAIClient } from '../client';
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
                } as unknown as OpenAI.Chat.Completions,
            } as OpenAI.Chat,
        } as unknown as jest.Mocked<OpenAI>;

        (getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAI);
    });

    describe('testPrompt', () => {
        it('should test prompts and return results', async () => {
            const mockResponse: OpenAI.Chat.ChatCompletion = {
                id: 'test',
                choices: [
                    {
                        message: {
                            role: 'assistant',
                            content: JSON.stringify({
                                activity: 'run',
                                metrics: [
                                    { type: 'distance', value: 5, unit: 'km' },
                                    { type: 'duration', value: 30, unit: 'min' },
                                ],
                            }),
                        },
                        index: 0,
                        finish_reason: 'stop',
                    },
                ],
                created: Date.now(),
                model: 'gpt-4',
                object: 'chat.completion',
            };

            mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

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
            const mockResponse: OpenAI.Chat.ChatCompletion = {
                id: 'test',
                choices: [
                    {
                        message: {
                            role: 'assistant',
                            content: JSON.stringify({
                                activity: 'run',
                                metrics: [
                                    { type: 'distance', value: 5, unit: 'km' },
                                    { type: 'duration', value: 30, unit: 'min' },
                                ],
                            }),
                        },
                        index: 0,
                        finish_reason: 'stop',
                    },
                ],
                created: Date.now(),
                model: 'gpt-4',
                object: 'chat.completion',
            };

            mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

            const result = await extractInsights('Ran 5k in 30 min');

            expect(result.activity).toBe('run');
            expect(result.metrics).toHaveLength(2);
        });

        it('should handle invalid responses', async () => {
            const mockResponse: OpenAI.Chat.ChatCompletion = {
                id: 'test',
                choices: [
                    {
                        message: {
                            role: 'assistant',
                            content: 'invalid json',
                        },
                        index: 0,
                        finish_reason: 'stop',
                    },
                ],
                created: Date.now(),
                model: 'gpt-4',
                object: 'chat.completion',
            };

            mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

            await expect(extractInsights('Ran 5k in 30 min')).rejects.toThrow();
        });
    });
}); 