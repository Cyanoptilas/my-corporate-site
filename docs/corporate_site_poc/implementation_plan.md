# お問い合わせフォームの microCMS 連携計画

## 目的 (Goal)
現在、コンソールへのログ出力のみとなっているお問い合わせフォームのデータを、実際に microCMS の指定エンドポイント（`contacts` 等）へ POST し、管理画面内で問い合わせ内容を確認・保存できるようにする。これに伴い、設計ドキュメントやデプロイ手順書も最新の実装内容に合わせて更新する。

## Proposed Changes (変更予定)

### バックエンドAPIの実装
#### [MODIFY] [submit.ts](file:///c:/Development/my-corporate-site/functions/api/submit.ts)
- `fetch` を使用して microCMS の `POST` API を呼び出し、バリデーションを経た `name`, `email`, `subject`, `message` の各データを送信する処理を追加します。
- `X-MICROCMS-API-KEY` ヘッダーを用いて認証を行います。
- APIキーとサービスドメインは、環境変数から取得します（※Cloudflare Pages環境では `context.env.MICROCMS_API_KEY` のように取得する必要があります）。

### ドキュメントの更新
#### [MODIFY] [deployment_guide.md](file:///c:/Development/my-corporate-site/docs/deployment_guide.md)
- 「2.1 microCMS の設定」セクションに、新しく作成する `contacts` (お問い合わせ用) スキーマ（名前、メールアドレス、件名、本文）の作成手順を追記します。
- 「4. カスタマイズ」セクションなどにある「現在はログ出力のみ」という記述を削除・修正します。

#### [MODIFY] [project_overview.md](file:///c:/Development/my-corporate-site/docs/project_overview.md)
- 「3.2 サーバーレスなフォームハンドリング」の項目を、フォームの送信内容が直接 microCMS 内部へ蓄積される（データベース等を用意せずCMSで一元管理される）アーキテクチャである旨の内容に更新します。

### アーティファクトの保存
- ユーザールールに従い、変更が完了したのちに本チャットで生成した `task.md`, `implementation_plan.md`, `walkthrough.md` をプロジェクトの `docs/corporate_site_poc/` 配下にコピーします。
