import React from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

/**
 * ポップアップのメインコンポーネント
 */
const Popup: React.FC = () => {
  return (
    <div className="popup-container">
      <h1>GitHub Issue Copier</h1>
      <p>GitHubのIssueページやPull Requestページで使用できます。</p>
      <p>タイトルの横にあるコピーボタンをクリックするか、コンテキストメニューの「リンク付きコピー」を選択してください。</p>
    </div>
  );
};

/**
 * DOMにReactコンポーネントをレンダリング
 */
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
