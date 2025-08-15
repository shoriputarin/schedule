import fs from 'node:fs';
import path from 'node:path';

type Spot = {
  slug: string;
  name_ja: string;
  name_en: string;
  day: number;
  lat: number;
  lng: number;
  summary_ja: string;
  summary_en: string;
};

const spotsDir = path.join(process.cwd(), 'content', 'spots');

export async function generateStaticParams() {
  const files = fs.readdirSync(spotsDir).filter(f => f.endsWith('.json'));
  return files.map(f => ({ slug: f.replace(/\.json$/, '') }));
}

export default function SpotPage({ params }: { params: { slug: string } }) {
  const file = path.join(spotsDir, `${params.slug}.json`);
  const spot = JSON.parse(fs.readFileSync(file, 'utf8')) as Spot;
  return (
    <main className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">{spot.name_ja} / {spot.name_en}</h1>
      <p className="text-gray-600">Day {spot.day} — ({spot.lat}, {spot.lng})</p>
      <p>{spot.summary_ja}</p>
    </main>
  );
}

