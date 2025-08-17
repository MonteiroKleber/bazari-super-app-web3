import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Zap, Globe, Heart, Target } from 'lucide-react'
import { Header } from '@shared/layout/Header'
import { Footer } from '@shared/layout/Footer'
import { Card } from '@shared/ui/Card'
import { useAuthStore } from '@features/auth/store/authStore'

const AboutPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-sand">
      <Header variant={isAuthenticated ? 'private' : 'public'} />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-matte-black-900 mb-6">
            Sobre o Bazari
          </h1>
          <p className="text-xl text-matte-black-600 max-w-3xl mx-auto">
            Somos uma plataforma descentralizada que conecta pessoas para trocar valor 
            de forma livre, segura e sem intermediários centralizados.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="p-8 text-center">
            <Target size={48} className="text-bazari-red mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-matte-black-900 mb-4">
              Nossa Missão
            </h2>
            <p className="text-lg text-matte-black-600">
              Democratizar o acesso ao comércio digital, eliminando barreiras e 
              intermediários desnecessários, permitindo que qualquer pessoa possa 
              trocar valor de forma livre e segura.
            </p>
          </Card>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-matte-black-900 text-center mb-12">
            Nossos Valores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Segurança',
                description: 'Priorizamos a proteção dos usuários com tecnologia blockchain e protocolos seguros.'
              },
              {
                icon: Users,
                title: 'Descentralização',
                description: 'Eliminamos intermediários centralizados, dando poder de volta aos usuários.'
              },
              {
                icon: Zap,
                title: 'Inovação',
                description: 'Estamos sempre buscando novas formas de melhorar a experiência de comércio.'
              },
              {
                icon: Globe,
                title: 'Acessibilidade',
                description: 'Tornamos o comércio digital acessível para pessoas do mundo todo.'
              },
              {
                icon: Heart,
                title: 'Comunidade',
                description: 'Valorizamos nossa comunidade e construímos junto com nossos usuários.'
              },
              {
                icon: Target,
                title: 'Transparência',
                description: 'Operamos de forma transparente, com código aberto e governança descentralizada.'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="p-6 text-center h-full">
                  <value.icon size={40} className="text-bazari-red mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-matte-black-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-matte-black-600">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-matte-black-900 mb-6 text-center">
              Tecnologia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-lg font-semibold text-matte-black-900 mb-3">
                  Web3 e Blockchain
                </h3>
                <p className="text-matte-black-600 mb-4">
                  Utilizamos tecnologia blockchain para garantir transparência, 
                  segurança e descentralização em todas as transações.
                </p>
                
                <h3 className="text-lg font-semibold text-matte-black-900 mb-3">
                  IPFS e Armazenamento Descentralizado
                </h3>
                <p className="text-matte-black-600">
                  Conteúdo e dados são armazenados de forma descentralizada, 
                  garantindo resistência à censura e disponibilidade global.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-matte-black-900 mb-3">
                  Smart Contracts
                </h3>
                <p className="text-matte-black-600 mb-4">
                  Contratos inteligentes automatizam escrow e garantem 
                  execução confiável de acordos sem intermediários.
                </p>
                
                <h3 className="text-lg font-semibold text-matte-black-900 mb-3">
                  Governança DAO
                </h3>
                <p className="text-matte-black-600">
                  A comunidade participa ativamente das decisões da plataforma 
                  através de um sistema de governança descentralizada.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      
      <Footer variant={isAuthenticated ? 'private' : 'public'} />
    </div>
  )
}

export default AboutPage
