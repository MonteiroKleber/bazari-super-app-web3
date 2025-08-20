
import type { PaymentMethod } from '../types/p2p.types'

export interface PaymentMethodInfo {
  id: PaymentMethod
  name: string
  description: string
  icon: string
  fields: PaymentField[]
  tips: string[]
  enabled: boolean
  processingTime: string
  limits?: {
    min: number
    max: number
  }
}

export interface PaymentField {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'select'
  placeholder?: string
  required: boolean
  options?: Array<{ value: string; label: string }>
  validation?: {
    pattern?: string
    message?: string
  }
}

/**
 * Catálogo de métodos de pagamento suportados
 * Configurações baseadas em i18n para labels/dicas
 */
export const paymentMethods: Record<PaymentMethod, PaymentMethodInfo> = {
  PIX: {
    id: 'PIX',
    name: 'PIX',
    description: 'Transferência instantânea 24h',
    icon: '💳',
    processingTime: 'Imediato',
    enabled: true,
    limits: { min: 1, max: 50000 },
    fields: [
      {
        id: 'pixKey',
        label: 'Chave PIX',
        type: 'text',
        placeholder: 'CPF, e-mail, telefone ou chave aleatória',
        required: true,
        validation: {
          pattern: '^.{8,}$',
          message: 'Chave PIX deve ter pelo menos 8 caracteres'
        }
      },
      {
        id: 'pixType',
        label: 'Tipo da chave',
        type: 'select',
        required: true,
        options: [
          { value: 'cpf', label: 'CPF' },
          { value: 'email', label: 'E-mail' },
          { value: 'phone', label: 'Telefone' },
          { value: 'random', label: 'Chave aleatória' }
        ]
      }
    ],
    tips: [
      'Confirme sempre a chave PIX antes de enviar',
      'PIX não tem reversão - verifique os dados',
      'Guarde o comprovante de transferência'
    ]
  },
  
  TED: {
    id: 'TED',
    name: 'TED',
    description: 'Transferência entre bancos',
    icon: '🏦',
    processingTime: '1-2 horas úteis',
    enabled: true,
    limits: { min: 10, max: 100000 },
    fields: [
      {
        id: 'bankCode',
        label: 'Código do banco',
        type: 'text',
        placeholder: '001, 237, 341...',
        required: true,
        validation: {
          pattern: '^\\d{3}$',
          message: 'Código deve ter 3 dígitos'
        }
      },
      {
        id: 'agency',
        label: 'Agência',
        type: 'text',
        placeholder: '1234',
        required: true
      },
      {
        id: 'account',
        label: 'Conta com dígito',
        type: 'text',
        placeholder: '12345-6',
        required: true
      },
      {
        id: 'accountHolder',
        label: 'Titular da conta',
        type: 'text',
        placeholder: 'Nome completo',
        required: true
      },
      {
        id: 'cpf',
        label: 'CPF do titular',
        type: 'text',
        placeholder: '000.000.000-00',
        required: true,
        validation: {
          pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
          message: 'CPF deve estar no formato 000.000.000-00'
        }
      }
    ],
    tips: [
      'TED é processada em horário bancário',
      'Confirme todos os dados bancários',
      'Pode haver taxa do seu banco'
    ]
  },
  
  DINHEIRO: {
    id: 'DINHEIRO',
    name: 'Dinheiro',
    description: 'Encontro presencial',
    icon: '💸',
    processingTime: 'Imediato',
    enabled: true,
    limits: { min: 20, max: 5000 },
    fields: [
      {
        id: 'meetingLocation',
        label: 'Local de encontro',
        type: 'text',
        placeholder: 'Endereço ou ponto de referência',
        required: true
      },
      {
        id: 'contactPhone',
        label: 'Telefone para contato',
        type: 'tel',
        placeholder: '(11) 99999-9999',
        required: true,
        validation: {
          pattern: '^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$',
          message: 'Telefone deve estar no formato (11) 99999-9999'
        }
      }
    ],
    tips: [
      'Encontre-se em local público e seguro',
      'Confirme a autenticidade das notas',
      'Conte o dinheiro antes de liberar o BZR'
    ]
  },
  
  OUTRO: {
    id: 'OUTRO',
    name: 'Outro método',
    description: 'Acordar com a contraparte',
    icon: '🤝',
    processingTime: 'Variável',
    enabled: true,
    limits: { min: 1, max: 1000000 },
    fields: [
      {
        id: 'method',
        label: 'Método de pagamento',
        type: 'text',
        placeholder: 'Descreva o método (ex: PayPal, criptomoedas...)',
        required: true
      },
      {
        id: 'details',
        label: 'Detalhes/instruções',
        type: 'text',
        placeholder: 'Como será feito o pagamento',
        required: true
      },
      {
        id: 'contact',
        label: 'Contato para detalhes',
        type: 'text',
        placeholder: 'E-mail ou telefone',
        required: false
      }
    ],
    tips: [
      'Acordem todos os detalhes antes de iniciar',
      'Use métodos que oferecem comprovantes',
      'Mantenham comunicação clara'
    ]
  }
}

/**
 * Obtém informações de um método de pagamento
 */
export const getPaymentMethodInfo = (method: PaymentMethod): PaymentMethodInfo => {
  return paymentMethods[method]
}

/**
 * Lista todos os métodos de pagamento habilitados
 */
export const getEnabledPaymentMethods = (): PaymentMethodInfo[] => {
  return Object.values(paymentMethods).filter(method => method.enabled)
}

/**
 * Valida dados de um método de pagamento
 */
export const validatePaymentData = (
  method: PaymentMethod, 
  data: Record<string, string>
): { valid: boolean; errors: string[] } => {
  const methodInfo = getPaymentMethodInfo(method)
  const errors: string[] = []
  
  for (const field of methodInfo.fields) {
    const value = data[field.id]
    
    if (field.required && (!value || value.trim() === '')) {
      errors.push(`${field.label} é obrigatório`)
      continue
    }
    
    if (value && field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern)
      if (!regex.test(value)) {
        errors.push(field.validation.message || `${field.label} inválido`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}