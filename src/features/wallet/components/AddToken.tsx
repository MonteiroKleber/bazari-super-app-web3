
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  AlertTriangle, 
  Check,
  ExternalLink,
  Info
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Badge } from '@shared/ui/Badge'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { useTokens } from '../hooks/useTokens'
import { AddTokenParams } from '../types/wallet.types'
import { toast } from '@features/notifications/components/NotificationToastHost'

interface TokenFormData {
  assetId: string
  name: string
  symbol: string
  decimals: string
  iconUrl: string
}

const POPULAR_TOKENS = [
  {
    assetId: '1337',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    iconUrl: '',
    description: 'Stablecoin pareada ao dólar americano'
  },
  {
    assetId: '1984',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    iconUrl: '',
    description: 'Bitcoin tokenizado no Substrate'
  },
  {
    assetId: '2001',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    iconUrl: '',
    description: 'Ethereum bridgeado'
  },
  {
    assetId: '3000',
    name: 'Chainlink',
    symbol: 'LINK',
    decimals: 18,
    iconUrl: '',
    description: 'Oracle descentralizado'
  }
]

export const AddToken: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { addCustomToken } = useWalletStore()
  const { tokens, customTokens } = useTokens()
  
  const [step, setStep] = React.useState<'search' | 'form' | 'success'>('search')
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedToken, setSelectedToken] = React.useState<any>(null)
  
  const [formData, setFormData] = React.useState<TokenFormData>({
    assetId: '',
    name: '',
    symbol: '',
    decimals: '18',
    iconUrl: ''
  })

  const allExistingTokens = [...tokens, ...customTokens]
  
  const filteredPopularTokens = POPULAR_TOKENS.filter(token => {
    const alreadyExists = allExistingTokens.some(existing => 
      existing.assetId === token.assetId || existing.symbol === token.symbol
    )
    
    if (alreadyExists) return false
    
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query) ||
      token.assetId.includes(query)
    )
  })

  const handleSelectPopularToken = (token: any) => {
    setFormData({
      assetId: token.assetId,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals.toString(),
      iconUrl: token.iconUrl || ''
    })
    setSelectedToken(token)
    setStep('form')
  }

  const handleCustomToken = () => {
    setFormData({
      assetId: '',
      name: '',
      symbol: '',
      decimals: '18',
      iconUrl: ''
    })
    setSelectedToken(null)
    setStep('form')
  }

  const validateForm = (): string | null => {
    if (!formData.assetId.trim()) {
      return t('wallet.add_token.asset_id_required') || 'Asset ID é obrigatório'
    }
    
    if (!formData.name.trim()) {
      return t('wallet.add_token.name_required') || 'Nome é obrigatório'
    }
    
    if (!formData.symbol.trim()) {
      return t('wallet.add_token.symbol_required') || 'Símbolo é obrigatório'
    }
    
    const decimals = parseInt(formData.decimals)
    if (isNaN(decimals) || decimals < 0 || decimals > 32) {
      return t('wallet.add_token.invalid_decimals') || 'Decimais devem ser entre 0 e 32'
    }
    
    // Check if token already exists
    const exists = allExistingTokens.some(token => 
      token.assetId === formData.assetId || token.symbol.toLowerCase() === formData.symbol.toLowerCase()
    )
    
    if (exists) {
      return t('wallet.add_token.already_exists') || 'Token já existe na sua carteira'
    }
    
    return null
  }

  const handleAddToken = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const tokenParams: AddTokenParams = {
        assetId: formData.assetId,
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        decimals: parseInt(formData.decimals),
        iconUrl: formData.iconUrl || undefined
      }
      
      addCustomToken(tokenParams)
      setStep('success')
      
      toast.success(t('wallet.add_token.success') || 'Token adicionado com sucesso!')
      
    } catch (error) {
      toast.error(error.message || 'Erro ao adicionar token')
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
              {t('wallet.add_token.title') || 'Adicionar Token'}
            </h1>
          </div>
          
          <p className="text-matte-black-600">
            {t('wallet.add_token.description') || 'Adicione tokens personalizados à sua carteira.'}
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'search' ? 'bg-bazari-red text-white' : 'bg-success text-white'
            }`}>
              {step === 'search' ? '1' : <Check size={16} />}
            </div>
            <div className={`h-1 flex-1 ${step !== 'search' ? 'bg-success' : 'bg-sand-200'}`} />
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'form' ? 'bg-bazari-red text-white' : 
              step === 'success' ? 'bg-success text-white' : 'bg-sand-200 text-matte-black-600'
            }`}>
              {step === 'success' ? <Check size={16} /> : '2'}
            </div>
            <div className={`h-1 flex-1 ${step === 'success' ? 'bg-success' : 'bg-sand-200'}`} />
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'success' ? 'bg-bazari-red text-white' : 'bg-sand-200 text-matte-black-600'
            }`}>
              {step === 'success' ? <Check size={16} /> : '3'}
            </div>
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
            {step === 'search' && (
              <SearchTokenStep
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredPopularTokens={filteredPopularTokens}
                onSelectPopularToken={handleSelectPopularToken}
                onCustomToken={handleCustomToken}
              />
            )}
            
            {step === 'form' && (
              <TokenFormStep
                formData={formData}
                setFormData={setFormData}
                selectedToken={selectedToken}
                isLoading={isLoading}
                onAddToken={handleAddToken}
                onBack={() => setStep('search')}
                validateForm={validateForm}
              />
            )}
            
            {step === 'success' && (
              <SuccessStep
                tokenData={formData}
                onFinish={handleFinish}
                onAddAnother={() => {
                  setStep('search')
                  setSearchQuery('')
                  setSelectedToken(null)
                  setFormData({
                    assetId: '',
                    name: '',
                    symbol: '',
                    decimals: '18',
                    iconUrl: ''
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

interface SearchTokenStepProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredPopularTokens: any[]
  onSelectPopularToken: (token: any) => void
  onCustomToken: () => void
}

const SearchTokenStep: React.FC<SearchTokenStepProps> = ({
  searchQuery,
  setSearchQuery,
  filteredPopularTokens,
  onSelectPopularToken,
  onCustomToken
}) => {
  const { t } = useI18n()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {t('wallet.add_token.search_title') || 'Buscar Token'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.add_token.search_description') || 'Escolha um token popular ou adicione um personalizado.'}
        </p>
      </div>
      
      <Input
        placeholder={t('wallet.add_token.search_placeholder') || 'Buscar por nome, símbolo ou Asset ID...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftIcon={<Search size={20} />}
      />
      
      {/* Popular Tokens */}
      <div>
        <h3 className="font-medium text-matte-black-900 mb-3">
          {t('wallet.add_token.popular_tokens') || 'Tokens Populares'}
        </h3>
        
        {filteredPopularTokens.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-matte-black-600 mb-4">
              {searchQuery 
                ? t('wallet.add_token.no_results') || 'Nenhum token encontrado'
                : t('wallet.add_token.all_added') || 'Todos os tokens populares já foram adicionados'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPopularTokens.map(token => (
              <button
                key={token.assetId}
                onClick={() => onSelectPopularToken(token)}
                className="w-full p-4 bg-sand-50 hover:bg-sand-100 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {token.symbol.charAt(0)}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-matte-black-900">
                        {token.name} ({token.symbol})
                      </h4>
                      <p className="text-sm text-matte-black-600">
                        {token.description}
                      </p>
                      <p className="text-xs text-matte-black-500">
                        Asset ID: {token.assetId} • {token.decimals} decimais
                      </p>
                    </div>
                  </div>
                  
                  <Plus size={20} className="text-matte-black-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Custom Token Option */}
      <div className="pt-4 border-t border-sand-200">
        <Button
          onClick={onCustomToken}
          variant="outline"
          className="w-full h-16 flex items-center justify-center"
        >
          <Plus size={20} className="mr-3" />
          <div>
            <p className="font-medium">{t('wallet.add_token.custom_token') || 'Token Personalizado'}</p>
            <p className="text-sm text-matte-black-600">
              {t('wallet.add_token.custom_description') || 'Adicionar manualmente por Asset ID'}
            </p>
          </div>
        </Button>
      </div>
    </div>
  )
}

interface TokenFormStepProps {
  formData: TokenFormData
  setFormData: (data: TokenFormData) => void
  selectedToken: any
  isLoading: boolean
  onAddToken: () => void
  onBack: () => void
  validateForm: () => string | null
}

const TokenFormStep: React.FC<TokenFormStepProps> = ({
  formData,
  setFormData,
  selectedToken,
  isLoading,
  onAddToken,
  onBack,
  validateForm
}) => {
  const { t } = useI18n()
  const error = validateForm()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {selectedToken 
            ? t('wallet.add_token.confirm_token') || 'Confirmar Token'
            : t('wallet.add_token.token_details') || 'Detalhes do Token'
          }
        </h2>
        <p className="text-matte-black-600">
          {selectedToken
            ? t('wallet.add_token.confirm_description') || 'Verifique os dados do token antes de adicionar.'
            : t('wallet.add_token.details_description') || 'Preencha as informações do token personalizado.'
          }
        </p>
      </div>
      
      {selectedToken && (
        <div className="p-4 bg-sand-50 rounded-xl mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {selectedToken.symbol.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-matte-black-900">
                {selectedToken.name} ({selectedToken.symbol})
              </h3>
              <p className="text-sm text-matte-black-600">
                {selectedToken.description}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('wallet.add_token.asset_id') || 'Asset ID'}
          placeholder="1337"
          value={formData.assetId}
          onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
          disabled={!!selectedToken}
        />
        
        <Input
          label={t('wallet.add_token.decimals') || 'Decimais'}
          type="number"
          min="0"
          max="32"
          placeholder="18"
          value={formData.decimals}
          onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
          disabled={!!selectedToken}
        />
      </div>
      
      <Input
        label={t('wallet.add_token.name') || 'Nome do Token'}
        placeholder="USD Coin"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={!!selectedToken}
      />
      
      <Input
        label={t('wallet.add_token.symbol') || 'Símbolo'}
        placeholder="USDC"
        value={formData.symbol}
        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
        disabled={!!selectedToken}
      />
      
      <Input
        label={t('wallet.add_token.icon_url') || 'URL do Ícone (Opcional)'}
        placeholder="https://example.com/token-icon.png"
        value={formData.iconUrl}
        onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
      />
      
      {/* Warning */}
      <div className="p-4 bg-bazari-red-50 border border-bazari-red-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle size={20} className="text-bazari-red mt-0.5" />
          <div>
            <p className="text-sm font-medium text-bazari-red-800 mb-1">
              {t('wallet.add_token.warning_title') || 'Importante!'}
            </p>
            <ul className="text-sm text-bazari-red-700 space-y-1">
              <li>• {t('wallet.add_token.warning_1') || 'Verifique se o Asset ID está correto'}</li>
              <li>• {t('wallet.add_token.warning_2') || 'Tokens falsos podem causar perda de fundos'}</li>
              <li>• {t('wallet.add_token.warning_3') || 'Confirme os dados em fontes oficiais'}</li>
            </ul>
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
          onClick={onAddToken}
          variant="primary"
          className="flex-1"
          disabled={isLoading || !!error}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <Plus size={16} className="mr-2" />}
          {t('wallet.add_token.add') || 'Adicionar Token'}
        </Button>
      </div>
    </div>
  )
}

interface SuccessStepProps {
  tokenData: TokenFormData
  onFinish: () => void
  onAddAnother: () => void
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  tokenData,
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
          {t('wallet.add_token.success_title') || 'Token Adicionado!'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.add_token.success_description') || 'O token foi adicionado à sua carteira com sucesso.'}
        </p>
      </div>
      
      {/* Token Preview */}
      <div className="p-4 bg-sand-50 rounded-xl">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {tokenData.symbol.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-matte-black-900">
              {tokenData.name} ({tokenData.symbol})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-matte-black-600">
              <Badge variant="outline" size="sm">
                Asset ID: {tokenData.assetId}
              </Badge>
              <Badge variant="outline" size="sm">
                {tokenData.decimals} decimais
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
          {t('wallet.add_token.add_another') || 'Adicionar Outro'}
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