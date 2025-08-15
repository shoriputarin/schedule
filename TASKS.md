# 作業タスク一覧（進行管理）

このファイルは、実行順序を忘れないためのタスクリストです。完了したらチェックを付け、必要に応じて更新します。

## 現在のフェーズ
- [x] リポジトリ初期化と初回コミット（README）
- [x] ドキュメント整備（AGENT.md v2.1、PRテンプレ、.env.example）
- [x] Node/Next.js向け `.gitignore` の追加（完了）
- [x] コンテンツ雛形の作成（`content/spots`, `content/itinerary` サンプル）
- [x] データ検証の下準備（簡易バリデータ追加 / Zodは後続）
- [x] Next.js 初期セットアップ（TypeScript, Tailwind など）

## 実行順序（MVPまで）
1. Node/Next.js 用 `.gitignore` を追加する（完了）
2. `content/` ディレクトリとサンプルJSONを作成する（完了）
3. 検証スクリプトを用意する（完了：簡易版、Zod導入は後続）
4. Next.js プロジェクトをセットアップする（完了）
5. 依存をインストールする（npm/pnpm）
6. Leaflet関連パッケージを導入する（`leaflet`, `react-leaflet`, `react-leaflet-cluster`）
7. マップコンポーネントを追加し、ホーム(`/`)にスポットのピンを表示する
8. `next-sitemap` 追加と設定（sitemap/robots生成）【完了】
9. CI（GitHub Actions）で type-check/build/validate 実行を追加【完了】
10. Zodスキーマ導入（簡易バリデータから置換）【完了】
11. 画像最適化: Next.js の推奨パッケージ `sharp` を導入する（本番最適化向け）【完了】
12. スポット詳細で `media[]` を表示（`next/image` を使用し、プレースホルダにフォールバック）
12.1. カスタムマーカーアイコン（Day色のピン）を作成して実装【完了】
13. 各ルートの `metadata` を整備（title/description）【完了（ホーム/日別/スポット）】
15. ルーティング整備: `app/itinerary/day-[day]` → `app/itinerary/[day]` に修正【完了】
14. GitHub Variables に `NEXT_PUBLIC_SITE_URL` を設定（CIのsitemap用）
16. プレビュー環境のインデックス制御（`X-Robots-Tag: noindex, nofollow` を付与）【完了】

必要に応じて、このファイルに追記・更新していきます。
