# ルーマニア旅行マップ連動サイト 要件定義書 v2.1

## 1. 目的・ゴール

-   既存の旅行ルート地図（ピン付き）から**各スポットの詳細ページ**へ遷移できる、高速でモダンなWebサイトを構築する。
-   スマホ/PCで見やすく、**行程ごと**・**エリアごと**に情報を整理する。
-   日本語と英語に対応し、保守性と拡張性の高い設計とする。

---

## 2. 開発フェーズ

本プロジェクトは以下の3フェーズで開発を進める。

-   **Phase 1 (MVP)**: 基本機能の実装。単一言語（日本語）で、地図と詳細ページ間の連携を確立する。
-   **Phase 2 (機能強化)**: i18n対応、OG画像の動的生成、検索機能、アナリティクス導入。
    -   **i18n URL設計**:
        -   既定ロケール: `ja`（`/` は日本語、英語は `/en`）
        -   ルート: `/{locale}/spots/[slug]`, `/{locale}/itinerary/day-[n]`
        -   フォールバック: `ja -> en`（スポット名やサマリ欠落時は既定ロケールを表示）
        -   メタ/OG: ロケールごとに `title/description` を切替
        -   サイトマップ: ロケール別URLを収録
-   **Phase 3 (高度化)**: 高度な地図機能（経路表示）、PWA対応、CMS連携など。

---

## 3. 技術スタック

-   **フレームワーク**: Next.js 14 (App Router)
-   **言語**: TypeScript
-   **UI**: Tailwind CSS, shadcn/ui
-   **地図**: React Leaflet, Leaflet
-   **地図タイル**: MapTiler or MapLibre (APIキー管理必須)
-   **クラスタリング**: react-leaflet-cluster
-   **データ検証**: Zod
-   **国際化 (i18n)**: next-intl (Phase 2)
-   **OG画像生成**: @vercel/og (Phase 2)
-   **検索**: Fuse.js (Phase 2)
-   **デプロイ**: Vercel
-   **CI/CD**: GitHub Actions
-   **Node**: >= 18.18
-   **パッケージマネージャ**: pnpm（またはnpm）

---

## 4. データ設計と管理

### 4.1. スキーマ定義 (Zod)

-   ビルド前に`spots`と`itinerary`のデータ構造をZodスキーマで検証し、TypeScriptの型を自動生成する。

### 4.2. スポット (`/content/spots/*.json`)

-   **Slug規約**: `^[a-z0-9-]+$` (英小文字, 数字, ハイフン)。永続的なIDとして使用。
-   **構造**:
    ```typescript
    {
      "slug": "bran-castle", // 必須, 一意
      "name_ja": "ブラン城",
      "name_en": "Bran Castle",
      "day": 3, // 必須, 行程日
      "lat": 45.5149, "lng": 25.3672, // 必須, WGS84
      "summary_ja": "ドラキュラ城として知られる有名な城。",
      "summary_en": "A famous castle known as Dracula's Castle.",
      "highlights_ja": ["拷問器具の展示", "隠し階段"],
      "highlights_en": ["Exhibition of torture instruments", "Secret staircase"],
      "media": [
        { "type": "image", "src": "/images/bran-castle/main.jpg", "title": "ブラン城の外観", "alt": "ブラン城の外観の写真" },
        { "type": "youtube", "src": "YOUTUBE_VIDEO_ID", "title": "ブラン城のドローン映像", "alt": "ブラン城の空撮動画" }
      ] // alt は必須
    }
    ```
    -   **命名規約**: 画像は `/public/images/<slug>/...` に配置。
    -   **スラッグ変更禁止**: 公開後はURL互換性維持のため`slug`の変更を禁止。

### 4.3. 行程 (`/content/itinerary/*.json`)

-   **参照整合性**: `order`配列内の`slug`は、ビルド時に`spots`データ内に存在するかを検証する。
-   **構造**:
    ```typescript
    {
      "day": 1,
      "title_ja": "ブカレスト到着日",
      "title_en": "Arrival in Bucharest",
      "order": ["bucharest-old-town", "palace-of-parliament"], // slugの配列
      "route": { // 任意: GeoJSON LineString (WGS84, [lng, lat])
        "type": "LineString",
        "coordinates": [[26.1025, 44.4268], [25.3672, 45.5149]]
      }
    }
    ```
    -   **ファイル命名**: `content/itinerary/day-<n>.json` に統一。

---

## 5. 機能要件 (Phase 1: MVP)

### 5.0. ホームページ (`/`)

-   初期表示で全スポットの地図を表示（高さ 60–70vh）。
-   日別フィルタ（Dayタグ: 1=赤, 2=青, 3=緑）。
-   スポット一覧（カード/テーブル）へのリンク。

### 5.1. マップ

-   **技術**: `react-leaflet`をクライアントコンポーネントとして動的インポート (`ssr: false`) する。
-   **CSS**: `app/layout.tsx` で `import 'leaflet/dist/leaflet.css'` を読み込む。
-   **タイル**: MapTiler等の外部タイルを利用。**ライセンスと帰属表示を地図右下に必須**で表示する。
-   **ピン**: 全スポットを行程日(`day`)ごとに色分けして表示。
-   **クラスタリング**: `react-leaflet-cluster`を使用。ズームアウトするとピンをまとめ、クリックでズームインする。クラスタのアイコンもDay色を反映させる。既定設定例: `maxZoom=14`, `radius=50`。
-   **操作性**: ピンチズーム可。スクロールホイールでのズームは地図フォーカス時のみ有効化を推奨。
-   **フォールバック**: 地図読み込み失敗時は、静的画像とスポット一覧を表示する。
-   **タイルキー運用**: `NEXT_PUBLIC_MAP_TILE_URL` と `NEXT_PUBLIC_MAP_TILE_KEY` を使用。キー未設定時はOSM標準タイルにフォールバックし、適切な帰属を表示。

### 5.2. ルーティングとページ

-   **URL構造**: `/`, `/spots/[slug]`, `/itinerary/day-[n]` (MVPでは単一言語)
-   **静的生成 (SSG)**: 全ページをビルド時に静的生成し、高速表示を実現。
-   **スポット詳細ページ**: `/spots/[slug]`
    -   スポット情報（名称、写真、見どころ等）を表示。
    -   そのスポットを中心としたミニマップを埋め込み。
-   **日別行程ページ**: `/itinerary/day-[n]`
    -   その日の訪問スポットを`order`順に一覧表示。
    -   (任意) `route`ポリラインを地図上に表示。

---

## 6. 非機能要件

### 6.1. パフォーマンス

-   **目標**: LCP < 2.5s, CLS < 0.1, First Load JS < 300KB (MVP)。
-   **画像最適化**: `next/image`を必須とし、適切な`width/quality`を設定。

### 6.2. セキュリティ

-   **環境変数**: `NEXT_PUBLIC_MAP_TILE_URL`, `NEXT_PUBLIC_MAP_TILE_KEY` 等の秘密情報は`.env.local`で管理し、Gitに含めない。
-   **CSP (Content Security Policy)**: 画像、YouTube、地図タイルの許可ドメインを明記したCSPヘッダーを設定。
    -   例: `img-src 'self' https://*.tile.openstreetmap.org https://api.maptiler.com; frame-src https://www.youtube-nocookie.com;` など。
-   **外部埋め込み**: YouTubeは `youtube-nocookie.com` を使用。外部リンクは `rel="noopener noreferrer"` を付与。

### 6.3. 運用 (CI/CD)

-   **ワークフロー**: GitHub Actionsを利用。
    -   Pull Request時に`lint`, `type-check`, `build`を自動実行。
    -   Vercelと連携し、プレビューURLを自動生成。
-   **ブランチ**: `main`ブランチを保護し、直接のpushを禁止。PR経由でのマージを必須とする。
    -   **PR運用**: `content/` 変更時はPRテンプレートのチェックリスト（Zod検証通過、画像パス存在、media.alt必須）を満たす。

### 6.4. SEO / サイトマップ

-   `next-sitemap` 等で `sitemap.xml` と `robots.txt` を自動生成。
-   各ページに固有の `title/description` を設定し、OG画像を用意（Phase 2で動的化）。

### 6.5. プレビュー環境のインデックス制御

-   `VERCEL_ENV=preview` のときは `noindex, nofollow` を適用。本番のみインデックス許可。

---

## 7. 受け入れ基準 (Phase 1: MVP)

-   [ ] **地図**:
    -   [ ] ホームページにLeaflet地図が表示される。
    -   [ ] `spots`データに基づき、全スポットが色分けされたピンで表示される。
    -   [ ] 地図をズームアウトすると、ピンがクラスタリングされる。
    -   [ ] ピンまたはクラスタをクリックすると、適切なスポット詳細ページに遷移するか、ズームインする。
    -   [ ] 地図の右下にタイル提供元の帰属情報が表示される。
-   [ ] **ページ**:
    -   [ ] ホーム(`/`)で日別フィルタが機能し、主要導線が確認できる。
    -   [ ] 各スポットの詳細ページ (`/spots/[slug]`) が静的生成される。
    -   [ ] 各行程日の詳細ページ (`/itinerary/day-[n]`) が静的生成される。
    -   [ ] スマホ表示でレイアウトが崩れない。
-   [ ] **開発プロセス**:
    -   [ ] Zodによるデータスキーマ検証がビルド時に実行される。
    -   [ ] PR時にCIが実行され、Vercelプレビューが生成される。
    -   [ ] `main`ブランチは保護されている。
    -   [ ] `itinerary.order` 内の各`slug`は `spots` に存在し、欠損時はビルドが失敗する。
    -   [ ] 全ての `media` に `alt` が存在する。
    -   [ ] `sitemap.xml` と `robots.txt` が生成される。
