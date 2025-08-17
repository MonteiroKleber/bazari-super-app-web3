import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { AppShell } from '@shared/layout/AppShell'
import { ChatView } from '@features/chat/components/ChatView'

const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const [searchParams] = useSearchParams()
  
  const context = searchParams.get('context')
  const adId = searchParams.get('ad')

  return (
    <AppShell returnTo="/dashboard">
      <ChatView 
        userId={userId!} 
        context={context as 'p2p' | null}
        adId={adId || undefined}
      />
    </AppShell>
  )
}

export default ChatPage
