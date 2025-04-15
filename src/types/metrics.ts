import { z } from 'zod';
import { QueryResult } from '@/lib/query';

// Validation schemas
export const MetricSchema = z.object({
    type: z.string(),
    value: z.union([z.number(), z.string()]),
    unit: z.string().optional(),
    confidence: z.number().min(0).max(1)
});

export const InsightSchema = z.object({
    summary: z.string(),
    metrics: z.array(MetricSchema),
    confidence: z.number().min(0).max(1),
    tags: z.array(z.string()),
    activity: z.string().optional()
});

export type Metric = z.infer<typeof MetricSchema>;
export type InsightResult = z.infer<typeof InsightSchema>;

export interface RawMetric {
    type?: string;
    value?: number | string;
    unit?: string | null;
    confidence?: number;
}

export interface RawInsights {
    summary?: string;
    metrics?: RawMetric[];
    confidence?: number;
    tags?: string[];
}

export interface MetricData {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    label: string;
    unit?: string;
    mostCommon?: string[];
    values: (string | number)[];
}

export interface MetricsDisplayProps {
    data: QueryResult;
} 