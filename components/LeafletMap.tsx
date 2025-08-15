"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// @ts-ignore - library has no types by default
import MarkerClusterGroup from 'react-leaflet-cluster';
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
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        iconCreateFunction={(cluster) => {
          const count = cluster.getChildCount();
          // Derive a color from the majority day among child markers if available
          // Fallback to gray.
          let color = '#6b7280';
          try {
            const markers = cluster.getAllChildMarkers() as any[];
            const dayCount: Record<number, number> = {};
            markers.forEach((m: any) => {
              const d = m?.options?.day as number | undefined;
              if (typeof d === 'number') dayCount[d] = (dayCount[d] || 0) + 1;
            });
            const top = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
            if (top) color = dayColors[Number(top[0])] || color;
          } catch {}
          const html = `<div style="background:${color};color:#fff;border-radius:9999px;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.15);">${count}</div>`;
          return new L.DivIcon({ html, className: 'cluster-icon', iconSize: [36, 36] });
        }}
      >
        {spots.map((s) => (
          <Marker key={s.slug} position={[s.lat, s.lng]} {...{ day: s.day }}>
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
      </MarkerClusterGroup>
    </MapContainer>
  );
}
