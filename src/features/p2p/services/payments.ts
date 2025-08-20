// ==========================================
// src/features/p2p/services/payments.ts - COMPLETO
// ==========================================

import type { PaymentMethod } from '../types/p2p.types'

/**
 * Informações de um método de pagamento
 */
export interface PaymentMethodInfo {
  id: PaymentMethod
  label: string
  description: string
  icon: string
  color: string
  instantTransfer: boolean
  workingHours?: string
  maxAmount?: number
  minAmount?: number
  processingTime: string
  fees?: string
  requirements?: string[]
  risks?: string[]
  tips?: string[]
}

/**
 * Dados de validação para método de pagamento
 */
export interface PaymentValidationData {
  method: PaymentMethod
  accountData: Record<string, any>
  isValid: boolean
  errors: string[]
}

/**
 * Catálogo completo de métodos de pagamento
 */
const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodInfo> = {
  PIX: {
    id: 'PIX',
    label: 'PIX',
    description: 'Transferência instantânea via PIX',
    icon: '⚡',
    color: 'text-green-600 bg-green-50 border-green-200',
    instantTransfer: true,
    processingTime: 'Instantâneo (24h/dia)',
    fees: 'Gratuito na maioria dos bancos',
    requirements: [
      'Conta bancária ou carteira digital',
      'Chave PIX cadastrada'
    ],
    tips: [
      'Sempre confirme a chave PIX antes de enviar',
      'Guarde o comprovante da transação',
      'Transferências são instantâneas e irreversíveis'
    ]
  },
  
  TED: {
    id: 'TED',
    label: 'TED',
    description: 'Transferência Eletrônica Disponível',
    icon: '🏦',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    instantTransfer: false,
    workingHours: 'Segunda a sexta: 6h às 17h30',
    processingTime: 'Até 30 minutos (dias úteis)',
    minAmount: 5,
    fees: 'R$ 8 a R$ 25 dependendo do banco',
    requirements: [
      'Conta bancária',
      'Dados bancários completos do destinatário'
    ],
    risks: [
      'Não funciona fora do horário bancário',
      'Pode ser cobrada taxa'
    ],
    tips: [
      'Confira os dados bancários cuidadosamente',
      'Considere usar PIX se disponível',
      'Guarde o comprovante'
    ]
  },
  
  DOC: {
    id: 'DOC',
    label: 'DOC',
    description: 'Documento de Ordem de Crédito',
    icon: '📄',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    instantTransfer: false,
    workingHours: 'Segunda a sexta: 6h às 22h',
    processingTime: 'Até 1 dia útil',
    maxAmount: 5000,
    fees: 'R$ 3 a R$ 15 dependendo do banco',
    requirements: [
      'Conta bancária',
      'Dados bancários completos do destinatário'
    ],
    risks: [
      'Demora para compensar',
      'Limite de valor baixo'
    ],
    tips: [
      'Prefira PIX ou TED se disponível',
      'Verifique o limite de valor'
    ]
  },
  
  DINHEIRO: {
    id: 'DINHEIRO',
    label: 'Dinheiro',
    description: 'Pagamento em espécie (presencial)',
    icon: '💵',
    color: 'text-green-600 bg-green-50 border-green-200',
    instantTransfer: true,
    processingTime: 'Imediato (encontro presencial)',
    fees: 'Gratuito',
    requirements: [
      'Encontro presencial',
      'Local público e seguro'
    ],
    risks: [
      'Risco de segurança pessoal',
      'Possibilidade de dinheiro falso',
      'Sem rastro digital'
    ],
    tips: [
      'Sempre se encontre em local público',
      'Leve acompanhante se possível',
      'Verifique a autenticidade das notas',
      'Considere usar detector de notas falsas'
    ]
  },
  
  CARTAO: {
    id: 'CARTAO',
    label: 'Cartão',
    description: 'Pagamento com cartão de débito/crédito',
    icon: '💳',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    instantTransfer: false,
    processingTime: '1-3 dias úteis',
    fees: '2-5% de taxa da operadora',
    requirements: [
      'Maquininha de cartão',
      'Encontro presencial ou sistema online'
    ],
    risks: [
      'Possibilidade de estorno',
      'Taxas de processamento',
      'Demora na compensação'
    ],
    tips: [
      'Use apenas em transações de confiança',
      'Verifique as taxas aplicáveis',
      'Guarde o comprovante'
    ]
  },
  
  OUTRO: {
    id: 'OUTRO',
    label: 'Outro',
    description: 'Método de pagamento personalizado',
    icon: '🔄',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    instantTransfer: false,
    processingTime: 'Variável',
    fees: 'A combinar',
    requirements: [
      'Acordo entre as partes'
    ],
    risks: [
      'Método não padronizado',
      'Maior risco de problemas'
    ],
    tips: [
      'Defina claramente os termos',
      'Use apenas com usuários confiáveis',
      'Documente o acordo'
    ]
  }
}

/**
 * Métodos de pagamento habilitados na plataforma
 */
const ENABLED_PAYMENT_METHODS: PaymentMethod[] = ['PIX', 'TED', 'DINHEIRO']

/**
 * Obtém informações de um método de pagamento
 */
export function getPaymentMethodInfo(method: PaymentMethod): PaymentMethodInfo {
  return PAYMENT_METHODS[method]
}

/**
 * Obtém todos os métodos de pagamento habilitados
 */
export function getEnabledPaymentMethods(): PaymentMethodInfo[] {
  return ENABLED_PAYMENT_METHODS.map(method => PAYMENT_METHODS[method])
}

/**
 * Obtém métodos recomendados baseado no valor da transação
 */
export function getRecommendedPaymentMethods(amountBRL: number): PaymentMethodInfo[] {
  const enabled = getEnabledPaymentMethods()
  
  return enabled
    .filter(method => {
      // Filtrar por valor se houver limites
      if (method.minAmount && amountBRL < method.minAmount) return false
      if (method.maxAmount && amountBRL > method.maxAmount) return false
      return true
    })
    .sort((a, b) => {
      // Priorizar métodos instantâneos
      if (a.instantTransfer && !b.instantTransfer) return -1
      if (!a.instantTransfer && b.instantTransfer) return 1
      
      // Priorizar PIX
      if (a.id === 'PIX') return -1
      if (b.id === 'PIX') return 1
      
      return 0
    })
}

/**
 * Verifica se um método de pagamento está disponível no horário atual
 */
export function isPaymentMethodAvailable(method: PaymentMethod): boolean {
  const info = getPaymentMethodInfo(method)
  
  // Métodos instantâneos sempre disponíveis
  if (info.instantTransfer) return true
  
  // Se não tem horário definido, assumir sempre disponível
  if (!info.workingHours) return true
  
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = domingo, 1 = segunda, etc.
  const hour = now.getHours()
  
  // Lógica específica por método
  switch (method) {
    case 'TED':
      // Segunda a sexta, 6h às 17h30
      return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 6 && hour < 17
      
    case 'DOC':
      // Segunda a sexta, 6h às 22h
      return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 6 && hour < 22
      
    default:
      return true
  }
}

/**
 * Valida dados de um método de pagamento
 */
export function validatePaymentData(
  method: PaymentMethod, 
  data: Record<string, any>
): PaymentValidationData {
  const errors: string[] = []
  
  switch (method) {
    case 'PIX':
      if (!data.pixKey) {
        errors.push('Chave PIX é obrigatória')
      } else {
        // Validações básicas de chave PIX
        const key = data.pixKey.trim()
        if (key.length === 0) {
          errors.push('Chave PIX não pode estar vazia')
        }
        // Aqui poderia ter validações mais específicas (email, telefone, CPF, etc.)
      }
      break
      
    case 'TED':
    case 'DOC':
      if (!data.bank) errors.push('Banco é obrigatório')
      if (!data.agency) errors.push('Agência é obrigatória')
      if (!data.account) errors.push('Conta é obrigatória')
      if (!data.accountType) errors.push('Tipo de conta é obrigatório')
      if (!data.holderName) errors.push('Nome do titular é obrigatório')
      if (!data.holderDocument) errors.push('CPF/CNPJ do titular é obrigatório')
      break
      
    case 'DINHEIRO':
      if (!data.meetingLocation) {
        errors.push('Local de encontro é obrigatório')
      }
      if (!data.meetingTime) {
        errors.push('Horário de encontro é obrigatório')
      }
      break
      
    case 'CARTAO':
      if (!data.cardBrand) errors.push('Bandeira do cartão é obrigatória')
      if (!data.processingMethod) errors.push('Método de processamento é obrigatório')
      break
      
    default:
      // Para 'OUTRO', validação customizada
      if (!data.description) {
        errors.push('Descrição do método é obrigatória')
      }
      break
  }
  
  return {
    method,
    accountData: data,
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Formata dados de pagamento para exibição
 */
export function formatPaymentData(method: PaymentMethod, data: Record<string, any>): string {
  switch (method) {
    case 'PIX':
      return `PIX: ${data.pixKey}`
      
    case 'TED':
    case 'DOC':
      return `${method}: ${data.bank} - Ag: ${data.agency} - Conta: ${data.account}`
      
    case 'DINHEIRO':
      return `Dinheiro: ${data.meetingLocation}`
      
    case 'CARTAO':
      return `Cartão: ${data.cardBrand}`
      
    default:
      return data.description || 'Método personalizado'
  }
}

/**
 * Obtém ícone do método de pagamento
 */
export function getPaymentMethodIcon(method: PaymentMethod): string {
  return getPaymentMethodInfo(method).icon
}

/**
 * Obtém cor CSS do método de pagamento
 */
export function getPaymentMethodColor(method: PaymentMethod): string {
  return getPaymentMethodInfo(method).color
}

/**
 * Verifica se o método é instantâneo
 */
export function isInstantPaymentMethod(method: PaymentMethod): boolean {
  return getPaymentMethodInfo(method).instantTransfer
}

/**
 * Obtém tempo estimado de processamento
 */
export function getProcessingTime(method: PaymentMethod): string {
  return getPaymentMethodInfo(method).processingTime
}

/**
 * Gera dados mock para teste de um método de pagamento
 */
export function generateMockPaymentData(method: PaymentMethod): Record<string, any> {
  switch (method) {
    case 'PIX':
      return {
        pixKey: 'usuario@email.com',
        keyType: 'email'
      }
      
    case 'TED':
    case 'DOC':
      return {
        bank: '341 - Itaú',
        agency: '1234',
        account: '56789-0',
        accountType: 'conta_corrente',
        holderName: 'João Silva',
        holderDocument: '123.456.789-00'
      }
      
    case 'DINHEIRO':
      return {
        meetingLocation: 'Shopping Center - Praça de Alimentação',
        meetingTime: '14:00',
        meetingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      
    case 'CARTAO':
      return {
        cardBrand: 'Visa',
        processingMethod: 'presencial',
        fees: '3.5%'
      }
      
    default:
      return {
        description: 'Método de pagamento personalizado',
        instructions: 'Entrar em contato para combinar detalhes'
      }
  }
}

/**
 * Obtém lista de bancos brasileiros para formulários
 */
export function getBrazilianBanks(): Array<{ code: string; name: string }> {
  return [
    { code: '001', name: 'Banco do Brasil' },
    { code: '341', name: 'Itaú' },
    { code: '237', name: 'Bradesco' },
    { code: '104', name: 'Caixa Econômica Federal' },
    { code: '033', name: 'Santander' },
    { code: '260', name: 'Nu Pagamentos (Nubank)' },
    { code: '323', name: 'Mercado Pago' },
    { code: '290', name: 'PagSeguro' },
    { code: '077', name: 'Banco Inter' },
    { code: '212', name: 'Banco Original' },
    { code: '336', name: 'Banco C6' },
    { code: '364', name: 'Gerencianet' },
    { code: '380', name: 'PicPay' }
  ]
}

/**
 * Obtém tipos de conta bancária
 */
export function getAccountTypes(): Array<{ value: string; label: string }> {
  return [
    { value: 'conta_corrente', label: 'Conta Corrente' },
    { value: 'conta_poupanca', label: 'Conta Poupança' },
    { value: 'conta_pagamento', label: 'Conta de Pagamento' }
  ]
}