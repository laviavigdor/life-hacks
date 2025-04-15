'use client';

import { Card } from '@/components/ui/card';
import { QueryResult } from '@/lib/query';
import { LineChart } from './LineChart';

interface MetricsDisplayProps {
    data: QueryResult;
}

export function MetricsDisplay({ data }: MetricsDisplayProps) {
    if (!data || !data.metrics || data.metrics.length === 0) {
        return (
            <Card className="p-4">
                <p className="text-gray-500">No metrics available</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {data.metrics.map((metric, index) => {
                // Check if all values are numbers
                const isNumeric = metric.values.every(value => typeof value === 'number');

                // Transform the data into the format expected by LineChart only for numeric metrics
                const chartData = isNumeric ? metric.values.map((value, i) => ({
                    timestamp: new Date(data.dateRange.start.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
                    value: value as number
                })) : [];

                return (
                    <Card key={index} className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{metric.type}</h3>
                        {isNumeric ? (
                            <LineChart data={chartData} label={metric.type} unit={metric.unit || undefined} />
                        ) : (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">Most common values:</p>
                                <ul className="list-disc list-inside mt-1">
                                    {metric.mostCommon?.map((value, i) => (
                                        <li key={i} className="text-sm">{value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {metric.mostCommon && metric.mostCommon.length > 0 && isNumeric && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">Most common: {metric.mostCommon.join(', ')}</p>
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
