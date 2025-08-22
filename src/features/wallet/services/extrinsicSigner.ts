import type { ApiPromise, SubmittableExtrinsic } from '@polkadot/api'
import type { Signer } from '@polkadot/api/types'
import type { KeyringPair$Json } from '@polkadot/keyring/types'
import { createWorkerSigner } from './signerClient'
import { getAccountJson } from './localKeystore'

type GetPassword = (address: string, ctx?: any) => Promise<string> | string

export async function signAndSend(
  api: ApiPromise,
  address: string,
  build: (api: ApiPromise) => SubmittableExtrinsic<'promise'>,
  opts: {
    ss58: number
    getPassword?: GetPassword
    onStatus?: (status: string) => void
  } = { ss58: 42 }
) {
  const getJsonForAddress = async (addr: string): Promise<KeyringPair$Json> => getAccountJson(addr)

  const defaultGetPassword: GetPassword = async () => {
    const pwd = window.prompt('Senha da conta:')
    if (!pwd) throw new Error('Operação cancelada')
    return pwd
  }
  const getPassword = opts.getPassword || defaultGetPassword

  const signer: Signer = createWorkerSigner({
    ss58: opts.ss58,
    getPassword: (addr, payload) => getPassword(addr, payload),
    getJsonForAddress
  })

  api.setSigner(signer)

  const extrinsic = build(api)
  return new Promise<string>((resolve, reject) => {
    extrinsic.signAndSend(address, (result) => {
      opts.onStatus?.(result.status.type)
      if (result.status.isInBlock) {
        resolve(result.status.asInBlock.toString())
      } else if (result.status.isFinalized) {
        resolve(result.status.asFinalized.toString())
      } else if (result.isError) {
        reject(new Error('Extrínseca falhou'))
      }
    }).catch(reject)
  })
}
