import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Users, Zap, ChevronRight, Star } from 'lucide-react'
import { Header } from '@shared/layout/Header'
import { Footer } from '@shared/layout/Footer'
import { Button } from '@shared/ui/Button'
import { Card } from '@shared/ui/Card'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { isAuthenticated } = useAuthStore()

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleGetStarted = () => {
    navigate('/login#create')
  }

  const handleExploreMarketplace = () => {
    navigate('/login') // For now, require login to explore
  }

  return (
    <div className="min-h-screen bg-sand">
      <Header variant="public" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-matte-black-900 mb-6"
            >
              {t('landing.hero.title')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl lg:text-2xl text-matte-black-600 mb-8 max-w-4xl mx-auto"
            >
              {t('landing.hero.subtitle')}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="text-lg px-8 py-4"
              >
                {t('landing.hero.cta_primary')}
                <ArrowRight size={20} className="ml-2" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleExploreMarketplace}
                className="text-lg px-8 py-4"
              >
                {t('landing.hero.cta_secondary')}
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-bazari-gold/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-bazari-red/20 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-matte-black-900 mb-6">
              {t('landing.features.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                titleKey: 'landing.features.decentralized.title',
                descriptionKey: 'landing.features.decentralized.description',
                color: 'text-bazari-red'
              },
              {
                icon: Users,
                titleKey: 'landing.features.p2p.title',
                descriptionKey: 'landing.features.p2p.description',
                color: 'text-bazari-gold-600'
              },
              {
                icon: Zap,
                titleKey: 'landing.features.digital.title',
                descriptionKey: 'landing.features.digital.description',
                color: 'text-success'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="p-8 text-center h-full">
                  <div className={`w-16 h-16 ${feature.color} mx-auto mb-6`}>
                    <feature.icon size={64} />
                  </div>
                  <h3 className="text-xl font-semibold text-matte-black-900 mb-4">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-matte-black-600">
                    {t(feature.descriptionKey)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-matte-black-900 mb-6">
              {t('landing.how_it_works.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                titleKey: 'landing.how_it_works.step1.title',
                descriptionKey: 'landing.how_it_works.step1.description'
              },
              {
                titleKey: 'landing.how_it_works.step2.title',
                descriptionKey: 'landing.how_it_works.step2.description'
              },
              {
                titleKey: 'landing.how_it_works.step3.title',
                descriptionKey: 'landing.how_it_works.step3.description'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <Card className="p-8">
                  <h3 className="text-xl font-semibold text-matte-black-900 mb-4">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-matte-black-600">
                    {t(step.descriptionKey)}
                  </p>
                </Card>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight size={24} className="text-matte-black-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-matte-black-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Junte-se à revolução do comércio descentralizado e tome controle das suas transações.
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-4"
            >
              {t('landing.hero.cta_primary')}
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer variant="public" />
    </div>
  )
}

export default LandingPage
