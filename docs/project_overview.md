# プロジェクト 概要 (Project Overview)

本プロジェクトは、最新のWebテクノロジーを活用した**コーポレートサイトのPoC（概念実証）版**です。
白と黒を基調としつつ、Orange と Yellow をアクセントに加えた、洗練されたタイポグラフィと余白を活かしたミニマルなデザインを実現しています。

## 1. 使用技術 (Technology Stack)

高いパフォーマンスと開発者体験（DX）、優れた拡張性を目指し、以下の技術スタックを採用しています。

- **フレームワーク**: [Astro](https://astro.build/) (v5)
  - Zero JS アーキテクチャにより超高速な初期読み込みを実現。
  - `ClientRouter` を用いた SPA ライクな滑らかな画面遷移 (View Transitions)。
- **言語**: TypeScript
  - プロジェクト全体での型安全性を確保。
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/) (v4)
  - ユーティリティファーストのアプローチにより、CSS ファイルを肥大化させずに柔軟かつ迅速なレスポンシブデザインを実現。
- **ホスティング・インフラ**: [Cloudflare Pages](https://pages.cloudflare.com/)
  - エッジネットワーク（CDN）ベースの高速な静的サイトホスティング。
- **APIハンドリング**: Cloudflare Pages Functions
  - サーバーレスプラットフォームを活用した、お問い合わせフォームのバックエンド処理。
- **ヘッドレスCMS**: [microCMS](https://microcms.io/)
  - 日本製の使いやすいAPIベースのCMS。お知らせ（News）の管理に使用。
  - 公式 SDK (`microcms-js-sdk`) を用いたデータフェッチの採用。

---

## 2. ディレクトリ・ファイル構成 (Folder/File Structure)

プロジェクトは Astro のベストプラクティスに従い整理されています。

```bash
my-corporate-site/
├── .env.example              # 環境変数のサンプルファイル
├── astro.config.mjs          # Astro本番ビルド・Cloudflare用アダプター設定
├── functions/
│   └── api/
│       └── submit.ts         # 【Pages Functions】フォーム受信用バックエンドAPI
├── docs/                     # ドキュメントディレクトリ（本ファイル、手順書、ログ等）
│   └── corporate_site_poc/   # 開発時のタスクや計画のログ
└── src/
    ├── components/           # UIブロックコンポーネント (Header, Footerなど)
    ├── layouts/              # 共通レイアウトコンポーネント (Layout.astro)
    ├── lib/                  # 外部連携ロジック (microCMS クライアント設定等)
    ├── pages/                # ルーティングに対応するページ群
    │   ├── index.astro       # トップページ (Hero, Services, About, Latest News)
    │   ├── contact.astro     # お問い合わせページ (フォーム画面)
    │   └── news/
    │       ├── [...page].astro # お知らせ一覧ページ (ページネーション対応)
    │       └── [id].astro      # お知らせ詳細ページ (動的ルーティング)
    └── styles/               # グローバルスタイル (Tailwind テーマやフォント定義)
```

---

## 3. 特徴となる機能 (Key Features)

### 3.1 ヘッドレスCMS (microCMS) 連携
`src/lib/microcms.ts` にて公式SDKを導入し、News（お知らせ）機能を柔軟に管理します。
ビルド時にデータをフェッチして静的ページを生成する SSG（Static Site Generation）を採用しており、高いSEO効果と爆速のページロードを実現しています。
- **一覧・ページネーション**：`[...page].astro` により10件毎のページ分割を自動生成。
- **詳細ページ生成**：`[id].astro` により、CMSに登録されたコンテンツIDをベースにした動的ルーティングを構築。

### 3.2 サーバーレスなフォームハンドリング
`functions/api/submit.ts` を用いることで、バックエンドサーバーを自前で用意することなくお問い合わせフォームを設置しています。
Astro の静的ファイルと同じリポジトリ内でAPI関数を管理できるため、フロントエンドとバックエンドのシームレスな開発が可能です。

### 3.3 洗練されたデザインとトランジション
`src/styles/global.css` にてデザインシステム（カラーパレット、フォントファミリー）を集約管理しています。
また、Astro の機能により、ページ間をシームレスに繋ぐ View Transitions を実装し、ネイティブアプリのような滑らかなユーザー体験を提供します。
