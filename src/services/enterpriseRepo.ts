import type { ApiPromise } from '@polkadot/api'
import type { Enterprise } from '@entities/enterprise'
import { addJSON, fetchJsonByCid } from '@services/ipfsClient'
import { queryHead } from '@services/chain/universalRegistry'

export async function loadEnterprises(api: ApiPromise): Promise<Enterprise[]> {
  const head = await queryHead(api)
  if (!head) return []
  try {
    const data = await fetchJsonByCid<{ enterprises: Enterprise[] }>(head)
    return data?.enterprises ?? []
  } catch {
    return []
  }
}

// retorna novo CID do manifest
export async function saveEnterprises(list: Enterprise[]): Promise<string> {
  return addJSON({ enterprises: list })
}
