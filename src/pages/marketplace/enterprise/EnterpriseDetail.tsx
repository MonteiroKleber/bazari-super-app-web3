// src/pages/marketplace/enterprise/EnterpriseDetail.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Star, 
  Verified, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram,
  MessageCircle,
  TrendingUp,
  Package,
  Clock,
  Shield,
  Coins,
  ExternalLink,
  Share2
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { Tabs } from '@shared/ui/Tabs'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'
import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
import { useAuthStore } from '@features/auth/store/authStore'

export const EnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { 
    currentEnterprise, 
    fetchEnterpriseById, 
    isLoading,
    toggleEnterpriseTokenization 
  } = useEnterpriseStore()
  const { listings } = useMarketplaceStore()
  
  const [activeTab, setActiveTab] = React.useState('overview')

  React.useEffect(() => {
    if (id) {
      fetchEnterpriseById(id)
    }
  }, [id, fetchEnterpriseById])

  if (isLoading || !currentEnterprise) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const enterprise = currentEnterprise
  const isOwner = user?.id === enterprise.ownerId
  const enterpriseListings = listings.filter(l => l.sellerId === enterprise.ownerId)

  const formatCurrency = (amount: number, currency: 'BZR' | 'BRL') => {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    }
    return `${amount.toLocaleString('pt-BR')} BZR`
  }

  const handleContactEnterprise = () => {
    navigate(`/profile/${enterprise.ownerId}?from=enterprise&id=${enterprise.id}`)
  }

  const handleToggleTokenization = async () => {
    try {
      await toggleEnterpriseTokenization(enterprise.id, !enterprise.tokenization?.enabled)
    } catch (error) {
      console.error('Error toggling tokenization:', error)
    }
  }

  const tabsData = [
    {
      id: 'overview',
      label: 'Visão Geral',
      content: (
        <div className="space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
              Sobre o Empreendimento
            </h3>
            <p className="text-matte-black-700 leading-relaxed">
              {enterprise.description}
            </p>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Package className="mx-auto text-bazari-red mb-2" size={24} />
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.stats.activeListings}
              </p>
              <p className="text-sm text-matte-black-600">Produtos Ativos</p>
            </Card>
            
            <Card className="p-4 text-center">
              <TrendingUp className="mx-auto text-success mb-2" size={24} />
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.stats.soldListings}
              </p>
              <p className="text-sm text-matte-black-600">Vendas Realizadas</p>
            </Card>
            
            <Card className="p-4 text-center">
              <Star className="mx-auto text-bazari-gold-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.reputation.rating.toFixed(1)}
              </p>
              <p className="text-sm text-matte-black-600">Avaliação Média</p>
            </Card>
            
            <Card className="p-4 text-center">
              <Clock className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-matte-black-900">
                {enterprise.stats.avgResponseTime}min
              </p>
              <p className="text-sm text-matte-black-600">Tempo Resposta</p>
            </Card>
          </div>

          {/* Business Hours */}
          {enterprise.settings.businessHours && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                Horário de Funcionamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(enterprise.settings.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center p-3 bg-sand-50 rounded-lg">
                    <span className="font-medium text-matte-black-900 capitalize">
                      {day}
                    </span>
                    <span className="text-matte-black-700">
                      {hours.closed ? 'Fechado' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'products',
      label: 'Produtos',
      content: (
        <div className="space-y-6">
          {enterpriseListings.length === 0 ? (
            <Card className="p-8 text-center">
              <Package size={48} className="mx-auto text-matte-black-400 mb-4" />
              <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-matte-black-600">
                Este empreendimento ainda não possui produtos listados.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {enterpriseListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
                >
                  <div className="aspect-video bg-sand-200">
                    {listing.images[0] ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="text-matte-black-400" size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-matte-black-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-bazari-red font-bold text-lg mb-2">
                      {formatCurrency(listing.price, listing.currency)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-matte-black-600">
                      <span>{listing.views} visualizações</span>
                      <Badge variant={listing.status === 'active' ? 'success' : 'secondary'} size="sm">
                        {listing.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'tokenization',
      label: 'Tokenização',
      content: (
        <div className="space-y-6">
          {enterprise.tokenizable ? (
            <>
              {enterprise.tokenization?.enabled ? (
                <>
                  {/* Token Info */}
                  <Card className="p-6 bg-gradient-to-r from-bazari-red-50 to-bazari-gold-50 border border-bazari-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Coins className="text-bazari-red mr-3" size={24} />
                        <h3 className="text-lg font-semibold text-matte-black-900">
                          Token {enterprise.name}
                        </h3>
                      </div>
                      <Badge variant="primary">Ativo</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-matte-black-600">Total Supply</p>
                        <p className="text-xl font-bold text-matte-black-900">
                          {enterprise.tokenization.totalSupply?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-matte-black-600">Disponíveis</p>
                        <p className="text-xl font-bold text-success">
                          {((enterprise.tokenization.totalSupply || 0) - (enterprise.tokenization.currentSupply || 0)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-matte-black-600">Preço</p>
                        <p className="text-xl font-bold text-bazari-red">
                          {formatCurrency(enterprise.tokenization.mintPrice || 0, enterprise.tokenization.mintCurrency || 'BZR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-matte-black-600">Royalty</p>
                        <p className="text-xl font-bold text-bazari-gold-600">
                          {enterprise.tokenization.royaltyPercentage}%
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Token Actions */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                      Investir no Empreendimento
                    </h3>
                    <p className="text-matte-black-700 mb-4">
                      Adquira tokens deste empreendimento e participe dos lucros conforme o crescimento do negócio.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Quantidade de tokens"
                          className="w-full px-4 py-2 border border-sand-200 rounded-lg focus:ring-2 focus:ring-bazari-red-500 focus:border-transparent"
                        />
                      </div>
                      <Button size="lg" disabled={isOwner}>
                        {isOwner ? 'Seu Empreendimento' : 'Comprar Tokens'}
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <Shield className="text-blue-600 mr-2 mt-0.5" size={16} />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Informações Importantes:</p>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            <li>Tokens são transferíveis: {enterprise.tokenization.transferable ? 'Sim' : 'Não'}</li>
                            <li>Royalty de {enterprise.tokenization.royaltyPercentage}% sobre lucros</li>
                            <li>Tokens representam participação no empreendimento</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Token Holders (mock) */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-matte-black-900 mb-4">
                      Principais Detentores
                    </h3>
                    <div className="space-y-3">
                      {[
                        { address: '0x1234...5678', tokens: 2500, percentage: 25 },
                        { address: '0xabcd...efgh', tokens: 1200, percentage: 12 },
                        { address: '0x9876...5432', tokens: 800, percentage: 8 }
                      ].map((holder, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-sand-50 rounded-lg">
                          <div className="flex items-center">
                            <Avatar size="sm" fallback={`${index + 1}`} />
                            <span className="ml-3 font-mono text-sm text-matte-black-700">
                              {holder.address}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-matte-black-900">
                              {holder.tokens.toLocaleString()} tokens
                            </p>
                            <p className="text-sm text-matte-black-600">
                              {holder.percentage}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-6 text-center">
                  <Coins size={48} className="mx-auto text-matte-black-400 mb-4" />
                  <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
                    Tokenização Não Ativada
                  </h3>
                  <p className="text-matte-black-600 mb-4">
                    Este empreendimento suporta tokenização, mas ainda não foi ativada.
                  </p>
                  {isOwner && (
                    <Button onClick={handleToggleTokenization}>
                      Ativar Tokenização
                    </Button>
                  )}
                </Card>
              )}
            </>
          ) : (
            <Card className="p-6 text-center">
              <Coins size={48} className="mx-auto text-matte-black-400 mb-4" />
              <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
                Tokenização Não Disponível
              </h3>
              <p className="text-matte-black-600">
                Este empreendimento não suporta tokenização.
              </p>
            </Card>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Banner */}
        <div className="relative h-64 bg-gradient-to-br from-bazari-red-100 to-bazari-gold-100 rounded-2xl overflow-hidden mb-6">
          {enterprise.banner ? (
            <img 
              src={enterprise.banner} 
              alt={enterprise.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-8xl font-bold text-bazari-red-300">
                {enterprise.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button variant="outline" size="sm">
              <Share2 size={16} className="mr-2" />
              Compartilhar
            </Button>
            {!isOwner && (
              <Button size="sm" onClick={handleContactEnterprise}>
                <MessageCircle size={16} className="mr-2" />
                Entrar em Contato
              </Button>
            )}
          </div>
        </div>

        {/* Enterprise Info */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex items-start space-x-4 mb-4 md:mb-0">
            <Avatar
              src={enterprise.logo}
              alt={enterprise.name}
              fallback={enterprise.name.charAt(0)}
              size="lg"
              className="border-4 border-white shadow-lg"
            />
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-matte-black-900">
                  {enterprise.name}
                </h1>
                {enterprise.verification.verified && (
                  <Verified className="text-success" size={24} />
                )}
                {enterprise.tokenization?.enabled && (
                  <Badge variant="primary">Tokenizado</Badge>
                )}
              </div>
              
              <p className="text-matte-black-600 mb-2">
                por <span className="font-medium">{enterprise.ownerName}</span>
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-matte-black-600">
                <div className="flex items-center">
                  <Star className="text-bazari-gold-600 mr-1" size={16} />
                  {enterprise.reputation.rating.toFixed(1)}
                  <span className="ml-1">({enterprise.reputation.reviewCount} avaliações)</span>
                </div>
                
                {enterprise.address && (
                  <div className="flex items-center">
                    <MapPin className="mr-1" size={16} />
                    {enterprise.address.city}, {enterprise.address.state}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white p-4 rounded-xl border border-sand-200 min-w-64">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(enterprise.stats.totalRevenue.BRL, 'BRL')}
                </p>
                <p className="text-xs text-matte-black-600">Faturamento BRL</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-bazari-red">
                  {formatCurrency(enterprise.stats.totalRevenue.BZR, 'BZR')}
                </p>
                <p className="text-xs text-matte-black-600">Faturamento BZR</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 flex flex-wrap gap-4">
          {enterprise.contact.email && (
            <div className="flex items-center text-sm text-matte-black-600">
              <Mail size={16} className="mr-2" />
              {enterprise.contact.email}
            </div>
          )}
          
          {enterprise.contact.phone && (
            <div className="flex items-center text-sm text-matte-black-600">
              <Phone size={16} className="mr-2" />
              {enterprise.contact.phone}
            </div>
          )}
          
          {enterprise.contact.website && (
            <a 
              href={enterprise.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-bazari-red hover:text-bazari-red-700"
            >
              <Globe size={16} className="mr-2" />
              Website
              <ExternalLink size={12} className="ml-1" />
            </a>
          )}
          
          {enterprise.contact.socialMedia?.instagram && (
            <a 
              href={`https://instagram.com/${enterprise.contact.socialMedia.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-bazari-red hover:text-bazari-red-700"
            >
              <Instagram size={16} className="mr-2" />
              @{enterprise.contact.socialMedia.instagram}
              <ExternalLink size={12} className="ml-1" />
            </a>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs
        tabs={tabsData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}