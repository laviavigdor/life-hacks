import { DiaryInput } from '@/components/DiaryInput';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto pb-24">
        {/* Diary entries will be listed here */}
      </div>
      <DiaryInput />
    </main>
  );
}
