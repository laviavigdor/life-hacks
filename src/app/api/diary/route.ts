import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schema
const DiaryEntrySchema = z.object({
    entry: z.string()
        .min(1, 'Entry cannot be empty')
        .max(1000, 'Entry cannot be longer than 1000 characters')
        .trim(),
});

export async function POST(request: Request) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const result = DiaryEntrySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.issues },
                { status: 400 }
            );
        }

        // Save to database with empty insights
        const entry = await prisma.diary.create({
            data: {
                entry: result.data.entry,
                insights: '{}', // Empty insights object as string
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