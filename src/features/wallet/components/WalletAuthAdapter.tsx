// src/features/wallet/components/WalletAuthAdapter.tsx
import React, { useEffect } from 'react';
import { AUTH_LOGGED_IN, AUTH_LOGGED_OUT } from '@shared/events/auth';
import { useAccountsStore } from '@features/wallet/store/accountsStore';

/**
 * Adaptador invisível entre Auth (event bus) e Wallet.
 * - Não altera layout, não renderiza UI.
 * - Idempotente (não duplica contas).
 * - Multi-conta: garante a conta do login e ativa-a; não remove as demais.
 */
export function WalletAuthAdapter(): JSX.Element {
  const getState = (useAccountsStore as any).getState;
  const setState = (useAccountsStore as any).setState;

  // Snapshot das funções expostas pela store (se existirem)
  const { addWatchOnly, setActive } = useAccountsStore.getState();
  const clearActive = (useAccountsStore.getState() as any).clearActive;
  const getByAddress = (useAccountsStore.getState() as any).getByAddress;

  useEffect(() => {
    const onLoggedIn = (ev: Event) => {
      const detail = (ev as CustomEvent).detail || {};
      const address: string | undefined = detail.address;
      const name: string | undefined = detail.name;
      if (!address) return;

      const st = getState?.();
      const list: any[] = (st?.accounts ?? st?.all ?? []) as any[];

      // verifica se já existe por address
      const exists =
        typeof getByAddress === 'function'
          ? getByAddress(address)
          : Array.isArray(list)
          ? list.find((a: any) => a?.address === address)
          : undefined;

      let acc = exists;

      // cria caso não exista (idempotente)
      if (!acc) {
        if (typeof addWatchOnly === 'function') {
          acc = addWatchOnly(address, name || 'Conta');
        } else {
          // fallback defensivo: injeta direto no estado sem depender de métodos
          const newAcc = {
            id: (globalThis.crypto as any)?.randomUUID?.() || String(Math.random()),
            address,
            name: name || 'Conta',
            type: 'watch',
          };
          const next = Array.isArray(list) ? [...list, newAcc] : [newAcc];

          const patch: any = {};
          if ('accounts' in (st || {})) patch.accounts = next;
          if ('all' in (st || {})) patch.all = next;
          setState?.(patch);

          acc = newAcc;
        }
      }

      // ativa a conta
      if (acc?.id) {
        if (typeof setActive === 'function') {
          setActive(acc.id);
        } else {
          setState?.({ active: acc });
        }
      }
    };

    const onLoggedOut = () => {
      if (typeof clearActive === 'function') {
        clearActive();
      } else {
        setState?.({ active: undefined });
      }
    };

    (globalThis as any).addEventListener(AUTH_LOGGED_IN, onLoggedIn as EventListener);
    (globalThis as any).addEventListener(AUTH_LOGGED_OUT, onLoggedOut as EventListener);

    return () => {
      (globalThis as any).removeEventListener(AUTH_LOGGED_IN, onLoggedIn as EventListener);
      (globalThis as any).removeEventListener(AUTH_LOGGED_OUT, onLoggedOut as EventListener);
    };
  }, [addWatchOnly, setActive, clearActive, getByAddress, getState, setState]);

  return <></>;
}
