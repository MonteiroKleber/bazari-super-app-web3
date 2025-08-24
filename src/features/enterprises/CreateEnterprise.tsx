// src/features/enterprises/CreateEnterprise.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChain } from '@app/providers/ChainProvider'
import { useSignAndSend } from '@features/wallet/hooks/useSignAndSend'
import { createEnterprise } from '@services/enterpriseCrud'

export default function CreateEnterprise() {
  const nav = useNavigate()
  const { api, isReady } = useChain()
  const signAndSend = useSignAndSend() // <- exatamente como no seu exemplo

  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [addressF, setAddressF] = useState('')
  const [description, setDescription] = useState('')

  const [logo, setLogo] = useState<File | null>(null)
  const [docs, setDocs] = useState<FileList | null>(null)
  const [videos, setVideos] = useState<FileList | null>(null)

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!api || !isReady) return alert('A API da chain ainda não está pronta.')

    try {
      setLoading(true)
      setStatus('Iniciando criação...')

      await createEnterprise(
        api,
        signAndSend, // <- passamos direto
        { name, cnpj, address: addressF, description },
        {
          logo,
          docs: docs ? Array.from(docs) : [],
          videos: videos ? Array.from(videos) : [],
        },
        (s) => setStatus(s)
      )

      setStatus('Empresa criada com sucesso!')
      nav('/enterprises')
    } catch (err: any) {
      console.error(err)
      setStatus('Erro: ' + (err?.message ?? 'desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Cadastrar Empresa</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome *</label>
          <input
            className="w-full border rounded p-2"
            placeholder="Ex.: Bazari Tech Solutions"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">CNPJ</label>
            <input
              className="w-full border rounded p-2"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Endereço</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Rua, nº, bairro, cidade/UF"
              value={addressF}
              onChange={(e) => setAddressF(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            placeholder="Fale sobre sua empresa..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Logo (imagem)</label>
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Documentos</label>
            <input type="file" multiple onChange={(e) => setDocs(e.target.files)} />
            <p className="text-xs opacity-70 mt-1">Aceita múltiplos arquivos.</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Vídeos</label>
            <input type="file" accept="video/*" multiple onChange={(e) => setVideos(e.target.files)} />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-[#8B0000] text-white px-4 py-2 rounded disabled:opacity-60">
            {loading ? 'Enviando...' : 'Cadastrar'}
          </button>
          <button type="button" className="border px-4 py-2 rounded" onClick={() => nav('/enterprises')}>
            Cancelar
          </button>
        </div>

        {status && <p className="text-sm">{status}</p>}
      </form>
    </div>
  )
}
