# PoC コーポレートサイト 開発・デプロイ手順書

このドキュメントは、microCMS + Astro + Cloudflare Pages を使用したコーポレートサイトのセットアップ、開発、デプロイプロセスについて説明します。

## 1. プロジェクト構造

```bash
.
├── functions/              # Cloudflare Pages Functions
│   └── api/
│       └── submit.ts       # お問い合わせフォームのハンドラー
├── public/                 # 静的アセット
├── src/
│   ├── components/         # 共通UIコンポーネント
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── layouts/            # ページレイアウト
│   │   └── Layout.astro    # View Transitions を含むメインレイアウト
│   ├── lib/
│   │   └── microcms.ts     # microCMS SDK クライアントと型定義
│   ├── pages/
│   │   ├── index.astro     # トップページ
│   │   ├── contact.astro   # お問い合わせページ
│   │   └── news/
│   │       ├── [id].astro     # ニュース詳細ページ
│   │       └── [...page].astro # ニュース一覧ページ (ページネーション対応)
│   └── styles/
│       └── global.css      # Tailwind テーマ設定とグローバルスタイル
├── astro.config.mjs        # Astro の設定ファイル
├── package.json
└── tsconfig.json
```

## 2. 環境構築

### 2.1 microCMS の設定
1. [microCMS](https://microcms.io/) でサービスを作成します。
2. `news` という名前のAPIエンドポイントを作成します。
3. 以下のAPIスキーマを設定します:
   - `title` (テキスト, 必須)
   - `content` (リッチエディタ, 必須)
   - `publishedAt` (日時, 必須 - *システムのデフォルトフィールド*)
   - `category` (コンテンツ参照 -> 先に `categories` API を作成 [名前: テキスト]) - *任意*
   - `eyecatch` (画像) - *任意*
4. **追加のAPIエンドポイント**: お問い合わせ受信用に `contacts` という名前のAPIエンドポイントを作成します（POSTができるようにリスト形式等で作成し、権限でPOSTを許可してください）。
   - `name` (テキスト, 必須)
   - `email` (テキスト, 必須)
   - `subject` (テキスト, 必須)
   - `message` (テキストエリア, 必須)

### 2.2 ローカル開発環境
プロジェクトのルートディレクトリに `.env` ファイルを作成します:

```bash
MICROCMS_SERVICE_DOMAIN=あなたのサービスドメイン
MICROCMS_API_KEY=あなたのAPIキー
```

開発サーバーを起動します:

```bash
npm run dev
```

ブラウザで `http://localhost:4321` にアクセスしてページのデザインやルーティングを確認します。

> [!WARNING]
> **API (`functions/`) のローカルテストについて**
> `npm run dev` (Astro の標準開発サーバー) では、Cloudflare 専用の `functions/` フォルダ内の API (お問い合わせフォームなど) は動作せず、`404 Not Found` エラーになります。
> 
> お問い合わせフォームの送信テスト等を行う場合は、一度ビルドしてから Cloudflare のローカルシミュレーターである Wrangler を使用して起動する必要があります。
> ```bash
> npm run build
> npx wrangler pages dev dist
> ```
> 上記コマンドを実行後、表示された URL (通常は `http://127.0.0.1:8788`) にアクセスしてフォームをテストしてください。

## 3. デプロイメント (Cloudflare Pages)

このプロジェクトは `@astrojs/cloudflare` アダプターを使用するように設定されています。

### 3.1 Cloudflare Pages への接続
1. このリポジトリを GitHub / GitLab にプッシュします。
2. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) にログインし、**Account Home** > **Workers & Pages** に移動します。
3. **アプリケーションの作成** > **Pages** > **Git に接続** をクリックします。
4. 対象のリポジトリを選択します。

### 3.2 ビルド設定
Cloudflare は自動的に Astro を検出するはずですが、以下の設定を確認してください:

- **フレームワークプリセット**: Astro
- **ビルドコマンド**: `npm run build`
- **ビルド出力ディレクトリ**: `dist`
- **Node.js**: ビルド時に Node のバージョンエラーが出る場合は、環境変数 `NODE_VERSION` を `20`（または使用しているバージョン）に設定してください。

### 3.3 環境変数 (本番環境)
Cloudflare Pages の設定画面（設定 > 環境変数）で、`.env` ファイルと同じキーを追加します:

- `MICROCMS_SERVICE_DOMAIN`
- `MICROCMS_API_KEY`

### 3.4 Functions (API機能)
Cloudflare Pages は自動的に `functions/` ディレクトリを検出します。APIを機能させるための追加設定は不要です。お問い合わせフォームは `/api/submit` に送信されます。

### 3.5 Webhook の設定 (コンテンツ更新時の自動デプロイ)
このプロジェクトは SSG (静的サイト生成) で構築されているため、microCMS 側でコンテンツ（ニュース等）を更新しただけではサイトに反映されません。
コンテンツの更新に合わせて自動的にビルドを走らせるために、以下の Webhook 設定を行ってください。

1. **Cloudflare 側の設定**:
   - Cloudflare の「Pages プロジェクト」 > 「設定」 > **「ビルドとデプロイ」**の順に開きます。
   - 「デプロイフック (Deploy hooks)」のセクションで `microCMS` 用のフック名を入力し、**「デプロイフックを追加」**をクリックします。
   - 生成された **Webhook URL** をコピーします。
2. **microCMS 側の設定**:
   - microCMS の管理画面右上の **「API設定」** > **「Webhook」** を開きます。
   - 「追加」ボタンから **「カスタムWebhook」** (または Cloudflare Pages) を選択します。
   - 「Webhookの名称」を入力し、「URL」の欄に先ほどコピーした Cloudflare の **Webhook URL** を貼り付けます。
   - 「通知タイミング」で「コンテンツの公開・更新・削除時」にチェックを入れます。
   - 設定を保存し、「手動通知」でデプロイが開始されるかテストします。

## 4. カスタマイズ

- **スタイリング**: `src/styles/global.css` を編集して、テーマの変数（色、フォント）を変更します。
- **アイコン**: ミニマルさを保つため、デフォルトではアイコンライブラリはインストールされていません。直接SVGを使用するか、`astro-icon` をインストールして使用してください。
- **お問い合わせフォーム**: `functions/api/submit.ts` は現在、受信したデータを microCMS の `contacts` エンドポイントへ POST する設定になっています。必要に応じてメール通知（SendGrid等）などの追加連携ロジックをここに記述してください。

## 5. パフォーマンス向上のヒント
- microCMS では `.webp` などの最適化された画像を使用してください。
- Astro の `<Image />` コンポーネントを使用できますが、Astroの画像最適化サービスを使用する場合は（microCMS の CDN に依存しない場合）、外部ドメイン（microCMSのドメイン）の許可設定が必要です。
- 画面遷移を高速化する View Transitions は `Layout.astro` 内の `ClientRouter` により有効化されています。
