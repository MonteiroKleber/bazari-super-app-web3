import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { WalletHome } from '@features/wallet/components/WalletHome'
import { WalletSend } from '@features/wallet/components/WalletSend'
import { WalletReceive } from '@features/wallet/components/WalletReceive'
import { WalletHistory } from '@features/wallet/components/WalletHistory'

const WalletPage: React.FC = () => {
  return (
    <AppShell returnTo="/dashboard">
      <Routes>
        <Route path="/" element={<WalletHome />} />
        <Route path="/send" element={<WalletSend />} />
        <Route path="/receive" element={<WalletReceive />} />
        <Route path="/history" element={<WalletHistory />} />
      </Routes>
    </AppShell>
  )
}

export default WalletPage
