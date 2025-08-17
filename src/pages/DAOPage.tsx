import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { DAOHome } from '@features/dao/components/DAOHome'
import { DAOProposal } from '@features/dao/components/DAOProposal'
import { DAOCreate } from '@features/dao/components/DAOCreate'

const DAOPage: React.FC = () => {
  return (
    <AppShell returnTo="/dashboard">
      <Routes>
        <Route path="/" element={<DAOHome />} />
        <Route path="/proposal/:id" element={<DAOProposal />} />
        <Route path="/create" element={<DAOCreate />} />
      </Routes>
    </AppShell>
  )
}

export default DAOPage
