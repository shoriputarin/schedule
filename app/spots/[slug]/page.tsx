import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
export const runtime = 'nodejs';

type Media = { type: 'image' | 'youtube' | 'url'; src: string; title?: string; alt: string };
type Spot = {
  slug: string;
  name_ja: string;
  name_en: string;
  day: number;
  lat: number;
  lng: number;
  summary_ja: string;
  summary_en: string;
  media: Media[];
};

const spotsDir = path.join(process.cwd(), 'content', 'spots');

export async function generateStaticParams() {
  const files = fs.readdirSync(spotsDir).filter(f => f.endsWith('.json'));
  return files.map(f => ({ slug: f.replace(/\.json$/, '') }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const file = path.join(spotsDir, `${params.slug}.json`);
  const spot = JSON.parse(fs.readFileSync(file, 'utf8')) as Spot;
  return {
    title: `${spot.name_ja} / ${spot.name_en} | Romania Trip`,
    description: spot.summary_ja,
  };
}

export default function SpotPage({ params }: { params: { slug: string } }) {
  const file = path.join(spotsDir, `${params.slug}.json`);
  const spot = JSON.parse(fs.readFileSync(file, 'utf8')) as Spot;

  const publicDir = path.join(process.cwd(), 'public');
  const resolvedMedia = spot.media?.map((m) => {
    if (m.type !== 'image') return m;
    const src = m.src.startsWith('/') ? m.src : `/${m.src}`;
    const rel = src.replace(/^\//, '');
    const target = path.join(publicDir, rel);
    if (!fs.existsSync(target)) {
      return { ...m, src: '/images/placeholder.svg' };
    }
    return { ...m, src };
  }) ?? [];

  return (
    <main className="p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{spot.name_ja} / {spot.name_en}</h1>
        <p className="text-gray-600">Day {spot.day} — ({spot.lat}, {spot.lng})</p>
        <p>{spot.summary_ja}</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {resolvedMedia.map((m, idx) => {
          if (m.type === 'image') {
            const isSvg = m.src.toLowerCase().endsWith('.svg');
            return (
              <figure key={idx} className="rounded border p-2 bg-white">
                {isSvg ? (
                  <img src={m.src} alt={m.alt} width={800} height={450} className="w-full h-auto rounded" />
                ) : (
                  <Image src={m.src} alt={m.alt} width={800} height={450} className="w-full h-auto rounded" />
                )}
                {m.title ? <figcaption className="text-sm text-gray-600 mt-1">{m.title}</figcaption> : null}
              </figure>
            );
          }
          if (m.type === 'youtube') {
            return (
              <div key={idx} className="rounded border p-2">
                <a className="text-blue-600 underline" href={`https://www.youtube-nocookie.com/embed/${m.src}`} target="_blank" rel="noopener noreferrer">YouTubeを見る</a>
              </div>
            );
          }
          return (
            <div key={idx} className="rounded border p-2">
              <a className="text-blue-600 underline" href={m.src} target="_blank" rel="noopener noreferrer">{m.title || m.src}</a>
            </div>
          );
        })}
      </section>
    </main>
  );
}
