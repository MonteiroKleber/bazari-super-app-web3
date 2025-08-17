import React from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@shared/ui/Card'

export const SocialPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-matte-black-900 mb-4">
          Post Detalhado
        </h1>
        <p className="text-matte-black-600">
          Visualização detalhada do post {id} será implementada aqui.
        </p>
      </Card>
    </div>
  )
}
