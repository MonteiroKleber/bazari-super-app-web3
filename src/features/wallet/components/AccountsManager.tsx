import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  Upload, 
  Key, 
  AlertTriangle,
  Copy
} from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Modal } from '@shared/ui/Modal'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { toast } from '@features/notifications/components/NotificationToastHost'

// Wallet stores/hooks
import { useAccountsStore } from '../store/accountsStore'
import { useActiveAccount } from '../hooks/useActiveAccount'

// AUTH store – fonte única da verdade das contas
import { useAuthStore } from '@features/auth/store/authStore'

type ModalType =
  | 'create'
  | 'import-seed'
  | 'import-json'
  | 'watch'
  | 'rename'
  | 'export'
  | 'remove'
  | null

export const AccountsManager: React.FC = () => {
  const { t } = useI18n()

  // ====== Wallet actions (fallback caso Auth não tenha alguma ação) ======
  const {
    addFromMnemonic: wallet_addFromMnemonic,
    importJson: wallet_importJson,
    addWatchOnly: wallet_addWatchOnly,
    remove: wallet_remove,
    rename: wallet_rename,
    exportJson: wallet_exportJson,
    generateMnemonic,
  } = useAccountsStore()

  // ====== Wallet active/switch helpers (já padronizado no hook) ======
  const { activeAccount, switchAccount, formatAddress, isWatchOnly } = useActiveAccount()

  // ====== AUTH: MESMA origem de contas da tela ExistingAccountLogin ======
  // Usamos "as any" para tolerar variações de nomes no store do Auth sem quebrar TS.
  const auth_listLocal = useAuthStore((s) => (s as any).listLocal as (() => void) | undefined)
  const auth_localAccounts = useAuthStore((s) => (s as any).localAccounts as Array<any> | undefined)

  // Ações do Auth (tente usar estas primeiro, senão cai no fallback da Wallet)
  const auth_createFromMnemonic = useAuthStore((s) =>
    ((s as any).createFromMnemonic ||
      (s as any).addFromMnemonic ||
      (s as any).createLocal) as ((mnemonic: string, name?: string) => Promise<void>) | undefined
  )
  const auth_importJson = useAuthStore((s) =>
    ((s as any).importJson ||
      (s as any).importFromJson) as ((json: any, password: string) => Promise<void>) | undefined
  )
  const auth_addWatchOnly = useAuthStore((s) =>
    ((s as any).addWatchOnly ||
      (s as any).addWatchOnlyLocal) as ((address: string, name?: string) => Promise<void> | void) | undefined
  )
  const auth_rename = useAuthStore((s) =>
    ((s as any).renameLocal ||
      (s as any).rename) as ((addressOrId: string, newName: string) => Promise<void> | void) | undefined
  )
  const auth_remove = useAuthStore((s) =>
    ((s as any).removeLocal ||
      (s as any).remove) as ((addressOrId: string) => Promise<void> | void) | undefined
  )
  const auth_exportJson = useAuthStore((s) =>
    ((s as any).exportJson ||
      (s as any).exportLocalJson) as ((addressOrId: string, password: string) => Promise<any>) | undefined
  )
  const auth_loginLocal = useAuthStore((s) =>
    (s as any).loginLocal as ((address: string) => Promise<void> | void) | undefined
  )

  // Carrega a lista de contas locais do Auth ao montar
  React.useEffect(() => {
    try { auth_listLocal?.() } catch {}
  }, [auth_listLocal])

  // Normaliza lista do Auth -> modelo usado na Wallet UI
  const viewAccounts = React.useMemo(() => {
    return (auth_localAccounts ?? []).map((a) => ({
      id: a.address,           // id = address (estável)
      address: a.address,
      name: a.name || 'Conta',
      type: 'local' as const,
    }))
  }, [auth_localAccounts])

  // ====== Estado de UI ======
  const [modalType, setModalType] = React.useState<ModalType>(null)
  const [selectedAccountId, setSelectedAccountId] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  // Form states
  const [seedPhrase, setSeedPhrase] = React.useState<string[]>([])
  const [mnemonicInput, setMnemonicInput] = React.useState('')
  const [accountName, setAccountName] = React.useState('')
  const [watchAddress, setWatchAddress] = React.useState('')
  const [jsonFile, setJsonFile] = React.useState<File | null>(null)
  const [jsonPassword, setJsonPassword] = React.useState('')
  const [exportPassword, setExportPassword] = React.useState('')

  const refreshAuthList = React.useCallback(() => {
    try { auth_listLocal?.() } catch {}
  }, [auth_listLocal])

  // ====== Handlers (seguem o fluxo do Auth, com fallback na Wallet) ======
  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      toast.error(t('wallet.name_required') || 'Nome é obrigatório')
      return
    }
    const mnemonic = seedPhrase.join(' ')
    setIsLoading(true)
    try {
      if (auth_createFromMnemonic) {
        await auth_createFromMnemonic(mnemonic, accountName)
      } else {
        await wallet_addFromMnemonic(mnemonic, accountName)
      }
      toast.success(t('wallet.account_created') || 'Conta criada com sucesso!')
      refreshAuthList()
      closeModal()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportSeed = async () => {
    const seed = mnemonicInput.trim()
    if (!seed) {
      toast.error(t('wallet.seed_required') || 'Frase de recuperação é obrigatória')
      return
    }
    const words = seed.split(/\s+/)
    if (words.length !== 12 && words.length !== 24) {
      toast.error(t('wallet.invalid_seed_length') || 'A frase deve ter 12 ou 24 palavras')
      return
    }
    setIsLoading(true)
    try {
      if (auth_createFromMnemonic) {
        await auth_createFromMnemonic(seed, accountName || 'Conta Importada')
      } else {
        await wallet_addFromMnemonic(seed, accountName || 'Conta Importada')
      }
      toast.success(t('wallet.account_imported') || 'Conta importada com sucesso!')
      refreshAuthList()
      closeModal()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao importar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportJson = async () => {
    if (!jsonFile || !jsonPassword) {
      toast.error(t('wallet.file_and_password_required') || 'Arquivo e senha são obrigatórios')
      return
    }
    setIsLoading(true)
    try {
      const fileContent = await jsonFile.text()
      const jsonData = JSON.parse(fileContent)
      if (auth_importJson) {
        await auth_importJson(jsonData, jsonPassword)
      } else {
        await wallet_importJson(jsonData, jsonPassword)
      }
      toast.success(t('wallet.account_imported') || 'Conta importada com sucesso!')
      refreshAuthList()
      closeModal()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao importar JSON')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddWatchOnly = async () => {
    if (!watchAddress.trim()) {
      toast.error(t('wallet.address_required') || 'Endereço é obrigatório')
      return
    }
    try {
      if (auth_addWatchOnly) {
        await auth_addWatchOnly(watchAddress, accountName || 'Conta Watch-Only')
      } else {
        await wallet_addWatchOnly(watchAddress, accountName || 'Conta Watch-Only')
      }
      toast.success(t('wallet.watch_account_added') || 'Conta watch-only adicionada!')
      refreshAuthList()
      closeModal()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao adicionar conta watch-only')
    }
  }

  const handleRename = async () => {
    if (!accountName.trim()) {
      toast.error(t('wallet.name_required') || 'Nome é obrigatório')
      return
    }
    try {
      if (auth_rename) {
        await auth_rename(selectedAccountId, accountName)
      } else {
        await wallet_rename(selectedAccountId, accountName)
      }
      toast.success(t('wallet.account_renamed') || 'Conta renomeada!')
      refreshAuthList()
      closeModal()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao renomear conta')
    }
  }

  const handleExport = async () => {
    if (!exportPassword.trim()) {
      toast.error(t('wallet.password_required') || 'Senha é obrigatória')
      return
    }
    setIsLoading(true)
    try {
      const exportData = auth_exportJson
        ? await auth_exportJson(selectedAccountId, exportPassword)
        : await wallet_exportJson(selectedAccountId, exportPassword)

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `account-${selectedAccountId}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success(t('wallet.account_exported') || 'Conta exportada!')
      closeModal()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao exportar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    try {
      if (auth_remove) {
        await auth_remove(selectedAccountId)
      } else {
        await wallet_remove(selectedAccountId)
      }
      toast.success(t('wallet.account_removed') || 'Conta removida!')
      refreshAuthList()
      closeModal()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao remover conta')
    }
  }

  const openModal = (type: ModalType, accountId?: string) => {
    setModalType(type)
    setSelectedAccountId(accountId || '')

    // reset forms
    setSeedPhrase([])
    setMnemonicInput('')
    setAccountName('')
    setWatchAddress('')
    setJsonFile(null)
    setJsonPassword('')
    setExportPassword('')

    // Pré‑preenche seed e nome quando for criar/renomear
    if (type === 'create') {
      setSeedPhrase(generateMnemonic())
    } else if (type === 'rename' && accountId) {
      const acc = viewAccounts.find((a) => a.id === accountId)
      setAccountName(acc?.name || '')
    }
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedAccountId('')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-matte-black-900 mb-2">
            {t('wallet.accounts.title') || 'Gerenciar Contas'}
          </h1>
          <p className="text-matte-black-600">
            {t('wallet.accounts.description') || 'Crie, importe e gerencie suas contas da carteira.'}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
              {t('wallet.accounts.quick_actions') || 'Ações Rápidas'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={() => openModal('create')} variant="primary" className="flex flex-col items-center p-4 h-auto">
                <Plus size={24} className="mb-2" />
                <span>{t('wallet.accounts.new') || 'Nova Conta'}</span>
              </Button>

              <Button onClick={() => openModal('import-seed')} variant="outline" className="flex flex-col items-center p-4 h-auto">
                <Key size={24} className="mb-2" />
                <span>{t('wallet.accounts.import_seed') || 'Importar Seed'}</span>
              </Button>

              <Button onClick={() => openModal('import-json')} variant="outline" className="flex flex-col items-center p-4 h-auto">
                <Upload size={24} className="mb-2" />
                <span>{t('wallet.accounts.import_json') || 'Importar JSON'}</span>
              </Button>

              <Button onClick={() => openModal('watch')} variant="outline" className="flex flex-col items-center p-4 h-auto">
                <Eye size={24} className="mb-2" />
                <span>{t('wallet.accounts.watch_only') || 'Watch-Only'}</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-matte-black-900 mb-4">
              {t('wallet.accounts.my_accounts') || 'Minhas Contas'} ({viewAccounts.length})
            </h2>

            <div className="space-y-4">
              {viewAccounts.map((account, index) => {
                const active = activeAccount?.address === account.address
                const watch = typeof isWatchOnly === 'function' ? isWatchOnly(account as any) : !!(isWatchOnly as any)

                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-all ${
                      active ? 'border-bazari-red bg-bazari-red-50' : 'border-sand-200 bg-white hover:shadow-soft'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar fallback={(account.name || 'C').charAt(0)} size="md" />

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-matte-black-900">{account.name || 'Conta'}</h3>

                            {watch && (
                              <Badge variant="outline" size="sm">
                                <Eye size={12} className="mr-1" />
                                {t('wallet.watch_only') || 'Watch'}
                              </Badge>
                            )}

                            {active && <Badge variant="success" size="sm">{t('wallet.active') || 'Ativa'}</Badge>}
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-matte-black-600 font-mono">
                              {formatAddress(account.address, 8)}
                            </span>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(account.address)
                                  toast.success(t('wallet.address_copied') || 'Endereço copiado!')
                                } catch {
                                  toast.error(t('wallet.copy_failed') || 'Erro ao copiar')
                                }
                              }}
                            >
                              <Copy size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!active && (
                          <Button
                            onClick={async () => {
                              try {
                                // Ativação segue o fluxo do Auth
                                if (auth_loginLocal) await auth_loginLocal(account.address)
                              } catch {}
                              // e sincroniza com o store da Wallet
                              switchAccount(account.address)
                              refreshAuthList()
                            }}
                            variant="outline"
                            size="sm"
                          >
                            {t('wallet.switch') || 'Ativar'}
                          </Button>
                        )}

                        <Button onClick={() => openModal('rename', account.id)} variant="ghost" size="sm">
                          <Edit2 size={16} />
                        </Button>

                        {!watch && (
                          <Button onClick={() => openModal('export', account.id)} variant="ghost" size="sm">
                            <Download size={16} />
                          </Button>
                        )}

                        {viewAccounts.length > 1 && (
                          <Button
                            onClick={() => openModal('remove', account.id)}
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <AccountModal
            type={modalType}
            isLoading={isLoading}
            onClose={closeModal}
            // forms
            seedPhrase={seedPhrase}
            mnemonicInput={mnemonicInput}
            setMnemonicInput={setMnemonicInput}
            accountName={accountName}
            setAccountName={setAccountName}
            watchAddress={watchAddress}
            setWatchAddress={setWatchAddress}
            jsonFile={jsonFile}
            setJsonFile={setJsonFile}
            jsonPassword={jsonPassword}
            setJsonPassword={setJsonPassword}
            exportPassword={exportPassword}
            setExportPassword={setExportPassword}
            // actions
            onCreateAccount={handleCreateAccount}
            onImportSeed={handleImportSeed}
            onImportJson={handleImportJson}
            onAddWatchOnly={handleAddWatchOnly}
            onRename={handleRename}
            onExport={handleExport}
            onRemove={handleRemove}
            selectedAccountName={viewAccounts.find((a) => a.id === selectedAccountId)?.name || ''}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface AccountModalProps {
  type: ModalType
  isLoading: boolean
  onClose: () => void
  // form
  seedPhrase: string[]
  mnemonicInput: string
  setMnemonicInput: (value: string) => void
  accountName: string
  setAccountName: (value: string) => void
  watchAddress: string
  setWatchAddress: (value: string) => void
  jsonFile: File | null
  setJsonFile: (file: File | null) => void
  jsonPassword: string
  setJsonPassword: (value: string) => void
  exportPassword: string
  setExportPassword: (value: string) => void
  // actions
  onCreateAccount: () => void
  onImportSeed: () => void
  onImportJson: () => void
  onAddWatchOnly: () => void
  onRename: () => void
  onExport: () => void
  onRemove: () => void
  selectedAccountName: string
}

const AccountModal: React.FC<AccountModalProps> = (props) => {
  const { t } = useI18n()
  const [showSeed, setShowSeed] = React.useState(false)

  const config = React.useMemo(() => {
    switch (props.type) {
      case 'create': return { title: t('wallet.accounts.create_title') || 'Criar Nova Conta', size: 'lg' as const }
      case 'import-seed': return { title: t('wallet.accounts.import_seed_title') || 'Importar com Seed', size: 'md' as const }
      case 'import-json': return { title: t('wallet.accounts.import_json_title') || 'Importar JSON', size: 'md' as const }
      case 'watch': return { title: t('wallet.accounts.watch_title') || 'Adicionar Watch-Only', size: 'md' as const }
      case 'rename': return { title: t('wallet.accounts.rename_title') || 'Renomear Conta', size: 'sm' as const }
      case 'export': return { title: t('wallet.accounts.export_title') || 'Exportar Conta', size: 'sm' as const }
      case 'remove': return { title: t('wallet.accounts.remove_title') || 'Remover Conta', size: 'sm' as const }
      default: return { title: '', size: 'md' as const }
    }
  }, [props.type, t])

  return (
    <Modal isOpen={true} onClose={props.onClose} size={config.size}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-matte-black-900 mb-6">{config.title}</h2>

        {/* Create */}
        {props.type === 'create' && (
          <div className="space-y-6">
            <div className="p-4 bg-bazari-red-50 border border-bazari-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={20} className="text-bazari-red mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-bazari-red-800 mb-1">{t('wallet.seed_warning_title') || 'Importante!'}</p>
                  <p className="text-sm text-bazari-red-700">
                    {t('wallet.seed_warning') || 'Anote sua frase de recuperação em local seguro. É a única forma de recuperar sua conta.'}
                  </p>
                </div>
              </div>
            </div>

            <Input
              label={t('wallet.account_name') || 'Nome da Conta'}
              placeholder={t('wallet.account_name_placeholder') || 'Minha Conta'}
              value={props.accountName}
              onChange={(e) => props.setAccountName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-matte-black-700 mb-2">
                {t('wallet.seed_phrase') || 'Frase de Recuperação'}
              </label>

              <div className="bg-sand-50 rounded-lg p-4 mb-4">
                {showSeed ? (
                  <div className="grid grid-cols-3 gap-2">
                    {props.seedPhrase.map((word, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="text-xs text-matte-black-500 w-6">{i + 1}.</span>
                        <span className="font-mono text-sm">{word}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Button onClick={() => setShowSeed(true)} variant="outline" size="sm">
                      <Eye size={16} className="mr-2" />
                      {t('wallet.reveal_seed') || 'Clique para revelar'}
                    </Button>
                  </div>
                )}
              </div>

              {showSeed && (
                <Button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(props.seedPhrase.join(' '))
                      toast.success(t('wallet.seed_copied') || 'Frase copiada!')
                    } catch {
                      toast.error(t('wallet.copy_failed') || 'Erro ao copiar')
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Copy size={16} className="mr-2" />
                  {t('wallet.copy_seed') || 'Copiar Frase'}
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={props.onCreateAccount}
                variant="primary"
                className="flex-1"
                disabled={props.isLoading || !props.accountName.trim() || !showSeed}
              >
                {props.isLoading ? <LoadingSpinner size="sm" /> : null}
                {t('wallet.create_account') || 'Criar Conta'}
              </Button>
              <Button onClick={props.onClose} variant="outline" className="flex-1">
                {t('common.cancel') || 'Cancelar'}
              </Button>
            </div>
          </div>
        )}

        {/* Import Seed */}
        {props.type === 'import-seed' && (
          <div className="space-y-6">
            <Input
              label={t('wallet.account_name') || 'Nome da Conta'}
              placeholder={t('wallet.account_name_placeholder') || 'Conta Importada'}
              value={props.accountName}
              onChange={(e) => props.setAccountName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-matte-black-700 mb-2">
                {t('wallet.seed_phrase') || 'Frase de Recuperação'}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent resize-none"
                rows={4}
                placeholder={t('wallet.seed_placeholder') || 'Digite suas 12 ou 24 palavras...'}
                value={props.mnemonicInput}
                onChange={(e) => props.setMnemonicInput(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={props.onImportSeed}
                variant="primary"
                className="flex-1"
                disabled={props.isLoading || !props.mnemonicInput.trim()}
              >
                {props.isLoading ? <LoadingSpinner size="sm" /> : null}
                {t('wallet.import_account') || 'Importar Conta'}
              </Button>
              <Button onClick={props.onClose} variant="outline" className="flex-1">
                {t('common.cancel') || 'Cancelar'}
              </Button>
            </div>
          </div>
        )}

        {/* Import JSON */}
        {props.type === 'import-json' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-matte-black-700 mb-2">
                {t('wallet.select_file') || 'Selecionar Arquivo'}
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => props.setJsonFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-bazari-red focus:border-transparent"
              />
            </div>

            <Input
              label={t('wallet.file_password') || 'Senha do Arquivo'}
              type="password"
              placeholder="••••••••"
              value={props.jsonPassword}
              onChange={(e) => props.setJsonPassword(e.target.value)}
            />

            <div className="flex space-x-3">
              <Button
                onClick={props.onImportJson}
                variant="primary"
                className="flex-1"
                disabled={props.isLoading || !props.jsonFile || !props.jsonPassword}
              >
                {props.isLoading ? <LoadingSpinner size="sm" /> : null}
                {t('wallet.import_account') || 'Importar Conta'}
              </Button>
              <Button onClick={props.onClose} variant="outline" className="flex-1">
                {t('common.cancel') || 'Cancelar'}
              </Button>
            </div>
          </div>
        )}

        {/* Watch Only */}
        {props.type === 'watch' && (
          <div className="space-y-6">
            <Input
              label={t('wallet.account_name') || 'Nome da Conta'}
              placeholder={t('wallet.watch_name_placeholder') || 'Conta Watch-Only'}
              value={props.accountName}
              onChange={(e) => props.setAccountName(e.target.value)}
            />

            <Input
              label={t('wallet.wallet_address') || 'Endereço da Carteira'}
              placeholder="5GrwvaEF..."
              value={props.watchAddress}
              onChange={(e) => props.setWatchAddress(e.target.value)}
            />

            <div className="flex space-x-3">
              <Button
                onClick={props.onAddWatchOnly}
                variant="primary"
                className="flex-1"
                disabled={!props.watchAddress.trim()}
              >
                {t('wallet.add_account') || 'Adicionar Conta'}
              </Button>
              <Button onClick={props.onClose} variant="outline" className="flex-1">
                {t('common.cancel') || 'Cancelar'}
              </Button>
            </div>
          </div>
        )}

        {/* Rename */}
        {props.type === 'rename' && (
          <div className="space-y-6">
            <Input
              label={t('wallet.new_name') || 'Novo Nome'}
              placeholder={t('wallet.account_name_placeholder') || 'Nome da Conta'}
              value={props.accountName}
              onChange={(e) => props.setAccountName(e.target.value)}
            />

            <div className="flex space-x-3">
              <Button
                onClick={props.onRename}
                variant="primary"
                className="flex-1"
                disabled={!props.accountName.trim()}
              >
                {t('wallet.rename') || 'Renomear'}
              </Button>
              <Button onClick={props.onClose} variant="outline" className="flex-1">
                {t('common.cancel') || 'Cancelar'}
              </Button>
            </div>
          </div>
        )}

        {/* Export */}
        {props.type === 'export' && (
          <div className="space-y-6">
            <div className="p-4 bg-sand-50 rounded-lg">
              <p className="text-sm text-matte-black-700">
                {t('wallet.export_description') || 'Será gerado um arquivo JSON criptografado com sua chave privada.'}
              </p>
            </div>

            <Input
              label={t('wallet.export_password') || 'Senha para Criptografia'}
              type="password"
              placeholder="••••••••"
              value={props.exportPassword}
              onChange={(e) => props.setExportPassword(e.target.value)}
            />

            <div className="flex space-x-3">
              <Button
                onClick={props.onExport}
                variant="primary"
                className="flex-1"
                disabled={props.isLoading || !props.exportPassword}
              >
                {props.isLoading ? <LoadingSpinner size="sm" /> : null}
                {t('wallet.export') || 'Exportar'}
              </Button>
              <Button onClick={props.onClose} variant="outline" className="flex-1">
                {t('common.cancel') || 'Cancelar'}
              </Button>
            </div>
          </div>
        )}

        {/* Remove */}
        {props.type === 'remove' && (
          <div className="space-y-6">
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={20} className="text-danger mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger-800 mb-1">
                    {t('wallet.remove_warning_title') || 'Atenção!'}
                  </p>
                  <p className="text-sm text-danger-700">
                    {t('wallet.remove_warning') || 'Esta ação não pode ser desfeita. Certifique-se de ter backup da sua frase de recuperação.'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-matte-black-700">
              {t('wallet.remove_confirmation') || 'Tem certeza que deseja remover a conta'}{' '}
              <strong>"{props.selectedAccountName}"</strong>?
            </p>

            <div className="flex space-x-3">
              <Button onClick={props.onRemove} variant="primary" className="flex-1 bg-danger hover:bg-danger-600">
                {t('wallet.remove') || 'Remover'}
              </Button>
              <Button onClick={props.onClose} variant="outline" className="flex-1">
                {t('common.cancel') || 'Cancelar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
