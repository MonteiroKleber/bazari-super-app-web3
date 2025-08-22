import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@shared/layout/AppShell';
import {
  WalletHome,
  SendFlow,
  Receive,
  History,
  AccountsManager,
  AddToken,
  AddNft,
} from '@features/wallet';

// Adaptadores (não têm UI; apenas integração por eventos)
import { AuthEventEmitter } from '@features/wallet/components/AuthEventEmitter';
import { WalletAuthAdapter } from '@features/wallet/components/WalletAuthAdapter';

const WalletPage: React.FC = () => {
  return (
    <AppShell>
      {/* Integração solta Auth ↔ Wallet via Event Bus (Opção A) */}
      <AuthEventEmitter />
      <WalletAuthAdapter />

      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<WalletHome />} />
          <Route path="/send" element={<SendFlow />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/history" element={<History />} />
          <Route path="/accounts" element={<AccountsManager />} />
          <Route path="/add-token" element={<AddToken />} />
          <Route path="/add-nft" element={<AddNft />} />
        </Routes>
      </React.Suspense>
    </AppShell>
  );
};

export default WalletPage;
