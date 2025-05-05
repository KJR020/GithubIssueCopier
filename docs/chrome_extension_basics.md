# Chrome拡張機能の基本ガイド

## 1. Chrome拡張機能とは

Chrome拡張機能は、ブラウザに新しい機能を追加するためのプログラムです。ウェブページの内容を変更したり、新しいUIを追加したり、バックグラウンドで処理を行ったりすることができます。

## 2. 拡張機能の主要コンポーネント

### 2.1 manifest.json

拡張機能の設定ファイルです。拡張機能の名前、バージョン、権限、使用するスクリプトなどを定義します。

```json
{
  "manifest_version": 3,
  "name": "拡張機能の名前",
  "version": "1.0",
  "description": "拡張機能の説明",
  "permissions": ["必要な権限"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {"16": "icon16.png", "48": "icon48.png"}
  },
  "content_scripts": [
    {
      "matches": ["*://*.example.com/*"],
      "js": ["content.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}
```

### 2.2 コンテンツスクリプト（Content Scripts）

**役割**：ウェブページ内で実行され、ページのDOM（HTML要素）を操作します。

**特徴**：
- ウェブページに直接アクセスできる（DOM操作、イベントリスナーなど）
- `manifest.json`の`matches`パターンに一致するページでのみ実行される
- ページのJavaScriptとは分離された環境で実行される

**一般的な用途**：
- ページに新しいボタンや要素を追加する
- ページの内容を変更する（テキスト置換、スタイル変更など）
- ページから情報を収集する

**例**：GitHub Issue Copierでは、Issueページにコピーボタンを追加し、タイトルとURLを取得する役割を担っています。

```typescript
// content.js の例
document.addEventListener('DOMContentLoaded', () => {
  // ページにボタンを追加
  const button = document.createElement('button');
  button.textContent = 'コピー';
  document.body.appendChild(button);
  
  // ボタンクリック時の処理
  button.addEventListener('click', () => {
    const title = document.title;
    const url = window.location.href;
    // クリップボードにコピー
    navigator.clipboard.writeText(`${title} ${url}`);
  });
});
```

### 2.3 バックグラウンドスクリプト（Background Scripts）

**役割**：拡張機能のバックグラウンドで常に実行され、全体の管理を行います。

**特徴**：
- ブラウザが起動している間、常にバックグラウンドで動作する
- ウェブページに直接アクセスできない
- ブラウザのイベント（タブ切り替え、インストール、コンテキストメニュークリックなど）をリッスンできる
- 複数のタブやウィンドウをまたいだ状態管理ができる

**一般的な用途**：
- 拡張機能の初期化処理
- コンテキストメニュー（右クリックメニュー）の管理
- 定期的なタスクの実行
- 複数のタブ間での情報共有

**例**：GitHub Issue Copierでは、コンテキストメニューの作成と管理を担当しています。

```typescript
// background.js の例
chrome.runtime.onInstalled.addListener(() => {
  // コンテキストメニューを作成
  chrome.contextMenus.create({
    id: 'copy-menu',
    title: 'タイトルとURLをコピー',
    contexts: ['page']
  });
});

// コンテキストメニュークリック時の処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copy-menu' && tab?.id) {
    // コンテンツスクリプトにメッセージを送信
    chrome.tabs.sendMessage(tab.id, { action: 'copyTitleAndUrl' });
  }
});
```

### 2.4 ポップアップ（Popup）

ブラウザのツールバーにある拡張機能アイコンをクリックしたときに表示されるHTMLページです。ユーザーインターフェースを提供します。

## 3. コンポーネント間の通信方法

拡張機能の各コンポーネントは異なる環境で実行されるため、直接通信することができません。代わりに、メッセージパッシングを使用します。

### 3.1 コンテンツスクリプト ⇔ バックグラウンドスクリプト

```typescript
// コンテンツスクリプトからバックグラウンドへメッセージを送信
chrome.runtime.sendMessage({ action: 'getData', key: 'value' }, (response) => {
  console.log('バックグラウンドからの応答:', response);
});

// バックグラウンドスクリプトでメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getData') {
    // 処理を実行
    sendResponse({ result: '成功' });
  }
  return true; // 非同期レスポンスを使用する場合はtrueを返す
});

// バックグラウンドからコンテンツスクリプトへメッセージを送信
chrome.tabs.sendMessage(tabId, { action: 'updateUI' }, (response) => {
  console.log('コンテンツスクリプトからの応答:', response);
});

// コンテンツスクリプトでメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateUI') {
    // UIを更新
    sendResponse({ success: true });
  }
  return true;
});
```

## 4. 権限（Permissions）

拡張機能が特定の機能を使用するために必要な権限を`manifest.json`で宣言します。

**主な権限の例**：
- `activeTab`: 現在アクティブなタブにアクセス
- `storage`: データの保存
- `contextMenus`: 右クリックメニューの作成
- `clipboardWrite`: クリップボードへの書き込み
- `tabs`: すべてのタブ情報へのアクセス

```json
"permissions": ["activeTab", "clipboardWrite", "contextMenus"]
```

## 5. 実際の処理の流れ（GitHub Issue Copierの例）

### 5.1 右クリックメニューからコピーする場合

1. **バックグラウンドスクリプト**：拡張機能インストール時にコンテキストメニューを作成
   ```typescript
   chrome.runtime.onInstalled.addListener(() => {
     chrome.contextMenus.create({
       id: 'copy-issue-with-link',
       title: 'イシュータイトルをリンク付きでコピー',
       contexts: ['page'],
       documentUrlPatterns: ['*://github.com/*/issues/*', '*://github.com/*/pull/*']
     });
   });
   ```

2. **ユーザー**：GitHubページで右クリックしてメニュー項目をクリック

3. **バックグラウンドスクリプト**：クリックイベントを受け取り、該当タブにメッセージを送信
   ```typescript
   chrome.contextMenus.onClicked.addListener((info, tab) => {
     if (info.menuItemId === 'copy-issue-with-link' && tab?.id) {
       chrome.tabs.sendMessage(tab.id, { action: 'copyIssueTitleWithLink' });
     }
   });
   ```

4. **コンテンツスクリプト**：メッセージを受け取り、ページ内でタイトルとURLを取得してコピー
   ```typescript
   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
     if (message.action === 'copyIssueTitleWithLink') {
       const title = document.querySelector('.js-issue-title').textContent.trim();
       const url = window.location.href;
       navigator.clipboard.writeText(`${title} ${url}`);
       sendResponse({ success: true });
     }
     return true;
   });
   ```

5. **コンテンツスクリプト**：コピー成功メッセージを表示

### 5.2 ページ上のボタンからコピーする場合

1. **コンテンツスクリプト**：ページ読み込み時にボタンを追加
   ```typescript
   function addCopyButton() {
     const titleElement = document.querySelector('.js-issue-title');
     const button = document.createElement('button');
     button.textContent = 'コピー';
     button.addEventListener('click', copyIssueTitleWithLink);
     titleElement.parentElement.appendChild(button);
   }
   ```

2. **ユーザー**：ボタンをクリック

3. **コンテンツスクリプト**：タイトルとURLを取得してコピー
   ```typescript
   function copyIssueTitleWithLink() {
     const title = getIssueTitle();
     const url = window.location.href;
     navigator.clipboard.writeText(`${title} ${url}`);
     showCopySuccessMessage();
   }
   ```

## 6. デバッグ方法

### 6.1 バックグラウンドスクリプトのデバッグ

1. ブラウザの拡張機能管理ページ（`chrome://extensions/`または`edge://extensions/`）を開く
2. 拡張機能の「詳細」をクリック
3. 「サービスワーカーを検査」または「バックグラウンドページを検査」をクリック
4. DevToolsの「Console」タブでログを確認

### 6.2 コンテンツスクリプトのデバッグ

1. 拡張機能が動作するページを開く
2. ページ上で右クリック→「検証」を選択
3. DevToolsの「Console」タブでログを確認

## 7. よくある問題と解決策

### 7.1 コンテンツスクリプトとバックグラウンドの通信が機能しない

- メッセージリスナーが正しく設定されているか確認
- 非同期レスポンスを使用する場合は、リスナー関数から`true`を返しているか確認
- コンソールでエラーメッセージを確認

### 7.2 クリップボード操作が機能しない

- `clipboardWrite`権限が`manifest.json`に含まれているか確認
- バックグラウンドスクリプトではなくコンテンツスクリプトでクリップボード操作を行う
- `navigator.clipboard.writeText()`の代わりに、一時的なテキストエリアを使用する方法も検討

### 7.3 コンテキストメニューが表示されない

- `contextMenus`権限が`manifest.json`に含まれているか確認
- `chrome.contextMenus.create()`が正しく呼び出されているか確認
- `documentUrlPatterns`が正しく設定されているか確認

## 8. 参考リソース

- [Chrome拡張機能開発ドキュメント](https://developer.chrome.com/docs/extensions/)
- [Manifest V3の概要](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [コンテンツスクリプトガイド](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [バックグラウンドスクリプトガイド](https://developer.chrome.com/docs/extensions/mv3/background_pages/)
