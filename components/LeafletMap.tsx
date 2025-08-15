"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
// Ensure default icon works in Next.js by explicitly setting URLs
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

type SpotPin = {
  slug: string;
  name_ja: string;
  lat: number;
  lng: number;
  day: number;
};

function getTileUrl() {
  const envUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL;
  if (envUrl && envUrl.length > 0) return envUrl;
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

const dayColors: Record<number, string> = {
  1: '#ef4444', // red
  2: '#3b82f6', // blue
  3: '#22c55e', // green
};

export default function LeafletMap({ spots }: { spots: SpotPin[] }) {
  // Romania approximate center
  const center: [number, number] = [45.9432, 24.9668];
  const zoom = 6;
  const tileUrl = getTileUrl();

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '70vh', width: '100%' }}>
      <TileLayer url={tileUrl} attribution='&copy; OpenStreetMap contributors' />
      {spots.map((s) => (
        <Marker key={s.slug} position={[s.lat, s.lng]}>
          <Popup>
            <div>
              <strong>{s.name_ja}</strong>
              <div>
                <a className="text-blue-600 underline" href={`/spots/${s.slug}`}>詳細を見る</a>
              </div>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: dayColors[s.day] || '#6b7280',
                  color: '#fff',
                  fontSize: 12,
                }}
              >
                Day {s.day}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

