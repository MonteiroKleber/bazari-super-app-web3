// src/features/wallet/components/AuthEventEmitter.tsx
import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@features/auth/store/authStore';
import { AUTH_LOGGED_IN, AUTH_LOGGED_OUT } from '@shared/events/auth';

/**
 * Emite AUTH_LOGGED_IN / AUTH_LOGGED_OUT ao observar mudanças no Auth.
 * Mantém o Auth independente (ele não importa nada da Wallet).
 * Este componente não renderiza UI.
 */
export function AuthEventEmitter(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const last = useRef<string | null>(null);

  useEffect(() => {
    const addr = user?.walletAddress || null;

    // logout
    if (!addr && last.current) {
      const ev = new CustomEvent(AUTH_LOGGED_OUT, { detail: {} });
      (globalThis as any).dispatchEvent(ev);
      last.current = null;
      return;
    }

    // login / troca de conta
    if (addr && addr !== last.current) {
      const ev = new CustomEvent(AUTH_LOGGED_IN, {
        detail: { address: addr, name: user?.name },
      });
      (globalThis as any).dispatchEvent(ev);
      last.current = addr;
    }
  }, [user?.walletAddress, user?.name]);

  return <></>;
}
