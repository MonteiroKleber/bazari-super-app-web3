// src/features/enterprises/ListEnterprise.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useChain } from '@app/providers/ChainProvider'
import { useSignAndSend } from '@features/wallet/hooks/useSignAndSend'
import type { Enterprise } from '@entities/enterprise'
import { loadEnterprises } from '@services/enterpriseRepo'
import { deleteEnterprise } from '@services/enterpriseCrud'
import { ipfsGatewayUrl } from '@services/ipfsClient'

export default function ListEnterprise() {
  const { api, isReady } = useChain()
  const signAndSend = useSignAndSend()

  const [search, setSearch] = useState('')
  const [items, setItems] = useState<Enterprise[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  async function fetchData() {
    if (!api || !isReady) return
    setLoading(true)
    setStatus('Carregando empresas...')
    try {
      const list = await loadEnterprises(api)
      setItems(list)
      setStatus('')
    } catch (err: any) {
      console.error(err)
      setStatus('Erro ao carregar empresas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [api, isReady])

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return items.filter((e) =>
      (e.name ?? '').toLowerCase().includes(s) || (e.cnpj ?? '').toLowerCase().includes(s)
    )
  }, [items, search])

  async function onDelete(id: string) {
    if (!api || !isReady) return alert('A API da chain ainda não está pronta.')
    if (!confirm('Tem certeza que deseja remover esta empresa?')) return
    try {
      setStatus('Removendo...')
      await deleteEnterprise(api, signAndSend, id, (st) => setStatus(st))
      setItems(prev => prev.filter(e => e.id !== id))
      setStatus('Empresa removida.')
    } catch (err: any) {
      console.error(err)
      setStatus('Erro ao remover.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Empresas</h1>
        <div className="flex gap-2">
          <Link to="/enterprises/create" className="bg-[#8B0000] text-white px-4 py-2 rounded">Nova Empresa</Link>
          <button className="border px-4 py-2 rounded" onClick={fetchData}>Atualizar</button>
        </div>
      </div>

      <div className="mb-4">
        <input
          className="w-full border rounded p-2"
          placeholder="Buscar por nome ou CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p>Carregando...</p>}
      {!loading && filtered.length === 0 && <p className="opacity-80">Nenhuma empresa encontrada.</p>}

      <ul className="space-y-3">
        {filtered.map((e) => (
          <li key={e.id} className="border rounded p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {e.logoCid ? (
                <img src={ipfsGatewayUrl(e.logoCid)} alt="logo" className="h-12 w-12 object-cover rounded border" />
              ) : (
                <div className="h-12 w-12 rounded bg-gray-100 grid place-items-center text-xs text-gray-500">sem logo</div>
              )}
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-sm opacity-80">{e.cnpj ? `CNPJ: ${e.cnpj}` : '—'}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link className="border px-3 py-1 rounded" to={`/enterprises/edit/${e.id}`}>Editar</Link>
              <button className="border px-3 py-1 rounded" onClick={() => onDelete(e.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  )
}
