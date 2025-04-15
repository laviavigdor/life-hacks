'use client';

import { useEffect, useState } from 'react';
import { MetricsDisplay } from './MetricsDisplay';
import { QueryResult } from '@/lib/query';

const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds

export function MonthlyMetrics() {
    const [data, setData] = useState<QueryResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchMetrics() {
        try {
            const response = await fetch('/api/metrics?query=Show my activities from last month');
            if (!response.ok) {
                throw new Error('Failed to fetch metrics');
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Error fetching metrics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load metrics');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMetrics();

        // Set up auto-refresh
        const intervalId = setInterval(fetchMetrics, REFRESH_INTERVAL);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    // Add event listener for custom refresh events
    useEffect(() => {
        const handleRefresh = () => {
            fetchMetrics();
        };

        window.addEventListener('diary-entry-added', handleRefresh);
        return () => window.removeEventListener('diary-entry-added', handleRefresh);
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between animate-pulse">
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border rounded-lg animate-pulse">
                            <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 p-4 bg-red-50">
                <div className="text-red-700">Error loading metrics: {error}</div>
                <button
                    onClick={fetchMetrics}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <div className="text-gray-500">No metrics available</div>
            </div>
        );
    }

    return <MetricsDisplay data={data} />;
} 