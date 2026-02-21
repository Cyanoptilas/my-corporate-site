# Headerリンク動的生成の実装計画

## 目的 (Goal)
現在 `src/components/Header.astro` にハードコードされているナビゲーションリンクを、`src/pages` ディレクトリ内の `.astro` ファイル一覧から自動的（動的）に生成する仕組みに変更する。

## 課題とアプローチ

### 課題
単に `src/pages` 以下のファイルを自動取得するだけでは、以下の問題が発生します。
1. **動的ルーティングファイルの混入**: `news/[id].astro` や `news/[...page].astro` がそのままリンクとして取得されてしまう。
2. **ページ内リンク（アンカー）の消失**: 現在設定されている `/#services` や `/#about` のような「同一ページ内の特定セクションへのリンク」は、ファイルベースの自動取得ではそもそも生成できない。
3. **表示名（Label）の制御**: URLパス（例: `/contact`）からそのままラベルを作ると "Contact" になるが、任意の日本語ラベルなどにしたい場合の制御が難しい。

### 解決策 (Proposed Changes)
Vite の機能である `import.meta.glob` を使用してファイル一覧を取得しつつ、**「自動取得ファイル情報」と「手動で足したいアンカーリンク情報」をマージするハイブリッドな手法**を実装します。

#### [MODIFY] [Header.astro](file:///c:/Development/my-corporate-site/src/components/Header.astro)
1. `import.meta.glob('/src/pages/**/*.astro')` を使ってファイルパス一覧を取得。
2. 以下のようなフィルターをかける：
   - パスから `/src/pages` と `.astro` を削除し、Web上のURLパスに変換（例: `/contact`）。
   - `[id]` や `[...page]` が含まれる動的ルートファイルを除外。
   - `index.astro` は `/` に変換。
3. 取得したURL一覧をもとに、`label` を パス名から自動生成（先頭大文字化など）する。
4. 本プロジェクト特有のアンカーリンク（`/#services`, `/#about`）を、固定配列として用意し、自動取得したリストに結合（concat）して表示する。

## Verification Plan
1. ブラウザで確認し、Home, News, Contact などのページリンクが自動生成されていること。
2. Services, About のアンカーリンクも失われずに表示されていること。
3. 動的ルーティング用の不要なURL（`[id]` など）が表示されていないこと。
