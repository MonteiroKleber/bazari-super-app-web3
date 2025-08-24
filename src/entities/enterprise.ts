export type Enterprise = {
  id: string
  name: string
  cnpj?: string
  address?: string
  description?: string
  logoCid?: string
  docs?: { name: string; cid: string }[]
  videos?: { name: string; cid: string }[]
  updatedAt: string
}
