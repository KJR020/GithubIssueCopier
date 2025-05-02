/**
 * GitHubのIssueタイトルをリンク付きでコピーするためのコンテンツスクリプト
 */

/**
 * コピーボタンを追加する要素のセレクタ
 * @type {string}
 */
const ISSUE_HEADER_SELECTOR: string = '.js-issue-title';
const PR_HEADER_SELECTOR: string = '.js-title-edit-button';

/**
 * コピーボタンのスタイル
 * @type {Object}
 */
const COPY_BUTTON_STYLE: {[key: string]: string} = {
  marginLeft: '8px',
  padding: '3px 8px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#24292e',
  backgroundColor: '#fafbfc',
  border: '1px solid rgba(27, 31, 35, 0.15)',
  borderRadius: '3px',
  cursor: 'pointer'
};

/**
 * ページが読み込まれた時の処理
 */
document.addEventListener('DOMContentLoaded', (): void => {
  // URLに基づいて処理を分岐
  if (isIssuePage() || isPullRequestPage()) {
    setTimeout(addCopyButton, 1000); // DOMが完全に読み込まれるのを待つ
  }
});

/**
 * 現在のページがIssueページかどうかを判定
 * @returns {boolean} Issueページの場合はtrue
 */
function isIssuePage(): boolean {
  const url: string = window.location.href;
  return url.includes('/issues/');
}

/**
 * 現在のページがPull Requestページかどうかを判定
 * @returns {boolean} Pull Requestページの場合はtrue
 */
function isPullRequestPage(): boolean {
  const url: string = window.location.href;
  return url.includes('/pull/');
}

/**
 * コピーボタンを追加する
 */
function addCopyButton(): void {
  // セレクタを決定
  const selector: string = isIssuePage() ? ISSUE_HEADER_SELECTOR : PR_HEADER_SELECTOR;
  const titleElement: HTMLElement | null = document.querySelector(selector);
  
  if (!titleElement) {
    console.error('タイトル要素が見つかりませんでした');
    return;
  }
  
  // 既存のボタンを確認（重複防止）
  if (document.getElementById('copy-issue-button')) {
    return;
  }
  
  // コピーボタンを作成
  const copyButton: HTMLButtonElement = document.createElement('button');
  copyButton.id = 'copy-issue-button';
  copyButton.textContent = 'リンク付きコピー';
  copyButton.title = 'タイトルとリンクをコピー';
  
  // スタイルを適用
  Object.entries(COPY_BUTTON_STYLE).forEach(([property, value]: [string, string]): void => {
    copyButton.style[property as any] = value;
  });
  
  // クリックイベントを追加
  copyButton.addEventListener('click', copyIssueTitleWithLink);
  
  // ボタンを追加
  titleElement.parentElement?.appendChild(copyButton);
}

/**
 * Issueタイトルとリンクをコピーする
 */
function copyIssueTitleWithLink(): void {
  const issueTitle: string = getIssueTitle();
  const issueUrl: string = window.location.href;
  const copyText: string = `${issueTitle} ${issueUrl}`;
  
  // クリップボードにコピー
  navigator.clipboard.writeText(copyText)
    .then((): void => {
      showCopySuccessMessage();
    })
    .catch((error: Error): void => {
      console.error('クリップボードへのコピーに失敗しました:', error);
      showCopyErrorMessage();
    });
}

/**
 * Issueのタイトルを取得する
 * @returns {string} Issueのタイトル
 */
function getIssueTitle(): string {
  const selector: string = isIssuePage() ? ISSUE_HEADER_SELECTOR : PR_HEADER_SELECTOR;
  const titleElement: HTMLElement | null = document.querySelector(selector);
  return titleElement ? titleElement.textContent?.trim() || '' : '';
}

/**
 * コピー成功メッセージを表示
 */
function showCopySuccessMessage(): void {
  showMessage('コピーしました！', 'success');
}

/**
 * コピーエラーメッセージを表示
 */
function showCopyErrorMessage(): void {
  showMessage('コピーに失敗しました', 'error');
}

/**
 * メッセージを表示
 * @param {string} text - 表示するメッセージテキスト
 * @param {string} type - メッセージタイプ（success/error）
 */
function showMessage(text: string, type: string): void {
  // 既存のメッセージを削除
  const existingMessage: HTMLElement | null = document.getElementById('copy-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // メッセージ要素を作成
  const message: HTMLDivElement = document.createElement('div');
  message.id = 'copy-message';
  message.textContent = text;
  message.style.position = 'fixed';
  message.style.bottom = '20px';
  message.style.right = '20px';
  message.style.padding = '10px 15px';
  message.style.borderRadius = '4px';
  message.style.fontSize = '14px';
  message.style.fontWeight = 'bold';
  message.style.zIndex = '9999';
  
  // タイプに応じたスタイルを適用
  if (type === 'success') {
    message.style.backgroundColor = '#28a745';
    message.style.color = 'white';
  } else {
    message.style.backgroundColor = '#dc3545';
    message.style.color = 'white';
  }
  
  // ドキュメントに追加
  document.body.appendChild(message);
  
  // 3秒後に削除
  setTimeout((): void => {
    message.remove();
  }, 3000);
}

// ページ変更を監視（GitHub SPAの対応）
const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]): void => {
  if (isIssuePage() || isPullRequestPage()) {
    // コピーボタンがなければ追加
    if (!document.getElementById('copy-issue-button')) {
      addCopyButton();
    }
  }
});

// 監視を開始
observer.observe(document.body, { childList: true, subtree: true });
