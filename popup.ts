/**
 * GitHub Issue Copier のポップアップスクリプト
 */

/**
 * ステータスタイプの型定義
 */
type StatusType = 'success' | 'info' | 'warning' | 'error';

/**
 * タブ情報の型定義
 */
interface TabInfo {
  url?: string;
  id?: number;
  title?: string;
}

/**
 * ステータス表示要素
 * @type {HTMLElement | null}
 */
let statusElement: HTMLElement | null = null;

/**
 * ドキュメント読み込み完了時の処理
 */
document.addEventListener('DOMContentLoaded', (): void => {
  statusElement = document.getElementById('status');
  
  // 現在のタブがGitHubかどうかをチェック
  checkCurrentTab();
});

/**
 * 現在のタブがGitHubかどうかをチェックする
 */
function checkCurrentTab(): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: TabInfo[]): void => {
    const currentTab = tabs[0];
    const url = currentTab.url || '';
    
    if (url.includes('github.com')) {
      if (url.includes('/issues/') || url.includes('/pull/')) {
        showStatus('このページでは「リンク付きコピー」ボタンが利用できます', 'success');
      } else {
        showStatus('GitHubのIssueまたはPull Requestページを開いてください', 'info');
      }
    } else {
      showStatus('GitHubのページを開いてください', 'warning');
    }
  });
}

/**
 * ステータスメッセージを表示する
 * @param {string} message - 表示するメッセージ
 * @param {StatusType} type - メッセージタイプ（success/info/warning/error）
 */
function showStatus(message: string, type: StatusType): void {
  if (!statusElement) return;
  
  // 既存のクラスをクリア
  statusElement.className = '';
  
  // スタイルを設定
  statusElement.style.padding = '10px';
  statusElement.style.borderRadius = '4px';
  statusElement.style.marginBottom = '10px';
  statusElement.style.fontSize = '13px';
  
  // タイプに応じたスタイルを適用
  switch (type) {
    case 'success':
      statusElement.style.backgroundColor = '#dcffe4';
      statusElement.style.color = '#1a7f37';
      statusElement.style.border = '1px solid #b4e6c4';
      break;
    case 'info':
      statusElement.style.backgroundColor = '#f6f8fa';
      statusElement.style.color = '#24292e';
      statusElement.style.border = '1px solid #d0d7de';
      break;
    case 'warning':
      statusElement.style.backgroundColor = '#fff8c5';
      statusElement.style.color = '#9a6700';
      statusElement.style.border = '1px solid #eac54f';
      break;
    case 'error':
      statusElement.style.backgroundColor = '#ffebe9';
      statusElement.style.color = '#cf222e';
      statusElement.style.border = '1px solid #f2b0b0';
      break;
  }
  
  // メッセージを設定
  statusElement.textContent = message;
}
