/**
 * GitHub Issue Copier の背景スクリプト
 * コンテキストメニューの作成と処理を担当
 */

/**
 * メッセージデータの型定義
 */
interface MessageRequest {
  action: string;
  data?: any;
}

/**
 * 拡張機能がインストールされた時の処理
 * @param {Object} details - インストール詳細
 */
chrome.runtime.onInstalled.addListener((details: { reason: string }): void => {
  if (details.reason === "install") {
    // 初回インストール時の処理
    console.log("GitHub Issue Copier がインストールされました");
  } else if (details.reason === "update") {
    // アップデート時の処理
    console.log("GitHub Issue Copier がアップデートされました");
  }

  // コンテキストメニューを作成
  createContextMenu();
});

/**
 * コンテキストメニューを作成する
 */
function createContextMenu(): void {
  // 既存のメニューを削除（重複防止）
  chrome.contextMenus.removeAll();

  // GitHubのIssue/PRページ用のコンテキストメニューを作成
  chrome.contextMenus.create({
    id: "copy-issue-with-link",
    title: "イシュータイトルをリンク付きでコピー",
    contexts: ["page"],
    documentUrlPatterns: [
      "*://github.com/*/issues/*",
      "*://github.com/*/pull/*",
    ],
  });
}

/**
 * コンテンツスクリプトからのメッセージを受け取る
 */
chrome.runtime.onMessage.addListener(
  (
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): boolean => {
    // メッセージの処理
    if (request.action === "logCopy") {
      console.log("Issue/PRがコピーされました:", request.data);
      sendResponse({ success: true });
    }

    // 非同期レスポンスを使用する場合はtrueを返す
    return true;
  }
);

/**
 * コンテキストメニューがクリックされた時の処理
 */
/**
 * コンテンツスクリプトが読み込まれているか確認する
 * @param {number} tabId - 確認するタブのID
 * @returns {Promise<boolean>} コンテンツスクリプトが読み込まれているかどうか
 */
function isContentScriptLoaded(tabId: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // pingメッセージを送信して応答があるか確認
      chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log(
            "コンテンツスクリプト未読み込み:",
            chrome.runtime.lastError.message
          );
          resolve(false);
          return;
        }

        if (response && response.success) {
          console.log("コンテンツスクリプト読み込み済み");
          resolve(true);
        } else {
          console.log("コンテンツスクリプトからの応答が不正");
          resolve(false);
        }
      });
    } catch (error) {
      console.error("コンテンツスクリプト確認中にエラー:", error);
      resolve(false);
    }
  });
}

/**
 * コンテキストメニューがクリックされた時の処理
 */
chrome.contextMenus.onClicked.addListener(
  async (
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab
  ): Promise<void> => {
    if (info.menuItemId === "copy-issue-with-link" && tab?.id) {
      console.log("コンテキストメニューがクリックされました");

      // まずタブがGitHubのページか確認
      if (!tab.url || !tab.url.includes("github.com")) {
        console.error("GitHubのページではありません");
        return;
      }

      // コンテンツスクリプトが読み込まれているか確認
      const isLoaded = await isContentScriptLoaded(tab.id);

      if (!isLoaded) {
        console.error(
          "コンテンツスクリプトが読み込まれていません。ページを再読み込みしてください。"
        );
        // ユーザーに通知することも検討
        return;
      }

      // アクティブなタブにメッセージを送信
      try {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "copyIssueTitleWithLink" },
          (response) => {
            // runtime.lastErrorをチェック（メッセージ送信エラーのハンドリング）
            if (chrome.runtime.lastError) {
              console.error(
                "メッセージ送信エラー:",
                chrome.runtime.lastError.message
              );
              return;
            }

            if (response && response.success) {
              console.log("コピー成功");
            } else {
              console.error("コピー失敗");
            }
          }
        );
      } catch (error) {
        console.error("メッセージ送信中にエラーが発生しました:", error);
      }
    }
  }
);
