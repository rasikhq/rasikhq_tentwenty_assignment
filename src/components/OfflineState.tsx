import type { ReactNode } from 'react';

import { recheckConnection } from '../lib/nativeManagers';
import { ErrorState } from './ErrorState';

type OfflineStateProps = {
  /** What the user can do once online, such as "Connect to the internet to load upcoming movies." */
  message: string;
  onRetry: () => void;
  /** Sits in the flow instead of filling and centring in its screen. */
  inline?: boolean;
  /** For a dark screen: the text goes white. */
  onDark?: boolean;
  /** Other ways forward, as buttons after Retry. */
  children?: ReactNode;
};

/** Shown offline when a screen has nothing saved to show: it waits for a connection, so no error ever arrives. */
export function OfflineState({ message, onRetry, inline, onDark, children }: OfflineStateProps) {
  return (
    <ErrorState
      inline={inline}
      onDark={onDark}
      title="You're offline"
      message={message}
      // The connection may have returned without the app hearing of it, so Retry checks it again
      onRetry={() => {
        void recheckConnection();
        onRetry();
      }}
    >
      {children}
    </ErrorState>
  );
}
