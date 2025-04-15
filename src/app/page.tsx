import { DiaryInput } from '@/components/DiaryInput';
import { NumericDisplay } from '@/components/metrics/NumericDisplay';
import { EntryList } from '@/components/metrics/EntryList';
import { LineChart } from '@/components/metrics/LineChart';
import { PrismaClient } from '@prisma/client';
import { InsightResult } from '@/types/metrics';
import { MonthlyMetrics } from '@/components/metrics/MonthlyMetrics';

// This ensures we don't reuse the same Prisma instance across requests
const prisma = new PrismaClient();

// Ensure this page is dynamically rendered and revalidated
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLatestEntries() {
  return await prisma.diary.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });
}

async function getMetricSummary(metricType: string) {
  const entries = await prisma.diary.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  });

  const values: number[] = [];
  const chartData: { timestamp: string; value: number; }[] = [];

  for (const entry of entries) {
    try {
      const insights: InsightResult = JSON.parse(entry.insights);
      const metric = insights.metrics?.find(m => m.type === metricType);
      if (metric?.value && typeof metric.value === 'number') {
        values.push(metric.value);
        chartData.push({
          timestamp: entry.createdAt.toISOString(),
          value: metric.value
        });
      }
    } catch (error) {
      console.error('Failed to parse insights:', error);
    }
  }

  const average = values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : null;

  const trend = values.length >= 2
    ? values[0] > values[1] ? 'up'
      : values[0] < values[1] ? 'down'
        : 'neutral'
    : 'neutral';

  return {
    latest: values[0] ?? null,
    average,
    trend: trend as 'up' | 'down' | 'neutral',
    chartData: chartData.reverse()
  };
}

export default async function Home() {
  const entries = await getLatestEntries();
  const distanceMetrics = await getMetricSummary('distance');

  const formattedEntries = entries.map(entry => ({
    id: entry.id,
    entry: entry.entry,
    insights: entry.insights,
    created_at: entry.createdAt.toISOString()
  }));

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <NumericDisplay
            label="Latest Distance"
            value={distanceMetrics.latest}
            unit="km"
            trend={distanceMetrics.trend}
          />
          <NumericDisplay
            label="Average Distance"
            value={distanceMetrics.average?.toFixed(1) ?? null}
            unit="km"
          />
          <NumericDisplay
            label="Total Activities"
            value={entries.length}
            trend="neutral"
          />
        </div>

        <div className="mb-6">
          <LineChart
            data={distanceMetrics.chartData}
            label="Distance Over Time"
            unit="km"
          />
        </div>

        <EntryList entries={formattedEntries} />

        {/* Monthly Metrics Overview */}
        <section className="mt-8">
          <MonthlyMetrics />
        </section>
      </div>
      <DiaryInput />
    </main>
  );
}
