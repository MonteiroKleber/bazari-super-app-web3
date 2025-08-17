import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { SocialFeed } from '@features/social/components/SocialFeed'
import { SocialPost } from '@features/social/components/SocialPost'
import { SocialCreate } from '@features/social/components/SocialCreate'

const SocialPage: React.FC = () => {
  return (
    <AppShell returnTo="/dashboard">
      <Routes>
        <Route path="/" element={<SocialFeed />} />
        <Route path="/post/:id" element={<SocialPost />} />
        <Route path="/create" element={<SocialCreate />} />
      </Routes>
    </AppShell>
  )
}

export default SocialPage
