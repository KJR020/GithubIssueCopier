/**
 * Chrome拡張機能APIの型定義
 */

declare namespace chrome {
  namespace runtime {
    interface MessageSender {
      tab?: {
        id?: number;
        url?: string;
      };
      frameId?: number;
      id?: string;
      url?: string;
      tlsChannelId?: string;
    }

    function onMessage(
      callback: (
        message: any,
        sender: MessageSender,
        sendResponse: (response?: any) => void
      ) => boolean | void
    ): void;

    const onInstalled: {
      addListener(callback: (details: { reason: string }) => void): void;
    };

    function sendMessage(
      message: any,
      responseCallback?: (response: any) => void
    ): void;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      index: number;
      pinned: boolean;
      highlighted: boolean;
      windowId: number;
      active: boolean;
      url?: string;
      title?: string;
      favIconUrl?: string;
      status?: string;
      incognito: boolean;
      width?: number;
      height?: number;
      sessionId?: string;
    }

    function query(
      queryInfo: {
        active?: boolean;
        currentWindow?: boolean;
        lastFocusedWindow?: boolean;
        status?: string;
        title?: string;
        url?: string | string[];
        windowId?: number;
        windowType?: string;
        index?: number;
        pinned?: boolean;
        highlighted?: boolean;
        audible?: boolean;
        muted?: boolean;
        groupId?: number;
      },
      callback: (result: Tab[]) => void
    ): void;
  }
}
