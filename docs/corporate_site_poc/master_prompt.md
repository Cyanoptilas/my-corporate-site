# マスタープロンプトの再構築 (Prompt Engineering)

これまでの作業（初期立ち上げ〜microCMS連携〜デザイン・アニメーション強化〜Cloudflareへのデプロイ・修正）のすべてのコンテキストを含んだ**「一発で今の完成形に近い状態を作れるプロンプト」**を作成しました。

今後、似たようなプロジェクトを立ち上げる際は、以下のプロンプトをAI（Cursor, GitHub Copilot, Gemini等）に渡すことで、今回苦労したポイントを最初からクリアした状態で開発をスタートできます。

---

## 📝 改良版マスタープロンプト（コピーしてご使用ください）

```markdown
あなたはプロのフロントエンドエンジニアであり、モダンなWeb技術に精通したテクニカルアーキテクトです。
以下の要件に従って、コーポレートサイトのプロジェクトセットアップから必要機能の実装までを行ってください。

### 1. テクノロジースタック
- **フレームワーク**: Astro v5
- **レンダリングモード**: `output: 'server'` または `hybrid` (Cloudflare Pages Functionsを使用するため)
- **スタイリング**: Tailwind CSS v4 (Astro v5のViteプラグイン方式 `@tailwindcss/vite` を使用)
- **ヘッドレスCMS**: microCMS (microcms-js-sdkを使用)
- **ホスティング/デプロイ**: Cloudflare Pages
- **言語**: TypeScript

### 2. プロジェクトの基本方針
- **Zero JSベース**: 基本的にAstroの強みを活かし、クライアントサイドのJavaScriptは極力排除してサイトを爆速にする。
- **リッチなUI/UX**: ただし、スクロール連動のフェードインアニメーション(`IntersectionObserver`使用)や、ホバー時の画像ズーム等、Vanilla JSとTailwindを組み合わせた軽量かつリッチな演出を入れること。
- **デザインテイスト**: 白・黒・グレーを基調としたミニマルなデザイン。アクセントカラーとしてオレンジ(`text-brand-orange`)とイエローを追加し、大きめのタイポグラフィ（`text-6xl`, `text-9xl`等）を大胆に配置した重厚感のある見せ方にする。
- **透明/半透明ヘッダー**: ヘッダーは画面上部に固定(`fixed`)し、スクロール時に背面がぼやけて透けるすりガラス調（`bg-white/90 backdrop-blur-md`）にして文字の視認性を担保する。

### 3. 実装するべき機能・ページ構造
- **`/` (トップページ)**:
  - Hero（全画面に近い巨大テキストエリア）
  - Services（提供サービス一覧）
  - About Us（企業概要）
  - Latest News（microCMSから取得した最新のお知らせを最大3件表示）
- **`/news/[...page].astro` (お知らせ一覧ページ)**:
  - microCMSの `news` エンドポイントからデータを取得。
  - 1ページ9件のページネーションを実装。
  - 1カラム〜3カラムのレスポンシブなグリッドカードレイアウト。
  - アイキャッチ画像(`eyecatch`)とカテゴリ名(`category`)のバッジを表示。
- **`/news/[id].astro` (お知らせ詳細ページ)**:
  - SSRまたはビルド時生成(SSG)にて記事詳細を表示。
  - `prose` (Tailwind Typography)の代わりに、カスタムCSSや独自のスタイルクラスを当ててリッチな本文表示を実装する。
- **`/contact.astro` (お問い合わせページ)**:
  - Tailwindでスタイリングされたフォーム（Name, Email, Subject, Message）。
- **`functions/api/submit.ts` (お問い合わせAPI)**:
  - Cloudflare Pages FunctionsのAPIルート。
  - フロントのフォームからPOSTされたデータを受け取り、**microCMSの `contacts` エンドポイントへ直接POSTして保存**する。
  - 処理中はボタンを「Sending...」にし、完了後にフィードバックメッセージを出すVanilla JSをフロント側に実装する。

### 4. 開発時の注意点・アンチパターン（絶対守ること）
1. **Tailwind v4の仕様**: `tailwind.config.mjs` は使用せず、`global.css` に `@import "tailwindcss";` および `@theme` ブロックを記述してカスタムカラー（`--color-brand-orange`など）を定義すること。
2. **Cloudflare Functionsのローカル起動**: Astroの標準コマンド `npm run dev` では `functions/` 配下のAPIは動かない。APIのローカルテストや実装を行う際は、必ずビルド手順を挟み `npx wrangler pages dev dist` を使用して確認を促すこと。
3. **環境変数（Cloudflare）**: APIキー(`MICROCMS_API_KEY`)やドメイン(`MICROCMS_SERVICE_DOMAIN`)は、Cloudflareダッシュボードで**「シークレット」ではなく「テキスト（プレーンテキスト）」**として登録することを前提とする（ビルド時SSGでデータをfetchするため）。
4. **型定義**: microCMSから取得するデータ(`News`など)は明示的にTypeScriptの型を定義し、型安全な実装を心がけること。

上記の要件をもとに構成案、必要なコマンド、そして主要なファイルの実装コードを提示してください。
```

---

## このプロンプトのポイント

1. **Tailwind CSS v4 への対応**: 初期に発生した「Astro v5 + Tailwind v4」の設定や `global.css` への記述の罠を最初から回避するように指示しています。
2. **Cloudflare と Astro の連携の落とし穴**: 「`npm run dev` では APIが動かない」「環境変数をシークレットにするとビルドでコケる」という、**今回実際に遭遇して解決したバグ情報**を「アンチパターン」としてAIに事前学習させています。
3. **microCMS x Cloudflare Functions の構成**: ただの「お問い合わせフォーム」ではなく、「Functionsを経由してmicroCMSへデータを貯める」という具体的なアーキテクチャまで指定しています。
4. **デザインとアニメーションのテイスト**: 「ただ作る」だけでなく「すりガラスのヘッダー」「大きな文字」「スクロールアニメーション」といった具体的な UI/UX の要望を最初から盛り込んでいます。

このプロンプトをベースにすれば、次回以降は「初期セットアップ〜バグの解決〜デザイン調整」の手間がほとんど省け、よりスムーズに開発がスタートできるはずです！
