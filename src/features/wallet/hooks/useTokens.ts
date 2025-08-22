// src/features/wallet/hooks/useTokens.ts
import React from 'react'
import type { ApiPromise } from '@polkadot/api'
import { BN } from '@polkadot/util'
import { useActiveAccount } from '../hooks/useActiveAccount'
// ajuste este import para o hook real do seu provider:
import { useChain } from '@app/providers/ChainProvider'

export type TokenWithBalance = {
  key: string
  type: 'native' | 'asset'
  symbol: string
  name?: string
  decimals: number
  rawBalance: string
  formattedBalance: string
  balanceInFiat?: number
  priceUSD?: number
}

type UseTokens = {
  tokens: TokenWithBalance[]
  nativeToken?: TokenWithBalance
  assetTokens: TokenWithBalance[]
  totalBalance: number
  isLoading: boolean
  error?: unknown
  refreshBalances: () => Promise<void>
}

function formatUnits(raw: BN | string, decimals: number): string {
  const s = BN.isBN(raw) ? raw.toString() : String(raw)
  const neg = s.startsWith('-')
  const digits = neg ? s.slice(1) : s
  const pad = digits.padStart(decimals + 1, '0')
  const int = pad.slice(0, pad.length - decimals)
  const frac = pad.slice(pad.length - decimals).replace(/0+$/, '')
  return (neg ? '-' : '') + (frac ? `${int}.${frac}` : int)
}

export function useTokens(): UseTokens {
  const { activeAccount } = useActiveAccount()
  const { api, isReady } = useChain() as { api?: ApiPromise; isReady: boolean }

  const [isLoading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<unknown>()
  const [nativeToken, setNativeToken] = React.useState<TokenWithBalance>()
  const [assetTokens, setAssetTokens] = React.useState<TokenWithBalance[]>([])

  const address = activeAccount?.address

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(undefined)
      if (!api || !isReady || !address) {
        setNativeToken(undefined)
        setAssetTokens([])
        return
      }

      // Lê metadados da chain
      const decimals = api.registry.chainDecimals?.[0] ?? 12
      const symbol = api.registry.chainTokens?.[0] ?? 'BZR'

      // Saldo nativo
      const { data } = await api.query.system.account(address)
      const free = (data as any).free as BN
      const formatted = formatUnits(free, decimals)

      const native: TokenWithBalance = {
        key: `native:${symbol}`,
        type: 'native',
        symbol,
        name: symbol,
        decimals,
        rawBalance: free.toString(),
        formattedBalance: formatted,
      }
      setNativeToken(native)

      // TODO: se você tiver assets (pallet-assets / PSP22), carregue aqui
      // const assets: TokenWithBalance[] = await loadAssets(api, address)
      setAssetTokens([])

    } catch (e) {
      setError(e)
      setNativeToken(undefined)
      setAssetTokens([])
    } finally {
      setLoading(false)
    }
  }, [api, isReady, address])

  React.useEffect(() => {
    void load()
  }, [load])

  const tokens = React.useMemo(() => {
    const list = []
    if (nativeToken) list.push(nativeToken)
    return list.concat(assetTokens)
  }, [nativeToken, assetTokens])

  const totalBalance = React.useMemo(() => {
    // Por enquanto, some só o nativo (em “unidade do token”, não fiat)
    const n = nativeToken ? parseFloat(nativeToken.formattedBalance || '0') : 0
    const a = assetTokens.reduce((acc, t) => acc + (parseFloat(t.formattedBalance || '0') || 0), 0)
    return n + a
  }, [nativeToken, assetTokens])

  return {
    tokens,
    nativeToken,
    assetTokens,
    totalBalance,
    isLoading,
    error,
    refreshBalances: load,
  }
}
