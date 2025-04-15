'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';

interface NumericDisplayProps {
    label: string;
    value: number | string | null;
    unit?: string | null;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export function NumericDisplay({
    label,
    value,
    unit,
    trend = 'neutral',
    className
}: NumericDisplayProps) {
    const trendIcon = {
        up: <ArrowUpIcon className="h-4 w-4 text-green-500" />,
        down: <ArrowDownIcon className="h-4 w-4 text-red-500" />,
        neutral: <MinusIcon className="h-4 w-4 text-gray-400" />
    }[trend];

    return (
        <Card className={cn('p-4', className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">{label}</h3>
                {trendIcon}
            </div>
            <div className="mt-2">
                {value === null ? (
                    <span className="text-2xl font-semibold text-gray-300">--</span>
                ) : (
                    <div className="flex items-baseline">
                        <span className="text-2xl font-semibold">{value}</span>
                        {unit && (
                            <span className="ml-1 text-sm text-gray-500">{unit}</span>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
} 