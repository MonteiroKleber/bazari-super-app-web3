// src/features/enterprises/EditEnterprise.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Enterprise } from '@entities/enterprise'
import { useChain } from '@app/providers/ChainProvider'
import { useSignAndSend } from '@features/wallet/hooks/useSignAndSend'
import { loadEnterprises } from '@services/enterpriseRepo'
import { updateEnterprise } from '@services/enterpriseCrud'
import { addFile, ipfsGatewayUrl } from '@services/ipfsClient'

export default function EditEnterprise() {
  const { id } = useParams()
  const nav = useNavigate()
  const { api, isReady } = useChain()
  const signAndSend = useSignAndSend()

  const [ent, setEnt] = useState<Enterprise | null>(null)
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [addressF, setAddressF] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const [newLogo, setNewLogo] = useState<File | null>(null)
  const [newDocs, setNewDocs] = useState<FileList | null>(null)
  const [newVideos, setNewVideos] = useState<FileList | null>(null)

  const [docsToRemove, setDocsToRemove] = useState<Set<number>>(new Set())
  const [videosToRemove, setVideosToRemove] = useState<Set<number>>(new Set())

  useEffect(() => {
    (async () => {
      if (!api || !isReady) return
      setLoading(true)
      try {
        const list = await loadEnterprises(api)
        const found = list.find((x) => x.id === id) ?? null
        setEnt(found)
        if (found) {
          setName(found.name)
          setCnpj(found.cnpj ?? '')
          setAddressF(found.address ?? '')
          setDescription(found.description ?? '')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [api, isReady, id])

  function toggleSet(setter: (v: Set<number>) => void, current: Set<number>, idx: number) {
    const s = new Set(current)
    s.has(idx) ? s.delete(idx) : s.add(idx)
    setter(s)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!api || !isReady || !ent) return

    try {
      setStatus('Atualizando...')
      setLoading(true)

      const patch: Partial<Enterprise> = { name, cnpj, address: addressF, description }

      if (newLogo) patch.logoCid = await addFile(newLogo)

      if (ent.docs || newDocs) {
        const keepDocs = (ent.docs ?? []).filter((_, i) => !docsToRemove.has(i))
        const addDocs: { name: string; cid: string }[] = []
        for (const d of (newDocs ? Array.from(newDocs) : [])) {
          const cid = await addFile(d)
          addDocs.push({ name: d.name, cid })
        }
        patch.docs = [...keepDocs, ...addDocs]
      }

      if (ent.videos || newVideos) {
        const keepVideos = (ent.videos ?? []).filter((_, i) => !videosToRemove.has(i))
        const addVideos: { name: string; cid: string }[] = []
        for (const v of (newVideos ? Array.from(newVideos) : [])) {
          const cid = await addFile(v)
          addVideos.push({ name: v.name, cid })
        }
        patch.videos = [...keepVideos, ...addVideos]
      }

      await updateEnterprise(api, signAndSend, ent.id, patch, (s) => setStatus(s))
      setStatus('Empresa atualizada!')
      nav('/enterprises')
    } catch (err: any) {
      console.error(err)
      setStatus('Erro: ' + (err?.message ?? 'desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Carregando...</p>
  if (!ent) return <p>Empresa não encontrada.</p>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Editar Empresa</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome *</label>
          <input className="w-full border rounded p-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">CNPJ</label>
            <input className="w-full border rounded p-2" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Endereço</label>
            <input className="w-full border rounded p-2" value={addressF} onChange={(e) => setAddressF(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea className="w-full border rounded p-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* LOGO atual / nova */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Logo atual</label>
            {ent.logoCid ? (
              <img src={ipfsGatewayUrl(ent.logoCid)} alt="logo atual" className="h-16 w-16 rounded border object-cover" />
            ) : (
              <div className="h-16 w-16 rounded bg-gray-100 grid place-items-center text-xs text-gray-500">sem logo</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Substituir logo</label>
            <input type="file" accept="image/*" onChange={(e) => setNewLogo(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        {/* DOCS */}
        <div>
          <label className="block text-sm font-medium mb-1">Documentos</label>
          {(ent.docs?.length ?? 0) > 0 ? (
            <ul className="mb-2 space-y-1">
              {ent.docs!.map((d, i) => (
                <li key={`${d.cid}:${i}`} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={docsToRemove.has(i)}
                    onChange={() => {
                      const s = new Set(docsToRemove)
                      s.has(i) ? s.delete(i) : s.add(i)
                      setDocsToRemove(s)
                    }}
                  />
                  <a href={ipfsGatewayUrl(d.cid)} target="_blank" rel="noreferrer" className="text-[#8B0000] underline">
                    {d.name}
                  </a>
                  <span className="text-xs opacity-70">({d.cid})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-70 mb-2">Nenhum documento.</p>
          )}

          <div>
            <label className="block text-sm font-medium">Adicionar novos documentos</label>
            <input type="file" multiple onChange={(e) => setNewDocs(e.target.files)} />
          </div>
        </div>

        {/* VIDEOS */}
        <div>
          <label className="block text-sm font-medium mb-1">Vídeos</label>
          {(ent.videos?.length ?? 0) > 0 ? (
            <ul className="mb-2 space-y-1">
              {ent.videos!.map((v, i) => (
                <li key={`${v.cid}:${i}`} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={videosToRemove.has(i)}
                    onChange={() => {
                      const s = new Set(videosToRemove)
                      s.has(i) ? s.delete(i) : s.add(i)
                      setVideosToRemove(s)
                    }}
                  />
                  <a href={ipfsGatewayUrl(v.cid)} target="_blank" rel="noreferrer" className="text-[#8B0000] underline">
                    {v.name}
                  </a>
                  <span className="text-xs opacity-70">({v.cid})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-70 mb-2">Nenhum vídeo.</p>
          )}

          <div>
            <label className="block text-sm font-medium">Adicionar novos vídeos</label>
            <input type="file" accept="video/*" multiple onChange={(e) => setNewVideos(e.target.files)} />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-[#8B0000] text-white px-4 py-2 rounded">Salvar alterações</button>
          <button type="button" className="border px-4 py-2 rounded" onClick={() => nav('/enterprises')}>Cancelar</button>
        </div>

        {status && <p className="text-sm">{status}</p>}
      </form>
    </div>
  )
}
