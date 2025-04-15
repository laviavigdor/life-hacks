import OpenAI from 'openai';

// Singleton instance of OpenAI client
let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
    if (!client) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        client = new OpenAI({
            apiKey,
            maxRetries: 3,
            timeout: 30000, // 30 seconds
        });
    }

    return client;
}

export class OpenAIError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly status?: number,
    ) {
        super(message);
        this.name = 'OpenAIError';
    }
}

export async function withErrorHandling<T>(
    operation: () => Promise<T>,
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            throw new OpenAIError(
                error.message || 'Unknown OpenAI error',
                error.code || undefined,
                error.status
            );
        }
        throw error;
    }
} 