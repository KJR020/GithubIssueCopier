# GitHub Issue Copier

GitHubのIssueタイトルをリンク付きでコピーするためのChrome拡張機能です。

## 機能

- GitHubのIssueやPull Requestページでタイトルの横に「リンク付きコピー」ボタンを表示します
- ボタンをクリックすると、タイトルとURLがクリップボードにコピーされます
- コピー成功時に通知が表示されます

## プロジェクト構成

```
/GithubIssueCopier
├── src/             # ソースコードディレクトリ
│   ├── content.ts   # コンテンツスクリプト
│   ├── background.ts # バックグラウンドスクリプト
│   ├── popup.ts     # ポップアップスクリプト
│   └── types/       # 型定義ファイル
├── public/          # 静的ファイル
│   ├── manifest.json # 拡張機能設定ファイル
│   ├── popup.html   # ポップアップHTML
│   └── images/      # アイコンなどの画像
├── dist/            # ビルド出力（生成されたコード）
└── ...              # その他設定ファイル
```

## 開発環境

- TypeScript
- Chrome Extension Manifest V3

## ビルド方法

```bash
# 依存パッケージのインストール
npm install

# ビルド
npm run build

# 開発時の監視ビルド
npm run watch
```

## インストール方法

1. Chromeで `chrome://extensions` を開く
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトの `dist` ディレクトリを選択

## 使い方

1. GitHubのIssueまたはPull Requestページを開きます
2. タイトルの横に表示される「リンク付きコピー」ボタンをクリックします
3. タイトルとURLがクリップボードにコピーされます

## ライセンス

MIT
