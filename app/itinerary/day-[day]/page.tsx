import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
export const runtime = 'nodejs';

type Itinerary = {
  day: number;
  title_ja: string;
  title_en: string;
  order: string[];
};

const itinDir = path.join(process.cwd(), 'content', 'itinerary');

export async function generateStaticParams() {
  const files = fs.readdirSync(itinDir).filter(f => f.endsWith('.json'));
  return files.map(f => ({ day: f.replace(/^day-(\d+)\.json$/, '$1') }));
}

export default function ItineraryDayPage({ params }: { params: { day: string } }) {
  const file = path.join(itinDir, `day-${params.day}.json`);
  const itin = JSON.parse(fs.readFileSync(file, 'utf8')) as Itinerary;
  return (
    <main className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">Day {itin.day}: {itin.title_ja}</h1>
      <h2 className="font-semibold">訪問順</h2>
      <ol className="list-decimal pl-6">
        {itin.order.map(slug => (
          <li key={slug}><a className="text-blue-600 underline" href={`/spots/${slug}`}>{slug}</a></li>
        ))}
      </ol>
    </main>
  );
}

export function generateMetadata({ params }: { params: { day: string } }): Metadata {
  const file = path.join(itinDir, `day-${params.day}.json`);
  const j = JSON.parse(fs.readFileSync(file, 'utf8')) as { title_ja: string };
  return {
    title: `Day ${params.day}: ${j.title_ja} | Itinerary`,
    description: `Day ${params.day} の行程ページです。訪問順とリンクを確認できます。`,
  };
}
