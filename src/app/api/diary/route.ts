import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { extractInsights } from '@/lib/openai/prompts';
import { OpenAIError } from '@/lib/openai/client';

const prisma = new PrismaClient();

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute
const requestLog = new Map<string, { count: number; firstRequest: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const userRequests = requestLog.get(ip);

    if (!userRequests) {
        requestLog.set(ip, { count: 1, firstRequest: now });
        return false;
    }

    if (now - userRequests.firstRequest > RATE_LIMIT_WINDOW) {
        // Reset window
        requestLog.set(ip, { count: 1, firstRequest: now });
        return false;
    }

    if (userRequests.count >= MAX_REQUESTS) {
        return true;
    }

    userRequests.count++;
    return false;
}

// Input validation schema
const DiaryEntrySchema = z.object({
    entry: z.string()
        .min(1, 'Entry cannot be empty')
        .max(1000, 'Entry cannot be longer than 1000 characters')
        .trim(),
});

export async function POST(request: Request) {
    try {
        // Get client IP from headers or connection
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

        // Check rate limit
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const result = DiaryEntrySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.issues },
                { status: 400 }
            );
        }

        // Extract insights using OpenAI
        let insights;
        try {
            insights = await extractInsights(result.data.entry);
        } catch (error) {
            console.error('Failed to extract insights:', error);
            insights = { error: error instanceof OpenAIError ? error.message : 'Failed to analyze entry' };
        }

        // Save to database with insights
        const entry = await prisma.diary.create({
            data: {
                entry: result.data.entry,
                insights: JSON.stringify(insights),
            },
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        console.error('Failed to create diary entry:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 