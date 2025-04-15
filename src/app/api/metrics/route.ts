import { NextResponse } from 'next/server';
import { z } from 'zod';
import { processQuery } from '@/lib/query';

// Input validation schema
const QuerySchema = z.object({
    query: z.string()
        .min(1, 'Query cannot be empty')
        .max(200, 'Query is too long')
        .trim(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        const result = QuerySchema.safeParse({ query });

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid query', details: result.error.issues },
                { status: 400 }
            );
        }

        // Process the query
        const queryResult = await processQuery(result.data.query);

        if (queryResult.error) {
            return NextResponse.json(
                { error: queryResult.error },
                { status: 400 }
            );
        }

        return NextResponse.json(queryResult);
    } catch (error) {
        console.error('Failed to process metric query:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 