import { v4 as uuid } from 'uuid'
import type { ApiPromise } from '@polkadot/api'
import type { Enterprise } from '@entities/enterprise'
import { addFile } from '@services/ipfsClient'
import { loadEnterprises, saveEnterprises } from '@services/enterpriseRepo'
import { buildSetHead, buildUpsertItem, buildRemoveItem } from '@services/chain/universalRegistry'

type SendFn = (build: (api: ApiPromise) => any, opts?: { onStatus?: (s: string)=>void }) => Promise<string>

export async function createEnterprise(
  api: ApiPromise,
  send: SendFn,
  input: Omit<Enterprise,'id'|'updatedAt'|'logoCid'|'docs'|'videos'>,
  files: { logo?: File|null; docs?: File[]; videos?: File[] },
  onStatus?: (s: string)=>void
) {
  const list = await loadEnterprises(api)
  const now = new Date().toISOString()

  const logoCid = files.logo ? await addFile(files.logo) : undefined

  const docs: { name: string; cid: string }[] = []
  for (const d of (files.docs ?? [])) docs.push({ name: d.name, cid: await addFile(d) })

  const videos: { name: string; cid: string }[] = []
  for (const v of (files.videos ?? [])) videos.push({ name: v.name, cid: await addFile(v) })

  const ent: Enterprise = { id: uuid(), ...input, logoCid, docs, videos, updatedAt: now }
  list.push(ent)

  // 1) grava manifest no IPFS
  const cid = await saveEnterprises(list)

  // 2) setHead e index do item (2 extrínsecas; você pode batê-las separadas)
  await send((api) => buildSetHead(api, cid), { onStatus })
  await send((api) => buildUpsertItem(api, ent.id, cid), { onStatus })

  return ent
}

export async function updateEnterprise(
  api: ApiPromise,
  send: SendFn,
  id: string,
  patch: Partial<Enterprise>,
  onStatus?: (s: string)=>void
) {
  const list = await loadEnterprises(api)
  const idx = list.findIndex(e => e.id === id)
  if (idx < 0) throw new Error('enterprise not found')

  list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() }

  const cid = await saveEnterprises(list)
  await send((api) => buildSetHead(api, cid), { onStatus })
  await send((api) => buildUpsertItem(api, id, cid), { onStatus })

  return list[idx]
}

export async function deleteEnterprise(
  api: ApiPromise,
  send: SendFn,
  id: string,
  onStatus?: (s: string)=>void
) {
  const list = await loadEnterprises(api)
  const filtered = list.filter(e => e.id !== id)
  const cid = await saveEnterprises(filtered)
  await send((api) => buildSetHead(api, cid), { onStatus })
  await send((api) => buildRemoveItem(api, id), { onStatus })
}
