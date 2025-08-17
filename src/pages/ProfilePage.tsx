import React from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { ProfileView } from '@features/profile/components/ProfileView'
import { ProfileEdit } from '@features/profile/components/ProfileEdit'
import { useAuthStore } from '@features/auth/store/authStore'

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  
  const isOwnProfile = !id || id === user?.id

  return (
    <AppShell returnTo="/dashboard">
      {isOwnProfile ? <ProfileEdit /> : <ProfileView profileId={id!} />}
    </AppShell>
  )
}

export default ProfilePage
