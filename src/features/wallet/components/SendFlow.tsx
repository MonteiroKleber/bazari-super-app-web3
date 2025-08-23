import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
  Check,
  QrCode,
  Coins,
  Image as ImageIcon
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Tabs } from '@shared/ui/Tabs'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
// 🔁 REMOVIDO: useActiveAccount
import { useTokens, TokenWithBalance } from '../hooks/useTokens'
import { useNfts, NftWithMetadata } from '../hooks/useNfts'
import { toast } from '@features/notifications/components/NotificationToastHost'
import { useAuthStore } from '@features/auth/store/authStore'
import { useChain } from '@app/providers/ChainProvider'
import type { ApiPromise } from '@polkadot/api'
import { useSignAndSend } from '@features/wallet/hooks/useSignAndSend'

// ---------- Helpers de taxa/transferência ----------
function toPlanck(amountStr: string, decimals: number): bigint {
  const [int = '0', frac = ''] = String(amountStr).trim().split('.')
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  return BigInt(int) * (BigInt(10) ** BigInt(decimals)) + BigInt(fracPadded || '0')
}

async function estimateBalancesFee(api: ApiPromise, fromAddress: string, to: string, amountPlanck: bigint) {
  const tx = api.tx.balances?.transferKeepAlive
    ? api.tx.balances.transferKeepAlive(to, amountPlanck)
    : api.tx.balances.transfer(to, amountPlanck)
  const info = await tx.paymentInfo(fromAddress)
  return info.partialFee.toString()
}

async function estimateUniquesFeeIfAny(api: ApiPromise, fromAddress: string, collection: string | number, id: string | number, to: string) {
  const uniques = (api.tx as any)?.uniques
  if (!uniques?.transfer) return '0'
  const tx = uniques.transfer(collection, id, to)
  const info = await tx.paymentInfo(fromAddress)
  return info.partialFee.toString()
}

function isNativeToken(
  token: TokenWithBalance | undefined,
  nativeToken: TokenWithBalance | undefined
): boolean {
  if (!token || !nativeToken) return false
  if (token.key?.startsWith('native:')) return true
  if (token.symbol === nativeToken.symbol && token.decimals === nativeToken.decimals) return true
  return ((token as any)?.type === 'native')
}

function formatAddress(addr?: string, head = 6, tail = 6) {
  if (!addr) return ''
  if (addr.length <= head + tail + 3) return addr
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`
}
// ---------------------------------------------------

type SendStep = 'asset' | 'recipient' | 'amount' | 'review' | 'result'
type AssetType = 'token' | 'nft'

interface SendData {
  assetType: AssetType
  selectedToken?: TokenWithBalance
  selectedNft?: NftWithMetadata
  recipient: string
  amount: string
  memo?: string
}

export const SendFlow: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const { tokens, nativeToken, getTokenByKey } = useTokens()
  const { nfts } = useNfts()
  const { api } = useChain() as { api?: ApiPromise }
  const signAndSend = useSignAndSend()

  // ======== FONTE ÚNICA: AUTH =========
  const user = useAuthStore(s => (s as any).user)
  const listLocal = useAuthStore(s => (s as any).listLocal as (() => void) | undefined)
  const localAccounts = useAuthStore(s => (s as any).localAccounts as Array<any> | undefined)
  React.useEffect(() => { try { listLocal?.() } catch {} }, [listLocal])

  const authAddress: string | undefined = React.useMemo(
    () => user?.walletAddress || user?.address,
    [user?.walletAddress, user?.address]
  )

  const authEntry = React.useMemo(() => {
    if (!authAddress || !localAccounts) return undefined
    return localAccounts.find(a => a?.address === authAddress)
  }, [localAccounts, authAddress])

  const fromAccount = React.useMemo(() => {
    const name = authEntry?.name || authEntry?.meta?.name || user?.name || 'Minha Conta'
    return { address: authAddress, name }
  }, [authEntry, authAddress, user?.name])

  const isWatchOnlyAuth = React.useMemo(() => {
    if (!authEntry) return false
    return (
      authEntry.type === 'watch' ||
      authEntry.watchOnly === true ||
      authEntry?.meta?.isExternal === true
    )
  }, [authEntry])
  // ====================================

  const [currentStep, setCurrentStep] = React.useState<SendStep>('asset')
  const [isLoading, setIsLoading] = React.useState(false)
  const [estimatedFee, setEstimatedFee] = React.useState<string>('')
  const [transactionHash, setTransactionHash] = React.useState<string>('')

  const [sendData, setSendData] = React.useState<SendData>({
    assetType: 'token',
    recipient: '',
    amount: '',
    memo: ''
  })

  // Preencher via querystring (token/nft)
  React.useEffect(() => {
    const token = searchParams.get('token')
    const nftType = searchParams.get('type')
    const collection = searchParams.get('collection')
    const nftId = searchParams.get('id')

    if (token) {
      const foundToken = getTokenByKey(token)
      if (foundToken) {
        setSendData(prev => ({ ...prev, assetType: 'token', selectedToken: foundToken }))
        setCurrentStep('recipient')
      }
    } else if (nftType === 'nft' && collection && nftId) {
      const foundNft = nfts.find(nft => nft.collection === collection && nft.id === nftId)
      if (foundNft) {
        setSendData(prev => ({ ...prev, assetType: 'nft', selectedNft: foundNft }))
        setCurrentStep('recipient')
      }
    }
  }, [searchParams, getTokenByKey, nfts])

  // Estimar taxa (usa endereço do AUTH!)
  React.useEffect(() => {
    const run = async () => {
      try {
        if (!api || !authAddress || !nativeToken) {
          setEstimatedFee('0')
          return
        }
        if (currentStep !== 'review' || !sendData.recipient) {
          setEstimatedFee('')
          return
        }

        if (sendData.assetType === 'token' && sendData.selectedToken) {
          if (!sendData.amount || parseFloat(sendData.amount) <= 0) {
            setEstimatedFee('0')
            return
          }
          if (isNativeToken(sendData.selectedToken, nativeToken)) {
            const planck = toPlanck(sendData.amount, sendData.selectedToken.decimals)
            const fee = await estimateBalancesFee(api, authAddress, sendData.recipient, planck)
            setEstimatedFee(fee)
          } else {
            setEstimatedFee('0') // TODO: estimar p/ assets não nativos
          }
        } else if (sendData.assetType === 'nft' && sendData.selectedNft) {
          const fee = await estimateUniquesFeeIfAny(
            api,
            authAddress,
            sendData.selectedNft.collection,
            sendData.selectedNft.id,
            sendData.recipient
          ).catch(() => '0')
          setEstimatedFee(fee || '0')
        } else {
          setEstimatedFee('0')
        }
      } catch (err) {
        console.error('Fee estimation failed:', err)
        setEstimatedFee('0')
      }
    }
    void run()
  }, [api, authAddress, nativeToken, currentStep, sendData])

  const handleAssetSelect = (type: AssetType, asset: TokenWithBalance | NftWithMetadata) => {
    if (type === 'token') {
      setSendData(prev => ({
        ...prev,
        assetType: 'token',
        selectedToken: asset as TokenWithBalance,
        selectedNft: undefined
      }))
    } else {
      setSendData(prev => ({
        ...prev,
        assetType: 'nft',
        selectedNft: asset as NftWithMetadata,
        selectedToken: undefined
      }))
    }
    setCurrentStep('recipient')
  }

  const handleRecipientNext = () => {
    if (!sendData.recipient.trim()) {
      toast.error(t('wallet.send.recipient_required') || 'Destinatário é obrigatório')
      return
    }
    if (sendData.recipient.length < 10) {
      toast.error(t('wallet.send.invalid_address') || 'Endereço inválido')
      return
    }
    setCurrentStep(sendData.assetType === 'token' ? 'amount' : 'review')
  }

  const handleAmountNext = () => {
    if (!sendData.amount || parseFloat(sendData.amount) <= 0) {
      toast.error(t('wallet.send.amount_required') || 'Valor é obrigatório')
      return
    }
    if (sendData.selectedToken) {
      const balance = parseFloat(sendData.selectedToken.formattedBalance)
      const amount = parseFloat(sendData.amount)
      if (amount > balance) {
        toast.error(t('wallet.send.insufficient_balance') || 'Saldo insuficiente')
        return
      }
    }
    setCurrentStep('review')
  }

  const handleSend = async () => {
    if (!authAddress) {
      toast.error('Conta não encontrada (auth)')
      return
    }
    setIsLoading(true)
    setCurrentStep('result')
    try {
      let hash = ''

      if (sendData.assetType === 'token' && sendData.selectedToken) {
        if (!api) throw new Error('API não disponível')

        if (!isNativeToken(sendData.selectedToken, nativeToken)) {
          throw new Error('Envio de token não nativo ainda não está configurado')
        }

        const planck = toPlanck(sendData.amount, sendData.selectedToken.decimals)

        hash = await signAndSend(
          (a) => (a.tx.balances?.transferKeepAlive
            ? a.tx.balances.transferKeepAlive(sendData.recipient, planck)
            : a.tx.balances.transfer(sendData.recipient, planck)
          ),
          {
            onStatus: () => { /* opcional */ },
            meta: {
              title: t('wallet.send.title') || 'Enviar',
              description: `${sendData.amount} ${sendData.selectedToken.symbol} → ${sendData.recipient}`
            }
          }
        )
      } else if (sendData.assetType === 'nft' && sendData.selectedNft) {
        throw new Error('Envio de NFT ainda não está configurado')
      } else {
        throw new Error('Dados de transferência inválidos')
      }

      setTransactionHash(hash)
      toast.success(t('wallet.send.success') || 'Transferência iniciada!')
    } catch (error: any) {
      toast.error(error?.message || 'Erro na transferência')
      setCurrentStep('review')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartNew = () => {
    setSendData({ assetType: 'token', recipient: '', amount: '', memo: '' })
    setCurrentStep('asset')
    setTransactionHash('')
    setEstimatedFee('')
  }

  const formatFee = (fee: string) => {
    if (!fee || !nativeToken) return '0'
    const feeNum = parseFloat(fee) / Math.pow(10, nativeToken.decimals)
    if (!Number.isFinite(feeNum)) return '0'
    return `${feeNum.toFixed(6)} ${nativeToken.symbol}`
  }

  // 🔒 Bloqueio real: apenas se o Auth disser que é watch-only
  if (isWatchOnlyAuth) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <EmptyState
          icon={<Send size={48} />}
          title={t('wallet.send.watch_only_title') || 'Conta Watch-Only'}
          description={t('wallet.send.watch_only_description') || 'Não é possível enviar transações com contas watch-only.'}
          action={
            <Button onClick={() => navigate('/wallet')} variant="primary">
              {t('wallet.back_to_wallet') || 'Voltar à Carteira'}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button onClick={() => navigate('/wallet')} variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              {t('common.back') || 'Voltar'}
            </Button>
            <h1 className="text-3xl font-bold text-matte-black-900">
              {t('wallet.send.title') || 'Enviar'}
            </h1>
          </div>

          {/* Steps */}
          <div className="flex items-center space-x-2">
            {[
              { key: 'asset', label: t('wallet.send.step_asset') || 'Ativo' },
              { key: 'recipient', label: t('wallet.send.step_recipient') || 'Destinatário' },
              ...(sendData.assetType === 'token' ? [{ key: 'amount', label: t('wallet.send.step_amount') || 'Valor' }] : []),
              { key: 'review', label: t('wallet.send.step_review') || 'Revisão' }
            ].map((step, index, array) => (
              <React.Fragment key={step.key}>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentStep === step.key
                    ? 'bg-bazari-red text-white'
                    : array.findIndex(s => s.key === currentStep) > index
                    ? 'bg-success text-white'
                    : 'bg-sand-200 text-matte-black-600'
                }`}>
                  {step.label}
                </div>
                {index < array.length - 1 && <ArrowRight size={16} className="text-matte-black-400" />}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Conteúdo */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <Card className="p-6">
              {currentStep === 'asset' && (
                <AssetSelectionStep tokens={tokens} nfts={nfts} onSelect={handleAssetSelect} />
              )}

              {currentStep === 'recipient' && (
                <RecipientStep
                  recipient={sendData.recipient}
                  setRecipient={(value) => setSendData(prev => ({ ...prev, recipient: value }))}
                  onNext={handleRecipientNext}
                  onBack={() => setCurrentStep('asset')}
                />
              )}

              {currentStep === 'amount' && sendData.selectedToken && (
                <AmountStep
                  token={sendData.selectedToken}
                  amount={sendData.amount}
                  setAmount={(value) => setSendData(prev => ({ ...prev, amount: value }))}
                  memo={sendData.memo}
                  setMemo={(value) => setSendData(prev => ({ ...prev, memo: value }))}
                  onNext={handleAmountNext}
                  onBack={() => setCurrentStep('recipient')}
                />
              )}

              {currentStep === 'review' && (
                <ReviewStep
                  sendData={sendData}
                  estimatedFee={formatFee(estimatedFee)}
                  fromAccount={fromAccount}
                  isLoading={isLoading}
                  onSend={handleSend}
                  onBack={() => setCurrentStep(sendData.assetType === 'token' ? 'amount' : 'recipient')}
                />
              )}

              {currentStep === 'result' && (
                <ResultStep
                  isLoading={isLoading}
                  transactionHash={transactionHash}
                  sendData={sendData}
                  onStartNew={handleStartNew}
                  onBackToWallet={() => navigate('/wallet')}
                />
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------- Steps ----------

interface AssetSelectionStepProps {
  tokens: TokenWithBalance[]
  nfts: NftWithMetadata[]
  onSelect: (type: AssetType, asset: TokenWithBalance | NftWithMetadata) => void
}

const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({ tokens, nfts, onSelect }) => {
  const { t } = useI18n()
  const [assetType, setAssetType] = React.useState<AssetType>('token')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {t('wallet.send.select_asset') || 'Selecionar Ativo'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.send.select_asset_description') || 'Escolha o token ou NFT que deseja enviar.'}
        </p>
      </div>

      <Tabs defaultValue="tokens">
        <Tabs.List>
          <Tabs.Trigger value="tokens" onClick={() => setAssetType('token')}>
            <Coins size={16} className="mr-2" />
            {t('wallet.tabs.tokens') || 'Tokens'}
          </Tabs.Trigger>
          <Tabs.Trigger value="nfts" onClick={() => setAssetType('nft')}>
            <ImageIcon size={16} className="mr-2" />
            {t('wallet.tabs.nfts') || 'NFTs'}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="tokens">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tokens.filter(token => parseFloat(token.formattedBalance) > 0).map(token => (
              <button
                key={token.key}
                onClick={() => onSelect('token', token)}
                className="w-full p-4 bg-sand-50 hover:bg-sand-100 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {token.symbol.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-medium text-matte-black-900">
                        {token.name || token.symbol}
                      </h3>
                      <p className="text-sm text-matte-black-600">
                        {parseFloat(token.formattedBalance).toFixed(6)} {token.symbol}
                      </p>
                    </div>
                  </div>

                  <ArrowRight size={20} className="text-matte-black-400" />
                </div>
              </button>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="nfts">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {nfts.map(nft => (
              <button
                key={`${nft.collection}_${nft.id}`}
                onClick={() => onSelect('nft', nft)}
                className="p-3 bg-sand-50 hover:bg-sand-100 rounded-xl transition-colors text-left"
              >
                <div className="aspect-square bg-sand-200 rounded-lg mb-2 overflow-hidden">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT #${nft.id}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={24} className="text-matte-black-400" />
                    </div>
                  )}
                </div>

                <h3 className="font-medium text-matte-black-900 text-sm truncate">
                  {nft.name || `NFT #${nft.id}`}
                </h3>
                <p className="text-xs text-matte-black-600">
                  {nft.collection}
                </p>
              </button>
            ))}
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
  )
}

interface RecipientStepProps {
  recipient: string
  setRecipient: (value: string) => void
  onNext: () => void
  onBack: () => void
}

const RecipientStep: React.FC<RecipientStepProps> = ({ recipient, setRecipient, onNext, onBack }) => {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {t('wallet.send.recipient') || 'Destinatário'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.send.recipient_description') || 'Digite o endereço do destinatário.'}
        </p>
      </div>

      <Input
        label={t('wallet.send.wallet_address') || 'Endereço da Carteira'}
        placeholder="5GrwvaEF..."
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        rightIcon={
          <Button variant="ghost" size="sm">
            <QrCode size={16} />
          </Button>
        }
      />

      <div className="flex space-x-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft size={16} className="mr-2" />
          {t('common.back') || 'Voltar'}
        </Button>

        <Button onClick={onNext} variant="primary" className="flex-1" disabled={!recipient.trim()}>
          {t('common.next') || 'Próximo'}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

interface AmountStepProps {
  token: TokenWithBalance
  amount: string
  setAmount: (value: string) => void
  memo?: string
  setMemo: (value: string) => void
  onNext: () => void
  onBack: () => void
}

const AmountStep: React.FC<AmountStepProps> = ({
  token,
  amount,
  setAmount,
  memo,
  setMemo,
  onNext,
  onBack
}) => {
  const { t } = useI18n()

  const balance = parseFloat(token.formattedBalance)
  const maxAmount = balance * 0.95 // margem para taxa

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {t('wallet.send.amount') || 'Valor'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.send.amount_description') || 'Digite o valor que deseja enviar.'}
        </p>
      </div>

      <div className="p-4 bg-sand-50 rounded-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {token.symbol.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-matte-black-900">
              {token.name || token.symbol}
            </h3>
            <p className="text-sm text-matte-black-600">
              {t('wallet.available') || 'Disponível'}: {balance.toFixed(6)} {token.symbol}
            </p>
          </div>
        </div>
      </div>

      <div>
        <Input
          label={t('wallet.send.amount') || 'Valor'}
          type="number"
          step="0.000001"
          placeholder="0.000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          rightIcon={<span className="text-sm text-matte-black-600">{token.symbol}</span>}
        />

        <div className="flex justify-between items-center mt-2">
          <Button onClick={() => setAmount(maxAmount.toString())} variant="ghost" size="sm">
            {t('wallet.send.max') || 'Máximo'}
          </Button>

          <span className="text-sm text-matte-black-600">
            ≈ {(parseFloat(amount || '0') * (token.priceUSD || 0)).toFixed(2)} USD
          </span>
        </div>
      </div>

      <Input
        label={t('wallet.send.memo') || 'Memo (Opcional)'}
        placeholder={t('wallet.send.memo_placeholder') || 'Adicione uma nota...'}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      <div className="flex space-x-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft size={16} className="mr-2" />
          {t('common.back') || 'Voltar'}
        </Button>

        <Button onClick={onNext} variant="primary" className="flex-1" disabled={!amount || parseFloat(amount) <= 0}>
          {t('common.next') || 'Próximo'}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

interface ReviewStepProps {
  sendData: SendData
  estimatedFee: string
  fromAccount: { address?: string; name?: string }
  isLoading: boolean
  onSend: () => void
  onBack: () => void
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  sendData,
  estimatedFee,
  fromAccount,
  isLoading,
  onSend,
  onBack
}) => {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
          {t('wallet.send.review') || 'Revisar Transação'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.send.review_description') || 'Confirme os detalhes antes de enviar.'}
        </p>
      </div>

      <div className="space-y-4">
        {/* From — AGORA 100% AUTH */}
        <div className="flex justify-between items-center py-3 border-b border-sand-200">
          <span className="text-matte-black-600">{t('wallet.send.from') || 'De'}:</span>
          <div className="text-right">
            <p className="font-medium text-matte-black-900">{fromAccount?.name}</p>
            <p className="text-sm text-matte-black-600 font-mono">
              {formatAddress(fromAccount?.address || '')}
            </p>
          </div>
        </div>

        {/* To */}
        <div className="flex justify-between items-center py-3 border-b border-sand-200">
          <span className="text-matte-black-600">{t('wallet.send.to') || 'Para'}:</span>
          <p className="font-mono text-matte-black-900">
            {formatAddress(sendData.recipient)}
          </p>
        </div>

        {/* Asset */}
        <div className="flex justify-between items-center py-3 border-b border-sand-200">
          <span className="text-matte-black-600">{t('wallet.send.asset') || 'Ativo'}:</span>
          <div className="text-right">
            {sendData.assetType === 'token' && sendData.selectedToken ? (
              <>
                <p className="font-medium text-matte-black-900">
                  {sendData.amount} {sendData.selectedToken.symbol}
                </p>
                <p className="text-sm text-matte-black-600">
                  {sendData.selectedToken.name}
                </p>
              </>
            ) : sendData.selectedNft ? (
              <>
                <p className="font-medium text-matte-black-900">
                  {sendData.selectedNft.name || `NFT #${sendData.selectedNft.id}`}
                </p>
                <p className="text-sm text-matte-black-600">
                  {sendData.selectedNft.collection}
                </p>
              </>
            ) : null}
          </div>
        </div>

        {/* Fee */}
        <div className="flex justify-between items-center py-3 border-b border-sand-200">
          <span className="text-matte-black-600">{t('wallet.send.estimated_fee') || 'Taxa Estimada'}:</span>
          <p className="font-medium text-matte-black-900">{estimatedFee || '—'}</p>
        </div>

        {/* Memo */}
        {sendData.memo && (
          <div className="flex justify-between items-start py-3 border-b border-sand-200">
            <span className="text-matte-black-600">{t('wallet.send.memo') || 'Memo'}:</span>
            <p className="text-sm font-medium text-matte-black-900 text-right max-w-48 break-words">
              {sendData.memo}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-bazari-red-50 border border-bazari-red-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle size={20} className="text-bazari-red mt-0.5" />
          <div>
            <p className="text-sm font-medium text-bazari-red-800 mb-1">
              {t('wallet.send.warning_title') || 'Atenção!'}
            </p>
            <p className="text-sm text-bazari-red-700">
              {t('wallet.send.warning') || 'Transações na blockchain são irreversíveis. Verifique todos os dados antes de confirmar.'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button onClick={onBack} variant="outline" className="flex-1" disabled={isLoading}>
          <ArrowLeft size={16} className="mr-2" />
          {t('common.back') || 'Voltar'}
        </Button>

        <Button onClick={onSend} variant="primary" className="flex-1" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : <Send size={16} className="mr-2" />}
          {t('wallet.send.confirm_send') || 'Confirmar & Enviar'}
        </Button>
      </div>
    </div>
  )
}

interface ResultStepProps {
  isLoading: boolean
  transactionHash: string
  sendData: SendData
  onStartNew: () => void
  onBackToWallet: () => void
}

const ResultStep: React.FC<ResultStepProps> = ({
  isLoading,
  transactionHash,
  sendData,
  onStartNew,
  onBackToWallet
}) => {
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-semibold text-matte-black-900 mt-4 mb-2">
          {t('wallet.send.processing') || 'Processando Transação'}
        </h2>
        <p className="text-matte-black-600">
          {t('wallet.send.processing_description') || 'Sua transação está sendo processada...'}
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      {transactionHash ? (
        <>
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-success" />
          </div>

          <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
            {t('wallet.send.success_title') || 'Transação Enviada!'}
          </h2>

          <p className="text-matte-black-600 mb-6">
            {sendData.assetType === 'token'
              ? (t('wallet.send.token_success') || 'Seus tokens foram enviados com sucesso.')
              : (t('wallet.send.nft_success') || 'Seu NFT foi enviado com sucesso.')}
          </p>

          <div className="p-4 bg-sand-50 rounded-lg mb-6">
            <p className="text-sm text-matte-black-600 mb-2">
              {t('wallet.send.transaction_hash') || 'Hash da Transação'}:
            </p>
            <p className="font-mono text-sm text-matte-black-900 break-all">
              {transactionHash}
            </p>
          </div>

          <div className="flex space-x-3">
            <Button onClick={onStartNew} variant="outline" className="flex-1">
              {t('wallet.send.send_another') || 'Enviar Outro'}
            </Button>
            <Button onClick={onBackToWallet} variant="primary" className="flex-1">
              {t('wallet.back_to_wallet') || 'Voltar à Carteira'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-danger" />
          </div>

          <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
            {t('wallet.send.error_title') || 'Erro na Transação'}
          </h2>

          <p className="text-matte-black-600 mb-6">
            {t('wallet.send.error_description') || 'Houve um erro ao processar sua transação. Tente novamente.'}
          </p>

          <div className="flex space-x-3">
            <Button onClick={onBackToWallet} variant="outline" className="flex-1">
              {t('wallet.back_to_wallet') || 'Voltar à Carteira'}
            </Button>
            <Button onClick={onStartNew} variant="primary" className="flex-1">
              {t('common.try_again') || 'Tentar Novamente'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
