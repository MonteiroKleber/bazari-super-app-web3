import React from 'react'
import { motion } from 'framer-motion'
import { Search, MessageCircle, Book, Shield, HelpCircle } from 'lucide-react'
import { Header } from '@shared/layout/Header'
import { Footer } from '@shared/layout/Footer'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'

const HelpPage: React.FC = () => {
  const { t } = useI18n()
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = React.useState('')

  const faqItems = [
    {
      question: 'Como criar uma conta no Bazari?',
      answer: 'Para criar uma conta, clique em "Criar Conta" na página inicial e siga o processo de geração da seed phrase...'
    },
    {
      question: 'O que é uma seed phrase e como devo guardá-la?',
      answer: 'A seed phrase é uma sequência de 12 palavras que permite recuperar sua conta. Guarde-a em local seguro e nunca a compartilhe...'
    },
    {
      question: 'Como funciona o sistema P2P?',
      answer: 'O sistema P2P permite trocar diretamente com outros usuários usando escrow para segurança...'
    },
    {
      question: 'Como criar um anúncio no marketplace?',
      answer: 'Acesse o marketplace, clique em "Criar Anúncio" e preencha as informações do produto...'
    }
  ]

  return (
    <div className="min-h-screen bg-sand">
      <Header variant={isAuthenticated ? 'private' : 'public'} />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-matte-black-900 mb-4">
            Central de Ajuda
          </h1>
          <p className="text-xl text-matte-black-600 mb-8">
            Como podemos ajudá-lo hoje?
          </p>
          
          <div className="max-w-2xl mx-auto">
            <Input
              placeholder="Buscar na central de ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={20} />}
              className="text-lg"
            />
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Book, title: 'Guia de Início', description: 'Primeiros passos no Bazari' },
            { icon: Shield, title: 'Segurança', description: 'Proteja sua conta e transações' },
            { icon: MessageCircle, title: 'Suporte', description: 'Fale com nossa equipe' },
            { icon: HelpCircle, title: 'FAQ', description: 'Perguntas frequentes' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center h-full hover:shadow-soft-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-bazari-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-bazari-red" />
                </div>
                <h3 className="font-semibold text-matte-black-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-matte-black-600">
                  {item.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-matte-black-900 mb-6">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-matte-black-900 mb-3">
                  {item.question}
                </h3>
                <p className="text-matte-black-600">
                  {item.answer}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-matte-black-900 mb-4">
              Não encontrou o que procurava?
            </h2>
            <p className="text-matte-black-600 mb-6">
              Nossa equipe de suporte está aqui para ajudar você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                <MessageCircle size={16} className="mr-2" />
                Abrir Chat
              </Button>
              <Button variant="outline">
                Enviar Email
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
      
      <Footer variant={isAuthenticated ? 'private' : 'public'} />
    </div>
  )
}

export default HelpPage
