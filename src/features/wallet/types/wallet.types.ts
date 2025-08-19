
export interface Account {
  id: string
  name: string
  address: string
  type: 'sr25519' | 'watch'
  meta?: {
    publicKey?: string
    derivationPath?: string
    isExternal?: boolean
    source?: 'mnemonic' | 'json' | 'watch'
  }
}

export interface Token {
  key: string
  type: 'native' | 'asset'
  assetId?: string | number
  symbol: string
  decimals: number
  name?: string
  iconUrl?: string
}

export interface Nft {
  id: string
  collection: string
  name?: string
  image?: string
  meta?: {
    description?: string
    attributes?: Array<{
      trait_type: string
      value: string | number
    }>
    external_url?: string
    tokenized?: boolean
  }
}

export interface Tx {
  hash: string
  time: number
  kind: 'send' | 'receive' | 'mint' | 'burn'
  assetKey: string
  amount?: string
  from?: string
  to?: string
  status: 'pending' | 'included' | 'finalized' | 'failed'
  error?: string
}

export interface Chain {
  name: string
  symbol: string
  decimals: number
  ss58Prefix: number
  networkId: string
}

export interface Balance {
  free: string
  reserved: string
  total: string
}

export interface TransferParams {
  from: Account
  to: string
  token: Token
  amount: string
}

export interface NftTransferParams {
  from: Account
  to: string
  nft: Nft
}

export interface SignAndSendParams {
  account: Account
  extrinsic: any
}

export interface CreateAccountParams {
  mnemonic: string
  name?: string
  derivationPath?: string
}

export interface ImportJsonParams {
  json: any
  password: string
}

export interface ExportJsonParams {
  accountId: string
  password: string
}

export interface AddTokenParams {
  assetId: string | number
  name: string
  symbol: string
  decimals: number
  iconUrl?: string
}

export interface AddNftParams {
  collectionId: string
  name: string
  endpoint?: string
  previewUrl?: string
}