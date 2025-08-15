export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ルーマニア旅行マップ（MVP）</h1>
      <p className="text-gray-600">Next.js 初期セットアップ完了。地図とデータ連携はこの後実装します。</p>
      <ul className="list-disc pl-6">
        <li>スポット詳細: /spots/[slug]</li>
        <li>日別行程: /itinerary/day-[n]</li>
      </ul>
    </main>
  );
}

