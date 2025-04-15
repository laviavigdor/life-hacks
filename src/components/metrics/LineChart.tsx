'use client';

import { Card } from '@/components/ui/card';
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DataPoint {
    timestamp: string;
    value: number;
}

interface LineChartProps {
    data: DataPoint[];
    label: string;
    unit?: string;
    className?: string;
}

export function LineChart({ data, label, unit, className }: LineChartProps) {
    if (data.length === 0) {
        return (
            <Card className={className}>
                <div className="flex h-[200px] items-center justify-center text-gray-500">
                    No data available
                </div>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500">{label}</h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                            data={data}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `${value}${unit ? ` ${unit}` : ''}`}
                            />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleString()}
                                formatter={(value: number) => [`${value}${unit ? ` ${unit}` : ''}`, label]}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
} 