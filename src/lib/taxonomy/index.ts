import { PrismaClient } from '@prisma/client';
import { InsightResult } from '../openai/prompts';

const prisma = new PrismaClient();

// In-memory cache for taxonomy
interface TaxonomyCache {
    activities: Map<string, { count: number; lastUsed: Date }>;
    metrics: Map<string, { count: number; lastUsed: Date }>;
    lastUpdated: Date;
}

const cache: TaxonomyCache = {
    activities: new Map(),
    metrics: new Map(),
    lastUpdated: new Date(0) // Initialize to epoch
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface TaxonomyEntry {
    name: string;
    count: number;
    lastUsed: Date;
}

interface Taxonomy {
    activities: TaxonomyEntry[];
    metrics: TaxonomyEntry[];
    timestamp: Date;
}

export async function updateTaxonomy(insight: InsightResult): Promise<void> {
    const now = new Date();

    // Update activity
    if (insight.activity) {
        const activityStats = cache.activities.get(insight.activity) || { count: 0, lastUsed: now };
        cache.activities.set(insight.activity, {
            count: activityStats.count + 1,
            lastUsed: now
        });
    }

    // Update metrics
    for (const metric of insight.metrics) {
        const metricStats = cache.metrics.get(metric.type) || { count: 0, lastUsed: now };
        cache.metrics.set(metric.type, {
            count: metricStats.count + 1,
            lastUsed: now
        });
    }

    cache.lastUpdated = now;
}

export async function getTaxonomy(): Promise<Taxonomy> {
    const now = new Date();

    // If cache is fresh, use it
    if (now.getTime() - cache.lastUpdated.getTime() < CACHE_TTL) {
        return {
            activities: Array.from(cache.activities.entries()).map(([name, stats]) => ({
                name,
                count: stats.count,
                lastUsed: stats.lastUsed
            })).sort((a, b) => b.count - a.count || b.lastUsed.getTime() - a.lastUsed.getTime()),
            metrics: Array.from(cache.metrics.entries()).map(([name, stats]) => ({
                name,
                count: stats.count,
                lastUsed: stats.lastUsed
            })).sort((a, b) => b.count - a.count || b.lastUsed.getTime() - a.lastUsed.getTime()),
            timestamp: cache.lastUpdated
        };
    }

    // Cache is stale, rebuild from database
    const entries = await prisma.diary.findMany({
        select: {
            insights: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Clear cache
    cache.activities.clear();
    cache.metrics.clear();

    // Process entries
    for (const entry of entries) {
        try {
            const insight: InsightResult = JSON.parse(entry.insights);
            if (insight.activity) {
                const stats = cache.activities.get(insight.activity) || { count: 0, lastUsed: entry.createdAt };
                cache.activities.set(insight.activity, {
                    count: stats.count + 1,
                    lastUsed: stats.lastUsed > entry.createdAt ? stats.lastUsed : entry.createdAt
                });
            }

            for (const metric of insight.metrics) {
                const stats = cache.metrics.get(metric.type) || { count: 0, lastUsed: entry.createdAt };
                cache.metrics.set(metric.type, {
                    count: stats.count + 1,
                    lastUsed: stats.lastUsed > entry.createdAt ? stats.lastUsed : entry.createdAt
                });
            }
        } catch (error) {
            console.error('Failed to parse insights:', error);
            continue;
        }
    }

    cache.lastUpdated = now;

    return {
        activities: Array.from(cache.activities.entries()).map(([name, stats]) => ({
            name,
            count: stats.count,
            lastUsed: stats.lastUsed
        })).sort((a, b) => b.count - a.count || b.lastUsed.getTime() - a.lastUsed.getTime()),
        metrics: Array.from(cache.metrics.entries()).map(([name, stats]) => ({
            name,
            count: stats.count,
            lastUsed: stats.lastUsed
        })).sort((a, b) => b.count - a.count || b.lastUsed.getTime() - a.lastUsed.getTime()),
        timestamp: now
    };
}

export function formatTaxonomyContext(taxonomy: Taxonomy): string {
    const topActivities = taxonomy.activities
        .slice(0, 10)
        .map(a => `${a.name} (used ${a.count} times)`)
        .join(', ');

    const topMetrics = taxonomy.metrics
        .slice(0, 10)
        .map(m => `${m.name} (used ${m.count} times)`)
        .join(', ');

    return `Common activities: ${topActivities || 'none yet'}\nCommon metrics: ${topMetrics || 'none yet'}`;
} 