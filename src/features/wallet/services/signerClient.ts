// src/features/wallet/services/signerClient.ts
import type { Signer, SignerPayloadJSON, SignerResult } from '@polkadot/api/types'
import type { KeyringPair$Json } from '@polkadot/keyring/types'
import SignerWorker from '../workers/signer.worker?worker'

let _worker: Worker | null = null
function getWorker(): Worker {
  if (_worker) return _worker
  _worker = new SignerWorker()
  return _worker
}

type SignRequest = {
  id: string
  resolve: (sig: string) => void
  reject: (e: any) => void
}

const pending = new Map<string, SignRequest>()

// instalar listeners uma vez
(function initListener() {
  const w = getWorker()
  w.addEventListener('message', (ev: MessageEvent<any>) => {
    const data = ev.data
    if (!data) return
    if (data.type === 'signed') {
      const req = pending.get(data.id)
      if (req) { req.resolve(data.signature); pending.delete(data.id) }
    } else if (data.type === 'error') {
      const req = pending.get(data.id)
      if (req) { req.reject(new Error(data.message)); pending.delete(data.id) }
    }
  })
})()

async function signHexWithWorker(params: {
  ss58: number
  address: string
  json: KeyringPair$Json
  password: string
  hex: string
}): Promise<string> {
  const id = crypto.randomUUID()
  const w = getWorker()
  return new Promise<string>((resolve, reject) => {
    pending.set(id, { id, resolve, reject })
    w.postMessage({ type: 'sign-hex', id, ...params })
  })
}

/**
 * Cria um Signer para a API que pergunta a senha on-demand (JIT),
 * envia JSON cifrado + senha para o Worker e devolve a assinatura.
 */
export function createWorkerSigner(opts: {
  ss58: number
  getPassword: (address: string, payload: SignerPayloadJSON) => Promise<string> | string
  getJsonForAddress: (address: string) => Promise<KeyringPair$Json>
}): Signer {
  const { ss58, getPassword, getJsonForAddress } = opts

  return {
    async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
      // 1) obter senha (JIT)
      const password = await getPassword(payload.address, payload)

      // 2) pegar JSON cifrado
      const json = await getJsonForAddress(payload.address)

      // 3) assinar o payload.data (hex) no Worker
      const signature = await signHexWithWorker({
        ss58,
        address: payload.address,
        json,
        password,
        hex: payload.data
      })

      return { id: Number(payload.nonce) || Date.now(), signature }
    },

    // opcional: suporte a signRaw
    async signRaw(raw) {
      const password = await getPassword(raw.address, raw)
      const json = await getJsonForAddress(raw.address)
      const signature = await signHexWithWorker({
        ss58,
        address: raw.address,
        json,
        password,
        hex: raw.data
      })
      return { id: Date.now(), signature }
    }
  }
}
