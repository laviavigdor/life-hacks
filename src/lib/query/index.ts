import { PrismaClient } from '@prisma/client';
import { InsightResult, Metric } from '@/types/metrics';
import { parseISO, isValid, subDays, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

interface DateRange {
    start: Date;
    end: Date;
}

interface MetricAggregation {
    type: string;
    values: (string | number)[];
    unit: string | null;
    average: number | null;
    min: number | null;
    max: number | null;
    trend: 'up' | 'down' | 'neutral';
    mostCommon?: string[];
}

export interface QueryResult {
    dateRange: DateRange;
    metrics: MetricAggregation[];
    error?: string;
}

function parseDateRange(query: string): DateRange {
    // Handle relative dates
    if (query.includes('last')) {
        const days = query.toLowerCase().includes('week') ? 7
            : query.toLowerCase().includes('month') ? 30
                : 1;
        return {
            start: startOfDay(subDays(new Date(), days - 1)),
            end: endOfDay(new Date())
        };
    }

    // Try to parse explicit dates
    const dateMatch = query.match(/(\d{4}-\d{2}-\d{2})/g);
    if (dateMatch && dateMatch.length >= 1) {
        const start = parseISO(dateMatch[0]);
        const end = dateMatch.length > 1 ? parseISO(dateMatch[1]) : new Date();

        if (isValid(start) && isValid(end)) {
            return {
                start: startOfDay(start),
                end: endOfDay(end)
            };
        }
    }

    // Default to last 7 days
    return {
        start: startOfDay(subDays(new Date(), 6)),
        end: endOfDay(new Date())
    };
}

function detectTrend(values: number[]): 'up' | 'down' | 'neutral' {
    if (values.length < 2) return 'neutral';

    // Calculate moving average to smooth out noise
    const windowSize = Math.min(3, Math.floor(values.length / 2));
    const movingAverages = values
        .slice(values.length - windowSize)
        .reduce((sum, val) => sum + val, 0) / windowSize;

    const recentAverage = values
        .slice(0, windowSize)
        .reduce((sum, val) => sum + val, 0) / windowSize;

    const difference = recentAverage - movingAverages;
    const threshold = 0.05; // 5% change threshold

    if (Math.abs(difference) < threshold * movingAverages) return 'neutral';
    return difference > 0 ? 'up' : 'down';
}

function aggregateMetrics(metrics: Metric[]): MetricAggregation[] {
    // Explicitly type the Map to handle both string and number values
    const metricsByType = new Map<string, {
        values: (string | number)[];
        unit: string | null;
        isNumeric: boolean;
    }>();

    // Group metrics by type
    metrics.forEach(metric => {
        if (!metric.value) return; // Skip metrics with null/undefined values

        const existing = metricsByType.get(metric.type) || {
            values: [] as (string | number)[],  // Explicitly type the array
            unit: metric.unit ?? null,  // Use nullish coalescing
            isNumeric: typeof metric.value === 'number'
        };
        existing.values.push(metric.value);
        metricsByType.set(metric.type, existing);
    });

    // Calculate aggregations for each type
    return Array.from(metricsByType.entries()).map(([type, data]) => {
        if (data.isNumeric) {
            const numericValues = data.values.filter((v): v is number => typeof v === 'number');
            return {
                type,
                values: numericValues,
                unit: data.unit,
                average: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : null,
                min: numericValues.length > 0 ? Math.min(...numericValues) : null,
                max: numericValues.length > 0 ? Math.max(...numericValues) : null,
                trend: detectTrend(numericValues)
            };
        } else {
            // For non-numeric metrics (like food types, descriptions)
            const stringValues = data.values.filter((v): v is string => typeof v === 'string');
            const valueCount = new Map<string, number>();
            stringValues.forEach(v => valueCount.set(v, (valueCount.get(v) || 0) + 1));

            // Sort by frequency
            const sortedValues = Array.from(valueCount.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([value]) => value);

            return {
                type,
                values: [],  // Empty array for non-numeric metrics
                unit: data.unit,
                average: null,
                min: null,
                max: null,
                trend: 'neutral' as const,
                mostCommon: sortedValues.slice(0, 3) // Top 3 most common values
            };
        }
    });
}

export async function processQuery(query: string): Promise<QueryResult> {
    console.log('[Query Processing Start]', {
        query,
        timestamp: new Date().toISOString()
    });

    try {
        const dateRange = parseDateRange(query);
        console.log('[Date Range Parsed]', {
            dateRange,
            timestamp: new Date().toISOString()
        });

        // Get entries within date range
        const entries = await prisma.diary.findMany({
            where: {
                createdAt: {
                    gte: dateRange.start,
                    lte: dateRange.end
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('[Entries Retrieved]', {
            count: entries.length,
            dateRange,
            timestamp: new Date().toISOString()
        });

        // Extract and combine all metrics
        const allMetrics: Metric[] = [];
        entries.forEach(entry => {
            try {
                const insights: InsightResult = JSON.parse(entry.insights);
                if (Array.isArray(insights.metrics)) {
                    allMetrics.push(...insights.metrics);
                }
            } catch (error) {
                console.error('[Insights Parse Error]', {
                    error,
                    entry: entry.id,
                    timestamp: new Date().toISOString()
                });
            }
        });

        const result = {
            dateRange,
            metrics: aggregateMetrics(allMetrics)
        };

        console.log('[Query Processing Complete]', {
            metricTypes: result.metrics.map(m => m.type),
            metricCount: result.metrics.length,
            timestamp: new Date().toISOString()
        });

        return result;
    } catch (error) {
        console.error('Query processing error:', error);
        return {
            dateRange: parseDateRange('last week'), // fallback to last week
            metrics: [],
            error: error instanceof Error ? error.message : 'Failed to process query'
        };
    }
} 