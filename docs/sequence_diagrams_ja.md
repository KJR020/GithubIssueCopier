# Chrome拡張機能の処理フロー（シーケンス図）

このドキュメントでは、Chrome拡張機能の主要な処理フローをシーケンス図で説明します。

## 1. 拡張機能のインストール時の処理

```mermaid
sequenceDiagram
    participant ユーザー
    participant ブラウザ
    participant 拡張機能
    participant バックグラウンドスクリプト
    
    ユーザー->>ブラウザ: 拡張機能をインストール
    ブラウザ->>拡張機能: インストール完了
    拡張機能->>バックグラウンドスクリプト: onInstalled イベント発火
    Note over バックグラウンドスクリプト: 初期化処理実行
    バックグラウンドスクリプト->>バックグラウンドスクリプト: コンテキストメニュー作成
    バックグラウンドスクリプト->>ブラウザ: 設定完了通知
    ブラウザ->>ユーザー: インストール完了表示
```

## 2. ページ上のボタンからコピーする場合

```mermaid
sequenceDiagram
    participant ユーザー
    participant GitHubページ
    participant コンテンツスクリプト
    participant クリップボード
    
    ユーザー->>GitHubページ: Issueページにアクセス
    GitHubページ->>コンテンツスクリプト: DOMContentLoaded イベント
    コンテンツスクリプト->>GitHubページ: コピーボタンを追加
    Note over GitHubページ: ボタンが表示される
    
    ユーザー->>GitHubページ: コピーボタンをクリック
    GitHubページ->>コンテンツスクリプト: クリックイベント発火
    コンテンツスクリプト->>GitHubページ: タイトルとURLを取得
    コンテンツスクリプト->>クリップボード: テキストをコピー
    コンテンツスクリプト->>GitHubページ: 成功メッセージを表示
    GitHubページ->>ユーザー: 「コピーしました！」表示
```

## 3. 右クリックメニューからコピーする場合

```mermaid
sequenceDiagram
    participant ユーザー
    participant GitHubページ
    participant ブラウザ
    participant バックグラウンドスクリプト
    participant コンテンツスクリプト
    participant クリップボード
    
    ユーザー->>GitHubページ: Issueページにアクセス
    ユーザー->>GitHubページ: 右クリック
    GitHubページ->>ブラウザ: コンテキストメニュー表示要求
    ブラウザ->>バックグラウンドスクリプト: メニュー項目を取得
    バックグラウンドスクリプト->>ブラウザ: メニュー項目を返す
    ブラウザ->>GitHubページ: コンテキストメニューを表示
    
    ユーザー->>GitHubページ: 「イシュータイトルをリンク付きでコピー」をクリック
    GitHubページ->>ブラウザ: メニュー項目クリックイベント
    ブラウザ->>バックグラウンドスクリプト: onClicked イベント発火
    バックグラウンドスクリプト->>コンテンツスクリプト: メッセージ送信（copyIssueTitleWithLink）
    
    コンテンツスクリプト->>GitHubページ: タイトルとURLを取得
    コンテンツスクリプト->>クリップボード: テキストをコピー
    コンテンツスクリプト->>バックグラウンドスクリプト: 成功レスポンス
    コンテンツスクリプト->>GitHubページ: 成功メッセージを表示
    GitHubページ->>ユーザー: 「コピーしました！」表示
```

## 4. 拡張機能のアイコンからポップアップを表示する場合

```mermaid
sequenceDiagram
    participant ユーザー
    participant ブラウザ
    participant 拡張機能アイコン
    participant ポップアップHTML
    participant ポップアップJS
    
    ユーザー->>拡張機能アイコン: クリック
    拡張機能アイコン->>ブラウザ: ポップアップ表示要求
    ブラウザ->>ポップアップHTML: 読み込み
    ポップアップHTML->>ポップアップJS: 初期化
    ポップアップJS->>ポップアップHTML: UI要素を設定
    ポップアップHTML->>ユーザー: ポップアップ表示
    
    ユーザー->>ポップアップHTML: 操作（ボタンクリックなど）
    ポップアップHTML->>ポップアップJS: イベント発火
    ポップアップJS->>ポップアップHTML: 結果を表示
    ポップアップHTML->>ユーザー: 操作結果を表示
```

## 5. コンテンツスクリプトとバックグラウンドスクリプト間の通信

```mermaid
sequenceDiagram
    participant コンテンツスクリプト
    participant ブラウザメッセージングAPI
    participant バックグラウンドスクリプト
    
    コンテンツスクリプト->>ブラウザメッセージングAPI: sendMessage({action: "getData"})
    ブラウザメッセージングAPI->>バックグラウンドスクリプト: onMessage イベント発火
    Note over バックグラウンドスクリプト: メッセージ処理
    バックグラウンドスクリプト->>ブラウザメッセージングAPI: sendResponse({result: "データ"})
    ブラウザメッセージングAPI->>コンテンツスクリプト: コールバック実行
    Note over コンテンツスクリプト: レスポンス処理
    
    バックグラウンドスクリプト->>ブラウザメッセージングAPI: tabs.sendMessage(tabId, {action: "updateUI"})
    ブラウザメッセージングAPI->>コンテンツスクリプト: onMessage イベント発火
    Note over コンテンツスクリプト: メッセージ処理
    コンテンツスクリプト->>ブラウザメッセージングAPI: sendResponse({success: true})
    ブラウザメッセージングAPI->>バックグラウンドスクリプト: コールバック実行
```

## 6. GitHub Issue Copierの全体的な処理フロー

```mermaid
sequenceDiagram
    participant ユーザー
    participant GitHubページ
    participant コンテンツスクリプト
    participant バックグラウンドスクリプト
    participant クリップボード
    
    Note over ユーザー,バックグラウンドスクリプト: インストール時
    ユーザー->>バックグラウンドスクリプト: 拡張機能をインストール
    バックグラウンドスクリプト->>バックグラウンドスクリプト: コンテキストメニュー作成
    
    Note over ユーザー,クリップボード: ページ読み込み時
    ユーザー->>GitHubページ: Issueページにアクセス
    GitHubページ->>コンテンツスクリプト: DOMContentLoaded
    コンテンツスクリプト->>GitHubページ: Issueページか判定
    コンテンツスクリプト->>GitHubページ: コピーボタンを追加
    
    Note over ユーザー,クリップボード: ボタンでコピー
    ユーザー->>GitHubページ: コピーボタンをクリック
    GitHubページ->>コンテンツスクリプト: クリックイベント
    コンテンツスクリプト->>GitHubページ: タイトルとURLを取得
    コンテンツスクリプト->>クリップボード: テキストをコピー
    コンテンツスクリプト->>GitHubページ: 成功メッセージを表示
    
    Note over ユーザー,クリップボード: 右クリックでコピー
    ユーザー->>GitHubページ: 右クリック
    ユーザー->>GitHubページ: コンテキストメニュー項目をクリック
    GitHubページ->>バックグラウンドスクリプト: メニュークリックイベント
    バックグラウンドスクリプト->>コンテンツスクリプト: copyIssueTitleWithLink メッセージ
    コンテンツスクリプト->>GitHubページ: タイトルとURLを取得
    コンテンツスクリプト->>クリップボード: テキストをコピー
    コンテンツスクリプト->>GitHubページ: 成功メッセージを表示
```
