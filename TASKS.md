# 作業タスク一覧（進行管理）

このファイルは、実行順序を忘れないためのタスクリストです。完了したらチェックを付け、必要に応じて更新します。

## 現在のフェーズ
- [x] リポジトリ初期化と初回コミット（README）
- [x] ドキュメント整備（AGENT.md v2.1、PRテンプレ、.env.example）
- [ ] Node/Next.js向け `.gitignore` の追加（実行中）
- [ ] コンテンツ雛形の作成（`content/spots`, `content/itinerary` サンプル）
- [ ] データ検証の下準備（Zodスキーマと検証スクリプト）
- [ ] Next.js 初期セットアップ（TypeScript, Tailwind など）

## 実行順序（MVPまで）
1. Node/Next.js 用 `.gitignore` を追加する
2. `content/` ディレクトリとサンプルJSONを作成する
3. Zod スキーマと検証スクリプトを用意する
4. Next.js プロジェクトをセットアップする（依存導入）
5. 最小の地図ページ（ホーム）と詳細/日別行程のスタブを作る
6. CI で lint/type-check/build を回す

必要に応じて、このファイルに追記・更新していきます。

