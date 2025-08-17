import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { WorkHome } from '@features/work/components/WorkHome'
import { WorkJob } from '@features/work/components/WorkJob'
import { WorkCreate } from '@features/work/components/WorkCreate'

const WorkPage: React.FC = () => {
  return (
    <AppShell returnTo="/dashboard">
      <Routes>
        <Route path="/" element={<WorkHome />} />
        <Route path="/job/:id" element={<WorkJob />} />
        <Route path="/create" element={<WorkCreate />} />
      </Routes>
    </AppShell>
  )
}

export default WorkPage
