// src/features/wallet/store/accountsStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Account, CreateAccountParams, ImportJsonParams, ExportJsonParams } from '../types/wallet.types'
// Importações condicionais - usar apenas se disponível
// import { mnemonicGenerate, validateMnemonic, mnemonicToSeed } from '@polkadot/util-crypto'
// import { u8aToHex } from '@polkadot/util'
// import { Keyring } from '@polkadot/keyring'
// import { encodeAddress, decodeAddress } from '@polkadot/util-crypto'

interface AccountsState {
  accounts: Account[]
  activeAccountId?: string
  
  // Actions
  addFromMnemonic: (mnemonic: string, name?: string) => Promise<Account>
  importJson: (json: any, password: string) => Promise<Account>
  addWatchOnly: (address: string, name?: string) => Account
  remove: (accountId: string) => void
  rename: (accountId: string, name: string) => void
  exportJson: (accountId: string, password: string) => Promise<any>
  setActive: (accountId: string) => void
  getActiveAccount: () => Account | undefined
  validateAddress: (address: string) => boolean
  generateMnemonic: () => string[]
}

// Utility functions
const generateAccountId = () => `acc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

// Mock crypto functions (substitute with real Polkadot implementation when available)
const mockMnemonicWords = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'agent', 'agree',
  'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol'
]

const mockGenerateMnemonic = (): string => {
  const words = []
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * mockMnemonicWords.length)
    words.push(mockMnemonicWords[randomIndex])
  }
  return words.join(' ')
}

const mockValidateMnemonic = (mnemonic: string): boolean => {
  const words = mnemonic.trim().split(/\s+/)
  return words.length === 12 || words.length === 24
}

const mockGenerateAddress = (mnemonic: string): string => {
  // Generate a deterministic mock address from mnemonic
  let hash = 0
  for (let i = 0; i < mnemonic.length; i++) {
    const char = mnemonic.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Generate a Substrate-like address
  const addressBytes = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    addressBytes[i] = (hash + i) & 0xFF
  }
  
  // Convert to base58-like string (mock)
  return '5' + Array.from(addressBytes, b => b.toString(16).padStart(2, '0')).join('').substring(0, 46)
}

const mockValidateAddress = (address: string): boolean => {
  return address.length >= 40 && address.startsWith('5')
}

const createSr25519Account = async (mnemonic: string, name?: string): Promise<Account> => {
  try {
    if (!mockValidateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }

    const address = mockGenerateAddress(mnemonic)

    return {
      id: generateAccountId(),
      name: name || `Account ${Date.now()}`,
      address,
      type: 'sr25519',
      meta: {
        source: 'mnemonic'
      }
    }
  } catch (error) {
    throw new Error(`Failed to create account: ${error.message}`)
  }
}

const validateSr25519Address = (address: string): boolean => {
  return mockValidateAddress(address)
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      accounts: [],
      activeAccountId: undefined,

      addFromMnemonic: async (mnemonic: string, name?: string) => {
        try {
          const account = await createSr25519Account(mnemonic, name)
          
          set(state => ({
            accounts: [...state.accounts, account],
            activeAccountId: state.activeAccountId || account.id
          }))
          
          return account
        } catch (error) {
          throw error
        }
      },

      importJson: async (json: any, password: string) => {
        try {
          // Basic JSON validation and extraction
          if (!json || !json.address) {
            throw new Error('Invalid JSON format')
          }

          // Validate address format
          if (!validateSr25519Address(json.address)) {
            throw new Error('Invalid address in JSON file')
          }
          
          // In a real implementation, you'd decrypt with password and extract keys
          // For now, we'll create a basic account from the JSON data
          const account: Account = {
            id: generateAccountId(),
            name: json.meta?.name || 'Imported Account',
            address: json.address,
            type: 'sr25519',
            meta: {
              source: 'json',
              isExternal: true
            }
          }

          set(state => ({
            accounts: [...state.accounts, account],
            activeAccountId: state.activeAccountId || account.id
          }))

          return account
        } catch (error) {
          throw new Error(`Failed to import JSON: ${error.message}`)
        }
      },

      addWatchOnly: (address: string, name?: string) => {
        if (!validateSr25519Address(address)) {
          throw new Error('Invalid address format')
        }

        const account: Account = {
          id: generateAccountId(),
          name: name || `Watch ${address.slice(0, 8)}...`,
          address,
          type: 'watch',
          meta: {
            source: 'watch'
          }
        }

        set(state => ({
          accounts: [...state.accounts, account],
          activeAccountId: state.activeAccountId || account.id
        }))

        return account
      },

      remove: (accountId: string) => {
        set(state => {
          const newAccounts = state.accounts.filter(acc => acc.id !== accountId)
          const newActiveId = state.activeAccountId === accountId 
            ? (newAccounts.length > 0 ? newAccounts[0].id : undefined)
            : state.activeAccountId

          return {
            accounts: newAccounts,
            activeAccountId: newActiveId
          }
        })
      },

      rename: (accountId: string, name: string) => {
        set(state => ({
          accounts: state.accounts.map(acc => 
            acc.id === accountId ? { ...acc, name } : acc
          )
        }))
      },

      exportJson: async (accountId: string, password: string) => {
        const account = get().accounts.find(acc => acc.id === accountId)
        if (!account) {
          throw new Error('Account not found')
        }

        if (account.type === 'watch') {
          throw new Error('Cannot export watch-only account')
        }

        // In a real implementation, this would export the actual encrypted keystore
        // For now, return a mock JSON structure
        return {
          address: account.address,
          encoded: 'encrypted_private_key_here',
          encoding: {
            content: ['pkcs8', 'sr25519'],
            type: ['scrypt', 'xsalsa20-poly1305'],
            version: '3'
          },
          meta: {
            name: account.name,
            whenCreated: Date.now()
          }
        }
      },

      setActive: (accountId: string) => {
        const account = get().accounts.find(acc => acc.id === accountId)
        if (account) {
          set({ activeAccountId: accountId })
        }
      },

      getActiveAccount: () => {
        const state = get()
        return state.accounts.find(acc => acc.id === state.activeAccountId)
      },

      validateAddress: validateSr25519Address,

      generateMnemonic: () => {
        const mnemonic = mockGenerateMnemonic()
        return mnemonic.split(' ')
      }
    }),
    {
      name: 'bazari-wallet-accounts',
      partialize: (state) => ({
        accounts: state.accounts,
        activeAccountId: state.activeAccountId
      })
    }
  )
)