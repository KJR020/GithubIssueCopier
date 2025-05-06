import React, { useState } from 'react';

/**
 * コピーボタンコンポーネントのプロパティ
 */
interface CopyButtonProps {
  /**
   * コピー処理を行う関数
   */
  onCopy: () => Promise<boolean>;
}

/**
 * GitHubのIssueやPRのタイトルをコピーするボタンコンポーネント
 * @param props コンポーネントのプロパティ
 * @returns Reactコンポーネント
 */
const CopyButton: React.FC<CopyButtonProps> = ({ onCopy }) => {
  /**
   * コピー状態を管理するstate
   */
  const [copied, setCopied] = useState<boolean>(false);
  /**
   * エラー状態を管理するstate
   */
  const [error, setError] = useState<boolean>(false);

  /**
   * コピーボタンがクリックされた時の処理
   */
  const handleClick = async (): Promise<void> => {
    try {
      const success = await onCopy();
      
      if (success) {
        setCopied(true);
        setError(false);
        
        // 2秒後に表示を元に戻す
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } else {
        setError(true);
        
        // 2秒後に表示を元に戻す
        setTimeout(() => {
          setError(false);
        }, 2000);
      }
    } catch (e) {
      console.error('コピーに失敗しました:', e);
      setError(true);
      
      // 2秒後に表示を元に戻す
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  };

  /**
   * ボタンのスタイル
   */
  const buttonStyle: React.CSSProperties = {
    marginLeft: '8px',
    padding: '3px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: copied ? '#2ea44f' : error ? '#d73a49' : '#f6f8fa',
    color: copied ? '#ffffff' : error ? '#ffffff' : '#24292e',
    border: `1px solid ${copied ? '#2ea44f' : error ? '#d73a49' : '#e1e4e8'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      title="タイトルとURLをコピー"
    >
      {copied ? 'コピーしました' : error ? 'コピー失敗' : 'リンク付きコピー'}
    </button>
  );
};

export default CopyButton;
