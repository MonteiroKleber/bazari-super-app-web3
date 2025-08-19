
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Plus, 
  Image as ImageIcon, 
  ExternalLink, 
  Check,
  AlertTriangle,
  Eye,
  Globe
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { useNfts } from '../hooks/useNfts'
import { AddNftParams } from '../types/wallet.types'
import { toast } from '@features/notifications/components/NotificationToastHost'

interface NftFormData {
  collectionId: string
  name: string
  endpoint: string
  previewUrl: string
  description: string
}

const POPULAR_COLLECTIONS = [
  {
    id: 'substrate-kitties',
    name: 'Substrate Kitties',
    description: 'Colecionáveis únicos na rede Substrate',
    endpoint: 'https://api.substrate-kitties.io',
    previewUrl: 'https://substrate-kitties.io/kitty/',
    type: 'ERC-721'
  },
  {
    id: 'polkadot-punks',
    name: 'Polkadot Punks',
    description: 'Arte digital pixelizada no ecossistema Polkadot',
    endpoint: 'https://api.polkadotpunks.com',
    previewUrl: 'https://polkadotpunks.com/punk/',
    type: 'Unique NFT'
  },
  {
    id: 'kusama-birds',
    name: 'Kusama Birds',
    description: 'Pássaros colecionáveis raros',
    endpoint: 'https://api.kusamabirds.art',
    previewUrl: 'https://kusamabirds.art/bird/',
    type: 'ORML NFT'
  }
]

export const AddNft: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { addCustomNft } = useWalletStore()
  const { customNfts } = useNfts()
  
  const [step, setStep] = React.useState<'collection' | 'form' | 'preview' | 'success'>('collection')
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedCollection, setSelectedCollection] = React.useState<any>(null)
  const [previewData, setPreviewData] = React.useState<any>(null)
  
  const [formData, setFormData] = React.useState<NftFormData>({
    collectionId: '',
    name: '',
    endpoint: '',
    previewUrl: '',
    description: ''
  })

  const handleSelectCollection = (collection: any) => {
    setSelectedCollection(collection)
    setFormData({
      collectionId: collection.id,
      name: collection.name,
      endpoint: collection.endpoint,
      previewUrl: collection.previewUrl,
      description: collection.description
    })
    setStep('form')
  }

  const handleCustomCollection = () => {
    setSelectedCollection(null)
    setFormData({
      collectionId: '',
      name: '',
      endpoint: '',
      previewUrl: '',
      description: ''
    })
    setStep('form')
  }

  const validateForm = (): string | null => {
    if (!formData.collectionId.trim()) {
      return t('wallet.add_nft.collection_id_required') || 'ID da coleção é obrigatório'
    }
    
    if (!formData.name.trim()) {
      return t('wallet.add_nft.name_required') || 'Nome é obrigatório'
    }
    
    // Check if collection already exists
    const exists = customNfts.some(nft => 
      nft.collection === formData.collectionId
    )
    
    if (exists) {
      return t('wallet.add_nft.already_exists') || 'Esta coleção já foi adicionada'
    }
    
    return null
  }

  const handlePreview = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate API call to fetch collection data
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock preview data
      const mockPreview = {
        collection: formData.collectionId,
        name: formData.name,
        description: formData.description || 'Coleção de NFTs personalizados',
        totalSupply: Math.floor(Math.random() * 10000) + 100,
        floorPrice: (Math.random() * 10 + 1).toFixed(2),
        verified: Math.random() > 0.5,
        preview: {
          id: '001',
          name: `${formData.name} #001`,
          image: `https://via.placeholder.com/400x400/8B0000/FFFFFF?text=${formData.name.charAt(0)}`,
          attributes: [
            { trait_type: 'Rarity', value: 'Common' },
            { trait_type: 'Background', value: 'Blue' },
            { trait_type: 'Type', value: 'Original' }
          ]
        }
      }
      
      setPreviewData(mockPreview)
      setStep('preview')
      
    } catch (error) {
      toast.error(error.message || 'Erro ao carregar preview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNft = async () => {
    setIsLoading(true)
    
    try {
      const nftParams: AddNftParams = {
        collectionId: formData.collectionId,
        name: formData.name,
        endpoint: formData.endpoint || undefined,
        previewUrl: formData.previewUrl || undefined
      }
      
      addCustomNft(nftParams)
      setStep('success')
      
      toast.success(t('wallet.add_nft.success') || 'Coleção NFT adicionada!')
      
    } catch (error) {
      toast.error(error.message || 'Erro ao adicionar NFT')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = () => {
    navigate('/wallet')
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => navigate('/wallet')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t('common.back') || 'Voltar'}
            </Button>
            
            <h1 className="text-3xl font-bold text-matte-black-900">
              {t('wallet.add_nft.title') || 'Adicionar NFT'}
            </h1>
          </div>
          
          <p className="text-matte-black-600">
            {t('wallet.add_nft.description') || 'Adicione coleções de NFTs para visualização na sua carteira.'}
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-2">
            {[
              { key: 'collection', label: t('wallet.add_nft.step_collection') || 'Coleção' },
              { key: 'form', label: t('wallet.add_nft.step_details') || 'Detalhes' },
              { key: 'preview', label: t('wallet.add_nft.step_preview') || 'Preview' },
              { key: 'success', label: t('wallet.add_nft.step_success') || 'Sucesso' }
            ].map((stepItem, index, array) => (
              <React.Fragment key={stepItem.key}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepItem.key ? 'bg-bazari-red text-white' :
                  array.findIndex(s => s.key === step) > index ? 'bg-success text-white' :
                  'bg-sand-200 text-matte-black-600'
                }`}>
                  {array.findIndex(s => s.key === step) > index ? <Check size={16} /> : index + 1}
                </div>
                {index < array.length - 1 && (
                  <div className={`h-1 w-8 ${
                    array.findIndex(s => s.key === step) > index ? 'bg-success' : 'bg-sand-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6">
            {step === 'collection' && (
              <CollectionSelectionStep
                popularCollections={POPULAR_COLLECTIONS}
                onSelectCollection={handleSelectCollection}
                onCustomCollection={handleCustomCollection}
              />
            )}
            
            {step === 'form' && (
              <NftFormStep
                formData={formData}
                setFormData={setFormData}
                selectedCollection={selectedCollection}
                isLoading={isLoading}
                onPreview={handlePreview}
                onBack={() => setStep('collection')}
                validateForm={validateForm}
              />
            )}
            
            {step === 'preview' && previewData && (
              <PreviewStep
                formData={formData}
                previewData={previewData}
                isLoading={isLoading}
                onAddNft={handleAddNft}
                onBack={() => setStep('form')}
              />
            )}
            
            {step === 'success' && (
              <SuccessStep
                collectionData={formData}
                onFinish={handleFinish}
                onAddAnother={() => {
                  setStep('collection')
                  setSelectedCollection(null)
                  setPreviewData(null)
                  setFormData({
                    collectionId: '',
                    name: '',
                    endpoint: '',
                    previewUrl: '',
                    description: ''
                  })
                }}
              />
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Step Components

interface CollectionSelectionStepProps {
  popularCollections: any[]
  onSelectCollection: (collection: any) => void
  onCustomCollection: () => void
}

const CollectionSelectionStep: React.FC<CollectionSelectionStepProps> = ({
  popularCollections,
  onSelectCollection,
  onCustomCollection
}) => {
  const { t } = useI18n()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {t('wallet.add_nft.select_collection') || 'Selecionar Coleção'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.add_nft.select_description') || 'Escolha uma coleção popular ou adicione uma personalizada.'}
        </p>
      </div>
      
      {/* Popular Collections */}
      <div>
        <h3 className="font-medium text-matte-black-900 mb-3">
          {t('wallet.add_nft.popular_collections') || 'Coleções Populares'}
        </h3>
        
        <div className="space-y-3">
          {popularCollections.map(collection => (
            <button
              key={collection.id}
              onClick={() => onSelectCollection(collection)}
              className="w-full p-4 bg-sand-50 hover:bg-sand-100 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
                    <ImageIcon size={24} className="text-white" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-matte-black-900">
                        {collection.name}
                      </h4>
                      <Badge variant="outline" size="sm">
                        {collection.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-matte-black-600">
                      {collection.description}
                    </p>
                    <p className="text-xs text-matte-black-500 mt-1">
                      ID: {collection.id}
                    </p>
                  </div>
                </div>
                
                <Plus size={20} className="text-matte-black-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Custom Collection Option */}
      <div className="pt-4 border-t border-sand-200">
        <Button
          onClick={onCustomCollection}
          variant="outline"
          className="w-full h-16 flex items-center justify-center"
        >
          <Plus size={20} className="mr-3" />
          <div>
            <p className="font-medium">{t('wallet.add_nft.custom_collection') || 'Coleção Personalizada'}</p>
            <p className="text-sm text-matte-black-600">
              {t('wallet.add_nft.custom_description') || 'Adicionar coleção manualmente'}
            </p>
          </div>
        </Button>
      </div>
    </div>
  )
}

interface NftFormStepProps {
  formData: NftFormData
  setFormData: (data: NftFormData) => void
  selectedCollection: any
  isLoading: boolean
  onPreview: () => void
  onBack: () => void
  validateForm: () => string | null
}

const NftFormStep: React.FC<NftFormStepProps> = ({
  formData,
  setFormData,
  selectedCollection,
  isLoading,
  onPreview,
  onBack,
  validateForm
}) => {
  const { t } = useI18n()
  const error = validateForm()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {selectedCollection 
            ? t('wallet.add_nft.confirm_collection') || 'Confirmar Coleção'
            : t('wallet.add_nft.collection_details') || 'Detalhes da Coleção'
          }
        </h2>
        <p className="text-matte-black-600">
          {selectedCollection
            ? t('wallet.add_nft.confirm_description') || 'Verifique os dados da coleção.'
            : t('wallet.add_nft.details_description') || 'Preencha as informações da coleção NFT.'
          }
        </p>
      </div>
      
      {selectedCollection && (
        <div className="p-4 bg-sand-50 rounded-xl mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
              <ImageIcon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-medium text-matte-black-900">
                {selectedCollection.name}
              </h3>
              <p className="text-sm text-matte-black-600">
                {selectedCollection.description}
              </p>
              <Badge variant="outline" size="sm" className="mt-1">
                {selectedCollection.type}
              </Badge>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <Input
          label={t('wallet.add_nft.collection_id') || 'ID da Coleção'}
          placeholder="substrate-kitties"
          value={formData.collectionId}
          onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
          disabled={!!selectedCollection}
        />
        
        <Input
          label={t('wallet.add_nft.collection_name') || 'Nome da Coleção'}
          placeholder="Substrate Kitties"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={!!selectedCollection}
        />
        
        <Input
          label={t('wallet.add_nft.api_endpoint') || 'Endpoint da API (Opcional)'}
          placeholder="https://api.substrate-kitties.io"
          value={formData.endpoint}
          onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
          rightIcon={<Globe size={16} className="text-matte-black-400" />}
        />
        
        <Input
          label={t('wallet.add_nft.preview_url') || 'URL de Preview (Opcional)'}
          placeholder="https://substrate-kitties.io/kitty/"
          value={formData.previewUrl}
          onChange={(e) => setFormData({ ...formData, previewUrl: e.target.value })}
          rightIcon={<ExternalLink size={16} className="text-matte-black-400" />}
        />
        
        <div>
          <label className="block text-sm font-medium text-matte-black-700 mb-2">
            {t('wallet.add_nft.description') || 'Descrição (Opcional)'}
          </label>
          <textarea
            className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent resize-none"
            rows={3}
            placeholder={t('wallet.add_nft.description_placeholder') || 'Descrição da coleção NFT...'}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
      
      {/* Info */}
      <div className="p-4 bg-sand-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle size={20} className="text-bazari-gold mt-0.5" />
          <div>
            <p className="text-sm font-medium text-matte-black-800 mb-1">
              {t('wallet.add_nft.info_title') || 'Informação'}
            </p>
            <p className="text-sm text-matte-black-700">
              {t('wallet.add_nft.info_description') || 'Esta função adiciona a coleção para visualização apenas. NFTs reais devem ser recebidos via transferência.'}
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-sm text-danger-800">{error}</p>
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('common.back') || 'Voltar'}
        </Button>
        
        <Button
          onClick={onPreview}
          variant="primary"
          className="flex-1"
          disabled={isLoading || !!error}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <Eye size={16} className="mr-2" />}
          {t('wallet.add_nft.preview') || 'Preview'}
        </Button>
      </div>
    </div>
  )
}

interface PreviewStepProps {
  formData: NftFormData
  previewData: any
  isLoading: boolean
  onAddNft: () => void
  onBack: () => void
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  formData,
  previewData,
  isLoading,
  onAddNft,
  onBack
}) => {
  const { t } = useI18n()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {t('wallet.add_nft.preview_title') || 'Preview da Coleção'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.add_nft.preview_description') || 'Veja como a coleção aparecerá na sua carteira.'}
        </p>
      </div>
      
      {/* Collection Info */}
      <div className="p-4 bg-sand-50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
              <ImageIcon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-medium text-matte-black-900">
                {previewData.name}
              </h3>
              <p className="text-sm text-matte-black-600">
                {previewData.description}
              </p>
            </div>
          </div>
          
          {previewData.verified && (
            <Badge variant="success" size="sm">
              <Check size={12} className="mr-1" />
              {t('wallet.add_nft.verified') || 'Verificado'}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="font-medium text-matte-black-900">{previewData.totalSupply}</p>
            <p className="text-matte-black-600">{t('wallet.add_nft.total_supply') || 'Total'}</p>
          </div>
          <div>
            <p className="font-medium text-matte-black-900">{previewData.floorPrice} BZR</p>
            <p className="text-matte-black-600">{t('wallet.add_nft.floor_price') || 'Preço Mín.'}</p>
          </div>
          <div>
            <p className="font-medium text-matte-black-900">{previewData.collection}</p>
            <p className="text-matte-black-600">{t('wallet.add_nft.collection_id') || 'ID'}</p>
          </div>
        </div>
      </div>
      
      {/* Sample NFT Preview */}
      <div>
        <h3 className="font-medium text-matte-black-900 mb-3">
          {t('wallet.add_nft.sample_preview') || 'Exemplo de NFT'}
        </h3>
        
        <div className="bg-white rounded-xl border border-sand-200 overflow-hidden max-w-sm mx-auto">
          <div className="aspect-square bg-sand-100">
            <img
              src={previewData.preview.image}
              alt={previewData.preview.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-4">
            <h4 className="font-medium text-matte-black-900 mb-2">
              {previewData.preview.name}
            </h4>
            
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" size="sm">
                {previewData.collection}
              </Badge>
              <span className="text-xs text-matte-black-500">
                #{previewData.preview.id}
              </span>
            </div>
            
            <div className="space-y-2">
              {previewData.preview.attributes.map((attr: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-matte-black-600">{attr.trait_type}:</span>
                  <span className="font-medium text-matte-black-900">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('common.back') || 'Voltar'}
        </Button>
        
        <Button
          onClick={onAddNft}
          variant="primary"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <Plus size={16} className="mr-2" />}
          {t('wallet.add_nft.add') || 'Adicionar Coleção'}
        </Button>
      </div>
    </div>
  )
}

interface SuccessStepProps {
  collectionData: NftFormData
  onFinish: () => void
  onAddAnother: () => void
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  collectionData,
  onFinish,
  onAddAnother
}) => {
  const { t } = useI18n()
  
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
        <Check size={32} className="text-success" />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {t('wallet.add_nft.success_title') || 'Coleção Adicionada!'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.add_nft.success_description') || 'A coleção NFT foi adicionada à sua carteira com sucesso.'}
        </p>
      </div>
      
      {/* Collection Preview */}
      <div className="p-4 bg-sand-50 rounded-xl">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
            <ImageIcon size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-medium text-matte-black-900">
              {collectionData.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-matte-black-600">
              <Badge variant="outline" size="sm">
                ID: {collectionData.collectionId}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button
          onClick={onAddAnother}
          variant="outline"
          className="flex-1"
        >
          <Plus size={16} className="mr-2" />
          {t('wallet.add_nft.add_another') || 'Adicionar Outra'}
        </Button>
        
        <Button
          onClick={onFinish}
          variant="primary"
          className="flex-1"
        >
          {t('wallet.back_to_wallet') || 'Voltar à Carteira'}
        </Button>
      </div>
    </div>
  )
}