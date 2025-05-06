import React from 'react';
import ReactDOM from 'react-dom/client';
import CopyButton from '../components/CopyButton';
import './content.css';

/**
 * GitHubのIssueタイトルセレクタ
 * 新旧UIの両方に対応
 */
const ISSUE_HEADER_SELECTOR: string = '[data-testid="issue-title"], .js-issue-title';

/**
 * GitHubのPull Requestタイトルセレクタ
 */
const PR_HEADER_SELECTOR: string = '[data-testid="pull-request-title"], .js-issue-title';

/**
 * 現在のページがIssueページかどうかを判定
 * @returns Issueページの場合はtrue
 */
const isIssuePage = (): boolean => {
  const url: string = window.location.href;
  return url.includes('/issues/');
};

/**
 * 現在のページがPull Requestページかどうかを判定
 * @returns Pull Requestページの場合はtrue
 */
const isPullRequestPage = (): boolean => {
  const url: string = window.location.href;
  return url.includes('/pull/');
};

/**
 * IssueまたはPRのタイトルを取得
 * @returns タイトルのテキスト
 */
const getIssueTitle = (): string => {
  const selector: string = isIssuePage() ? ISSUE_HEADER_SELECTOR : PR_HEADER_SELECTOR;
  const titleElement: HTMLElement | null = document.querySelector(selector);
  return titleElement ? titleElement.textContent?.trim() || '' : '';
};

/**
 * IssueまたはPRのタイトルとURLをクリップボードにコピー
 * @returns コピーが成功したかどうか
 */
const copyIssueTitleWithLink = async (): Promise<boolean> => {
  try {
    const title: string = getIssueTitle();
    const url: string = window.location.href;
    
    if (!title) {
      console.error('タイトルが見つかりませんでした');
      return false;
    }
    
    // タイトルとURLをクリップボードにコピー
    await navigator.clipboard.writeText(`${title} ${url}`);
    console.log('コピーしました:', title, url);
    return true;
  } catch (error) {
    console.error('コピーに失敗しました:', error);
    return false;
  }
};

/**
 * コピーボタンをマウントする要素を作成
 * @returns マウントポイントの要素
 */
const createMountPoint = (): HTMLElement => {
  const mountPoint = document.createElement('div');
  mountPoint.id = 'github-issue-copier-root';
  mountPoint.className = 'github-issue-copier-container';
  return mountPoint;
};

/**
 * コピーボタンをページに追加
 */
const addCopyButton = (): void => {
  // 既にボタンが追加されている場合は何もしない
  if (document.getElementById('github-issue-copier-root')) {
    return;
  }
  
  const selector: string = isIssuePage() ? ISSUE_HEADER_SELECTOR : PR_HEADER_SELECTOR;
  const titleElement: HTMLElement | null = document.querySelector(selector);
  
  if (titleElement && titleElement.parentElement) {
    const mountPoint = createMountPoint();
    titleElement.parentElement.appendChild(mountPoint);
    
    // Reactコンポーネントをレンダリング
    const root = ReactDOM.createRoot(mountPoint);
    root.render(
      <React.StrictMode>
        <CopyButton onCopy={copyIssueTitleWithLink} />
      </React.StrictMode>
    );
  }
};

/**
 * メッセージハンドラーの設定
 */
const setupMessageListener = (): void => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('メッセージを受信しました:', message);
    
    // pingメッセージの処理（コンテンツスクリプトが読み込まれているか確認）
    if (message.action === 'ping') {
      sendResponse({ status: 'ok' });
      return true;
    }
    
    // コピーメッセージの処理
    if (message.action === 'copyTitleAndUrl') {
      copyIssueTitleWithLink()
        .then(success => {
          sendResponse({ success });
        })
        .catch(error => {
          console.error('コピー処理でエラーが発生しました:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }
    
    return false;
  });
};

/**
 * メイン処理
 */
const main = (): void => {
  // GitHubのIssueまたはPRページでのみ実行
  if (isIssuePage() || isPullRequestPage()) {
    console.log('GitHub Issue Copier: コンテンツスクリプトが読み込まれました');
    
    // DOMが完全に読み込まれるのを待ってからボタンを追加
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addCopyButton, 1000);
      });
    } else {
      setTimeout(addCopyButton, 1000);
    }
    
    // URLの変更を監視して、SPAナビゲーション時にもボタンを追加
    const observer = new MutationObserver(() => {
      setTimeout(addCopyButton, 1000);
    });
    
    observer.observe(document.querySelector('head > title') as Node, {
      subtree: true,
      characterData: true,
      childList: true
    });
    
    // メッセージリスナーを設定
    setupMessageListener();
  }
};

// スクリプト実行
main();
