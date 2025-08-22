import type { ApiPromise } from '@polkadot/api'
import type { Token } from '../types/wallet.types'
import { getChainApi } from '@app/chain/chainSingleton'

/**
 * Normaliza catálogo de tokens:
 * - Sempre inclui o nativo (BZR) pela registry
 * - Se pallet-assets existir, pode-se estender para listar IDs configurados (deixar lista fixa se quiser)
 */
async function normalizeTokensInternal(api: ApiPromise): Promise<Token[]> {
  const symbol = api.registry.chainTokens?.()[0] || 'BZR'
  const decimals = api.registry.chainDecimals?.()[0] ?? 12

  const base: Token[] = [{
    key: symbol,
    type: 'native',
    symbol,
    decimals,
    name: 'BazariChain Native Token',
  }]

  // (Opcional) incluir alguns assets estáticos conhecidos do app:
  // if ((api.query as any).assets?.metadata) { ... }

  return base
}

async function getNativeBalance(api: ApiPromise, address: string): Promise<string> {
  const acc: any = await api.query.system.account(address)
  return acc.data.free.toString()
}

async function getAssetBalance(api: ApiPromise, assetId: string | number, address: string): Promise<string> {
  const qAssets = (api.query as any).assets
  if (!qAssets?.account) return '0'
  const data: any = await qAssets.account(assetId, address)
  return (data?.balance ?? '0').toString()
}

export const tokenService = {
  async normalizeTokens(): Promise<Token[]> {
    const api = await getChainApi()
    return await normalizeTokensInternal(api)
  },

  async getTokenBalance(token: Token, account: { address: string }): Promise<string> {
    const api = await getChainApi()
    if (token.type === 'native') {
      return await getNativeBalance(api, account.address)
    }
    if (token.type === 'asset') {
      const id = (token as any).assetId
      if (id === undefined || id === null) return '0'
      return await getAssetBalance(api, id, account.address)
    }
    return '0'
  },
}
