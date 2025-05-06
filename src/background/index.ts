/**
 * コンテキストメニューのID
 */
const CONTEXT_MENU_ID: string = 'copy-github-issue';

/**
 * コンテキストメニューを作成
 */
const createContextMenu = (): void => {
  // 既存のメニューを削除
  chrome.contextMenus.removeAll(() => {
    // GitHubのページでのみ表示されるコンテキストメニューを作成
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'リンク付きコピー',
      contexts: ['page'],
      documentUrlPatterns: ['*://github.com/*/issues/*', '*://github.com/*/pull/*']
    });
  });
};

/**
 * コンテンツスクリプトが読み込まれているか確認
 * @param tabId 確認するタブのID
 * @returns コンテンツスクリプトが読み込まれているかどうか
 */
const isContentScriptLoaded = async (tabId: number): Promise<boolean> => {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    return response && response.status === 'ok';
  } catch (error) {
    console.error('コンテンツスクリプトとの通信に失敗しました:', error);
    return false;
  }
};

/**
 * コンテキストメニューがクリックされた時の処理
 * @param info クリック情報
 * @param tab タブ情報
 */
const handleContextMenuClick = async (
  info: chrome.contextMenus.OnClickData,
  tab: chrome.tabs.Tab | undefined
): Promise<void> => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !tab?.id) {
    return;
  }

  try {
    // コンテンツスクリプトが読み込まれているか確認
    const isLoaded = await isContentScriptLoaded(tab.id);
    
    if (!isLoaded) {
      console.error('コンテンツスクリプトが読み込まれていません');
      return;
    }
    
    // コンテンツスクリプトにコピー要求を送信
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'copyTitleAndUrl' });
    
    if (response && response.success) {
      console.log('コピーに成功しました');
    } else {
      console.error('コピーに失敗しました:', response?.error || '不明なエラー');
    }
  } catch (error) {
    console.error('コンテキストメニュー処理でエラーが発生しました:', error);
  }
};

/**
 * 拡張機能がインストールされた時の処理
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('GitHub Issue Copier: インストールされました');
  createContextMenu();
});

/**
 * コンテキストメニューのクリックイベントリスナー
 */
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

/**
 * タブが更新された時の処理
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // タブのURLがGitHubのIssueまたはPRページに一致する場合、コンテキストメニューを有効化
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    (tab.url.match(/github\.com\/.*\/issues\/\d+/) || tab.url.match(/github\.com\/.*\/pull\/\d+/))
  ) {
    console.log('GitHub Issue/PR ページが読み込まれました:', tab.url);
  }
});
