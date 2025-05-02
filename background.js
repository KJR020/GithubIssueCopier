/**
 * GitHub Issue Copier の背景スクリプト
 * 将来的な機能拡張のために用意
 */

/**
 * 拡張機能がインストールされた時の処理
 * @param {Object} details - インストール詳細
 */
chrome.runtime.onInstalled.addListener((details: { reason: string }): void => {
  if (details.reason === 'install') {
    // 初回インストール時の処理
    console.log('GitHub Issue Copier がインストールされました');
  } else if (details.reason === 'update') {
    // アップデート時の処理
    console.log('GitHub Issue Copier がアップデートされました');
  }
});

/**
 * コンテンツスクリプトからのメッセージを受け取る
 * 将来的な機能拡張のために用意
 */
chrome.runtime.onMessage.addListener(
  (request: { action: string; data?: any }, 
   sender: chrome.runtime.MessageSender, 
   sendResponse: (response?: any) => void): boolean => {
    
    // メッセージの処理
    if (request.action === 'logCopy') {
      console.log('Issue/PRがコピーされました:', request.data);
      sendResponse({ success: true });
    }
    
    // 非同期レスポンスを使用する場合はtrueを返す
    return true;
  }
);
