import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '../store/authStore'
import { AccountTerms } from './AccountTerms'
import { SeedReveal } from './SeedReveal'
import { SeedConfirm } from './SeedConfirm'
import { Card } from '@shared/ui/Card'

type Step = 'terms' | 'reveal' | 'confirm' | 'complete'

export const CreateAccountFlow: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { setSeedPhrase, login } = useAuthStore()
  const [currentStep, setCurrentStep] = React.useState<Step>('terms')
  const [generatedSeed, setGeneratedSeed] = React.useState<string[]>([])

  const generateSeedPhrase = (): string[] => {
    // Mock seed generation - in real app, use proper crypto library
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
    ]
    
    const seedPhrase: string[] = []
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * words.length)
      seedPhrase.push(words[randomIndex])
    }
    return seedPhrase
  }

  const handleTermsAccepted = () => {
    const seed = generateSeedPhrase()
    setGeneratedSeed(seed)
    setSeedPhrase(seed)
    setCurrentStep('reveal')
  }

  const handleSeedRevealed = () => {
    setCurrentStep('confirm')
  }

  const handleSeedConfirmed = () => {
    // Create user account
    const newUser = {
      id: crypto.randomUUID(),
      name: 'Novo Usuário',
      walletAddress: `0x${Array.from(crypto.getRandomValues(new Uint8Array(20)), b => b.toString(16).padStart(2, '0')).join('')}`,
      reputation: {
        rating: 5.0,
        reviewCount: 0
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    login(newUser)
    navigate('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {['terms', 'reveal', 'confirm'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step || (['reveal', 'confirm'].includes(currentStep) && step === 'terms') || (currentStep === 'confirm' && step === 'reveal')
                    ? 'bg-bazari-red text-white'
                    : 'bg-sand-200 text-matte-black-600'
                }`}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    (['reveal', 'confirm'].includes(currentStep) && index === 0) || (currentStep === 'confirm' && index === 1)
                      ? 'bg-bazari-red'
                      : 'bg-sand-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-matte-black-600">
            {currentStep === 'terms' && 'Aceitar Termos'}
            {currentStep === 'reveal' && 'Seed Phrase'}
            {currentStep === 'confirm' && 'Confirmação'}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AccountTerms onAccept={handleTermsAccepted} />
            </motion.div>
          )}

          {currentStep === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SeedReveal 
                seedPhrase={generatedSeed}
                onContinue={handleSeedRevealed}
              />
            </motion.div>
          )}

          {currentStep === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SeedConfirm 
                originalSeed={generatedSeed}
                onConfirmed={handleSeedConfirmed}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}
