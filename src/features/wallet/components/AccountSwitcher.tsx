
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Copy, Settings, Eye, EyeOff } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Avatar } from '@shared/ui/Avatar'
import { useI18n } from '@app/providers/I18nProvider'
import { useActiveAccount } from '../hooks/useActiveAccount'
import { toast } from '@features/notifications/components/NotificationToastHost'

export const AccountSwitcher: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { 
    activeAccount, 
    accounts, 
    switchAccount, 
    formatAddress, 
    isWatchOnly 
  } = useActiveAccount()
  
  const [isOpen, setIsOpen] = React.useState(false)
  const [showFullAddress, setShowFullAddress] = React.useState(false)

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeAccount) return
    
    try {
      await navigator.clipboard.writeText(activeAccount.address)
      toast.success(t('wallet.address_copied') || 'Endereço copiado!')
    } catch (error) {
      toast.error(t('wallet.copy_failed') || 'Erro ao copiar')
    }
  }

  const handleSwitchAccount = (accountId: string) => {
    switchAccount(accountId)
    setIsOpen(false)
    toast.success(t('wallet.account_switched') || 'Conta alterada!')
  }

  const displayAddress = showFullAddress 
    ? activeAccount?.address 
    : formatAddress(activeAccount?.address || '', 6)

  if (!activeAccount) return null

  return (
    <div className="relative">
      <Card 
        className="p-4 cursor-pointer hover:shadow-soft-lg transition-shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar 
              fallback={activeAccount.name.charAt(0)}
              size="sm"
            />
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-matte-black-900">
                  {activeAccount.name}
                </h3>
                
                {isWatchOnly(activeAccount) && (
                  <Badge variant="outline" size="sm">
                    <Eye size={12} className="mr-1" />
                    {t('wallet.watch_only') || 'Watch'}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span 
                  className="text-sm text-matte-black-600 font-mono cursor-pointer hover:text-matte-black-900"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowFullAddress(!showFullAddress)
                  }}
                >
                  {displayAddress}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={handleCopyAddress}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate('/wallet/accounts')
              }}
            >
              <Settings size={16} />
            </Button>
            
            <ChevronDown 
              size={20} 
              className={`text-matte-black-600 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </Card>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="p-2 max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {accounts.map((account) => (
                  <motion.div
                    key={account.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleSwitchAccount(account.id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        account.id === activeAccount.id
                          ? 'bg-bazari-red-50 border border-bazari-red-200'
                          : 'hover:bg-sand-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar 
                          fallback={account.name.charAt(0)}
                          size="sm"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-matte-black-900 truncate">
                              {account.name}
                            </p>
                            
                            {isWatchOnly(account) && (
                              <Badge variant="outline" size="sm">
                                <Eye size={10} className="mr-1" />
                                Watch
                              </Badge>
                            )}
                            
                            {account.id === activeAccount.id && (
                              <Badge variant="success" size="sm">
                                {t('wallet.active') || 'Ativa'}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-matte-black-600 font-mono truncate">
                            {formatAddress(account.address, 8)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
              
              {/* Add Account Button */}
              <div className="mt-3 pt-3 border-t border-sand-200">
                <Button
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/wallet/accounts')
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {t('wallet.manage_accounts') || 'Gerenciar Contas'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}