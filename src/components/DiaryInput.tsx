'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { classifyIntent } from '@/lib/intent';
import { Textarea } from "@/components/ui/textarea";

export function DiaryInput() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    // Auto-expand textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    }, [input]);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setIsSuccess(false);

            // First, classify the intent
            const intent = await classifyIntent(input);
            console.log('[Intent Classified]', intent);

            if (intent.type === 'log_entry') {
                // Handle diary entry
                const response = await fetch('/api/diary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ entry: input }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    if (response.status === 429) {
                        throw new Error('You are sending too many entries too quickly. Please wait a moment and try again.');
                    }
                    throw new Error(data.error || 'Failed to save entry');
                }

                // Show success state
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 2000);

                // Clear input on success
                setInput('');

                // Dispatch custom event for metrics refresh
                window.dispatchEvent(new Event('diary-entry-added'));

                // Refresh the page data
                router.refresh();
            } else if (intent.type === 'query_metrics') {
                // Handle metrics query
                const response = await fetch(`/api/metrics?query=${encodeURIComponent(input)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch metrics');
                }

                // Clear input and show success
                setInput('');
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 2000);

                // Refresh the page to show updated metrics
                router.refresh();
            } else if (intent.type === 'modify_ui') {
                // Handle UI modifications
                // This will be handled by the UI components themselves
                window.dispatchEvent(new CustomEvent('ui-modification', {
                    detail: intent.parameters
                }));

                setInput('');
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 2000);
            }
        } catch (err) {
            console.error('Error submitting:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg rounded-t-xl">
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="How can I help?"
                            className="w-full p-3 border rounded-lg resize-none min-h-[60px] pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <div className="absolute right-3 top-3">
                            {isLoading && (
                                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                            )}
                            {isSuccess && (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className="self-end"
                    >
                        {isLoading ? 'Processing...' : 'Submit'}
                    </Button>
                </div>
            </div>
        </div>
    );
} 