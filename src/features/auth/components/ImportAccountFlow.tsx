import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Key } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { ImportSeed } from './ImportSeed'
import { ImportJson } from './ImportJson'
import { useI18n } from '@app/providers/I18nProvider'

type ImportMode = 'select' | 'seed' | 'json'

export const ImportAccountFlow: React.FC = () => {
  const { t } = useI18n()
  const [mode, setMode] = React.useState<ImportMode>('select')

  if (mode === 'seed') {
    return <ImportSeed onBack={() => setMode('select')} />
  }

  if (mode === 'json') {
    return <ImportJson onBack={() => setMode('select')} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-matte-black-900 mb-4">
            {t('auth.login.import_account')}
          </h2>
          <p className="text-matte-black-600">
            Escolha como deseja importar sua conta existente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-soft-lg transition-shadow h-full"
              onClick={() => setMode('seed')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-bazari-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key size={32} className="text-bazari-red" />
                </div>
                <h3 className="text-lg font-semibold text-matte-black-900 mb-3">
                  {t('auth.import.seed_title')}
                </h3>
                <p className="text-sm text-matte-black-600 mb-4">
                  Use suas 12 ou 24 palavras de recuperação
                </p>
                <Button variant="outline" className="w-full">
                  Continuar
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-soft-lg transition-shadow h-full"
              onClick={() => setMode('json')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-bazari-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-bazari-gold-600" />
                </div>
                <h3 className="text-lg font-semibold text-matte-black-900 mb-3">
                  {t('auth.import.json_title')}
                </h3>
                <p className="text-sm text-matte-black-600 mb-4">
                  Importe um arquivo JSON de backup
                </p>
                <Button variant="outline" className="w-full">
                  Continuar
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </Card>
    </div>
  )
}
