# 初心者向け Cloudflare (Pages & Functions) 入門ガイド

このドキュメントでは、本プロジェクトのインフラ・ホスティングおよびバックエンド機能として利用している「Cloudflare」について、全体像と実際のプロジェクトでの役割を初心者向けに解説します。

---

## 1. Cloudflare とは？

Cloudflare（クラウドフレア）は、世界中のサーバー（エッジネットワーク）を活用して、Webサイトを「より速く」「より安全に」配信するためのサービスです。
一般的なレンタルサーバーが「日本にある1台のパソコン」からデータを送るのに対し、Cloudflareは「世界中の何百という拠点」から、アクセスしてきたユーザーに一番近い場所からデータを返します（CDN：コンテンツ配信ネットワーク）。

---

## 2. Cloudflare Pages：超高速な静的サイトホスティング

本プロジェクトでは、Astro で作られたサイトを全世界へ公開するために **Cloudflare Pages** を使用しています。

### 2.1 仕組みとメリット
開発者が GitHub などにコードをプッシュすると、Cloudflare Pages が自動でそのコードを受け取り、ビルド（Astroをブラウザが読めるHTML/CSS/JSに変換する作業）を実行し、世界中のエッジサーバーに配置してくれます。

- **超高速な表示**: ユーザーの最寄りサーバーからデータが返るため爆速。
- **自動デプロイ**: コードを更新するたびに自動でサイトが更新されます。
- **無料枠が大きい**: アクセスが多くなっても十分耐えられる無料枠があります。

### 2.2 本プロジェクトとの連携機能 (`@astrojs/cloudflare`)
Astro は基本設定では単なる「静的ファイル生成器」ですが、`astro.config.mjs` で `@astrojs/cloudflare` アダプターを設定しています。これにより、AstroはCloudflareの機能（次項のFunctionsなど）と連携できるよう最適化してビルドされます。

---

## 3. Cloudflare Pages Functions：サーバーレスバックエンド

ただの「静的なサイト」では、お問い合わせフォームを作っても、ユーザーが入力したデータを受け取って処理する「サーバー（バックエンド）」がありません。
通常なら別にサーバーを用意する必要がありますが、Cloudflare Pages には **Functions** という「サーバーレスの仕組み」が内蔵されています。

### 3.1 Functions の基本的な仕組み
プロジェクト内の `functions/` フォルダの中に書いたファイルが、自動的にバックエンドのAPIとして動きます。サーバーを管理する手間は一切ありません。（サーバーレス）

### 3.2 実際のコードの解説 (`functions/api/submit.ts`)
本プロジェクトのお問い合わせフォーム（`contact.astro`）は、送信ボタンを押すとフロントエンドから `/api/submit` というURLへデータを投げます。

それを受け止めるのが `functions/api/submit.ts` です。

```typescript
export async function onRequestPost({ request }) {
  try {
    // 1. データの受け取り
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    ...

    // 2. バリデーション（入力チェック）
    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // 3. 処理（外部メールサービスへの送信や、データベースへの保存など）
    console.log(`Received message from ${name}`);

    // 4. フロントエンド（ブラウザ）へ「成功したよ！」と返事をする
    return new Response(JSON.stringify({ message: "Success" }), { status: 200 });
  } catch (err) { ... }
}
```
- ファイルパスがそのままURLになります（`functions/api/submit.ts` -> `ドメイン/api/submit`）。
- `onRequestPost` という関数で、HTTPの `POST` リクエスト（フォームからの送信）を受け取ります。
- データの確認を行い、OKなら200番（成功）のレスポンスを返します。

---

## 4. 環境変数（セキュリティ）の扱い

microCMSの APIキー のような「秘密のパスワード」は、絶対にプログラムのコードの中にベタ書きしてはいけません（GitHub等で世界中に公開されてしまうため）。

そこで**環境変数**という仕組みを使います。

### 4.1 ローカル開発時 (`.env` ファイル)
自分のパソコンで開発するときは、プロジェクトフォルダ直下に `.env` ファイルを作成し、そこにキーを書きます。このファイルは `.gitignore` に登録されているため、Gitにはアップロードされません。
コードからは `import.meta.env.MICROCMS_API_KEY` のようにして秘密の値を呼び出します。

### 4.2 本番環境 (Cloudflare Dashboard)
本番環境には `.env` ファイルが存在しないため、Cloudflareの管理画面にログインし、「Pages > 設定 > 環境変数」のページで直接キーと値を手入力します。
これにより、ビルド時やサーバー実行時に安全にAPIキーを利用することができます。

---

## まとめ

Cloudflareを使うことでフロントエンドからバックエンドのインフラ構成を1つのプロジェクト内で完結させ（フルスタック）、運用コストを抑えながら、世界クラスの高速で安全なコーポレートサイトを公開することが可能になっています。
まずは `Functions` が「自前のサーバーを用意しなくても動く便利なバックエンド機能」であると理解してください。
