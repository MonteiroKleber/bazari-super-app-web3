import { useCallback } from 'react'
import { useChain } from '@app/providers/ChainProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { usePasswordPrompt } from '@app/providers/PasswordPromptProvider'
import { signAndSend } from '../services/extrinsicSigner'
import type { ApiPromise, SubmittableExtrinsic } from '@polkadot/api'

export function useSignAndSend() {
  const { api, isReady, ss58Format } = useChain()
  const { user } = useAuthStore()
  const { promptPassword } = usePasswordPrompt()

  const send = useCallback(async (
    build: (api: ApiPromise) => SubmittableExtrinsic<'promise'>,
    opts?: { onStatus?: (s: string) => void }
  ) => {
    if (!api || !isReady) throw new Error('Chain API não está pronta')
    if (!user?.walletAddress) throw new Error('Usuário não logado')

    const getPassword = async () => {
      return await promptPassword({
        title: 'Confirmar assinatura',
        address: user.walletAddress
      })
    }

    return await signAndSend(
      api,
      user.walletAddress,
      build,
      { ss58: ss58Format, getPassword, onStatus: opts?.onStatus }
    )
  }, [api, isReady, ss58Format, promptPassword, user?.walletAddress])

  return send
}
