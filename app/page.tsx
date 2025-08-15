import fs from 'node:fs';
import path from 'node:path';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

type Spot = {
  slug: string;
  name_ja: string;
  day: number;
  lat: number;
  lng: number;
};

export default function HomePage() {
  const spotsDir = path.join(process.cwd(), 'content', 'spots');
  const files = fs.readdirSync(spotsDir).filter((f) => f.endsWith('.json'));
  const spots: Spot[] = files.map((f) => {
    const j = JSON.parse(fs.readFileSync(path.join(spotsDir, f), 'utf8')) as any;
    return { slug: j.slug, name_ja: j.name_ja, day: j.day, lat: j.lat, lng: j.lng };
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ルーマニア旅行マップ（MVP）</h1>
      <LeafletMap spots={spots} />
    </main>
  );
}
