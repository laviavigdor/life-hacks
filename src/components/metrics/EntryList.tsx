'use client';

import { Card } from '@/components/ui/card';
import { InsightResult } from '@/types/metrics';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface Entry {
    id: number;
    entry: string;
    insights: string;
    created_at: string;
}

interface EntryListProps {
    entries: Entry[];
    className?: string;
}

export function EntryList({ entries, className }: EntryListProps) {
    const [showAll, setShowAll] = useState(false);
    const displayedEntries = showAll ? entries : entries.slice(0, 2);
    const hasMoreEntries = entries.length > 2;

    const EntryCard = ({ entry }: { entry: Entry }) => {
        let insights: InsightResult | null = null;
        try {
            insights = JSON.parse(entry.insights);
        } catch (error) {
            console.error('Failed to parse insights:', error);
        }

        return (
            <Card key={entry.id} className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-gray-900">{entry.entry}</p>
                        {insights?.metrics && insights.metrics.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {insights.metrics.map((metric, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                    >
                                        {metric.type}: {metric.value}
                                        {metric.unit && ` ${metric.unit}`}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <time className="ml-4 text-xs text-gray-500">
                        {formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })}
                    </time>
                </div>
            </Card>
        );
    };

    return (
        <div className={className}>
            {entries.length === 0 ? (
                <Card className="p-6 text-center text-gray-500">
                    No entries yet. Start by adding your first activity!
                </Card>
            ) : (
                <div className="space-y-4">
                    {displayedEntries.map((entry) => (
                        <EntryCard key={entry.id} entry={entry} />
                    ))}

                    {hasMoreEntries && (
                        <Button
                            variant="ghost"
                            className="w-full mt-2 text-blue-600 hover:text-blue-800"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? (
                                <div className="flex items-center gap-2">
                                    Show Less <ChevronUpIcon className="h-4 w-4" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Show More ({entries.length - 2} more) <ChevronDownIcon className="h-4 w-4" />
                                </div>
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
} 