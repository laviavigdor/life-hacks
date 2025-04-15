'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function DiaryInput() {
    const [entry, setEntry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            const response = await fetch('/api/diary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entry }),
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 429) {
                    throw new Error('You are sending too many entries too quickly. Please wait a moment and try again.');
                }
                throw new Error(data.error || 'Failed to save entry');
            }

            // Clear input on success
            setEntry('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
            <div className="max-w-4xl mx-auto flex gap-4">
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="How can I help?"
                    className="flex-1 p-2 border rounded-lg resize-none h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!entry.trim() || isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </div>
            {error && (
                <div className="mt-2 text-sm text-red-600">
                    {error}
                </div>
            )}
        </div>
    );
} 