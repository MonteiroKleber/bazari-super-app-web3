# Bazari Super App

Marketplace descentralizado, P2P, Wallet e ecossistema Web3 completo.

## 🚀 Características

- **Web3 & Blockchain**: Carteira integrada com seed phrase segura
- **PWA**: Aplicativo web progressivo instalável
- **Marketplace**: Produtos físicos e digitais
- **P2P Trading**: Troca direta BZR ↔ BRL com escrow
- **DAO**: Governança descentralizada da comunidade  
- **Social**: Feed social da comunidade
- **Work**: Marketplace de trabalhos pagos em BZR
- **Multilíngue**: Português, Inglês e Espanhol
- **Design System**: Identidade visual Libervia/Bazari

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Estilo**: TailwindCSS 3.4.x com design system customizado
- **Estado**: Zustand para gerenciamento por domínio
- **Roteamento**: React Router v6 com lazy loading
- **Animações**: Framer Motion
- **PWA**: Vite PWA Plugin com service worker
- **i18n**: Sistema próprio com JSON
- **Icons**: Lucide React

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Configuração da aplicação
│   ├── i18n/              # Traduções
│   ├── routes/            # Roteamento
│   ├── providers/         # Providers React
│   ├── pwa/               # Configuração PWA
│   └── data/              # Dados estáticos
├── shared/                # Recursos compartilhados
│   ├── ui/                # Design system
│   ├── layout/            # Layout components
│   ├── lib/               # Utilitários
│   └── guards/            # Route guards
├── features/              # Features por domínio
│   ├── auth/              # Autenticação + Seed phrase
│   ├── wallet/            # Carteira BZR/BRL
│   ├── marketplace/       # Marketplace + P2P
│   ├── profile/           # Perfis de usuário
│   ├── chat/              # Sistema de chat
│   ├── dao/               # Governança DAO
│   ├── social/            # Feed social
│   ├── work/              # Marketplace de trabalho
│   └── notifications/     # Sistema de notificações
├── pages/                 # Páginas de entrada
├── entities/              # Modelos de dados
└── services/              # Serviços externos
```

## 🎨 Design System

### Cores Oficiais

- **Bazari Red**: #8B0000 (Primária)
- **Bazari Gold**: #FFB300 (Destaque)  
- **Matte Black**: #1C1C1C (Fundo escuro)
- **Sand**: #F5F1E0 (Fundo claro)

### Componentes

Todos os componentes UI estão em `@shared/ui/`:
- Button, Card, Input, Select, Badge, Avatar
- Modal, Tabs, LoadingSpinner, EmptyState
- LanguageSelector, NotificationBell, etc.

## ⚡ Instalação e Execução

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd bazari-super-app

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### PWA

O projeto já vem configurado como PWA. Para testar:

1. `npm run build`
2. `npm run preview`
3. Acesse `http://localhost:4173`
4. Use DevTools > Application > Manifest para verificar
5. No celular, adicione à tela inicial

## 🌍 Internacionalização

O app suporta 3 idiomas:

- 🇧🇷 Português (padrão)
- 🇺🇸 English  
- 🇪🇸 Español

As traduções estão em `src/app/i18n/translations.json`.

Para adicionar novas traduções:

```tsx
// Use o hook useI18n
const { t } = useI18n()

// Acesse as traduções
t('marketplace.title') // "Marketplace"
```

## 🏗️ Arquitetura

### Gerenciamento de Estado

Cada feature tem seu próprio store Zustand:

```typescript
// features/auth/store/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // state and actions
    }),
    { name: 'bazari-auth' }
  )
)
```

### Roteamento

- **Públicas**: `/`, `/login`, `/help`, `/about`
- **Privadas**: `/dashboard`, `/wallet/*`, `/marketplace/*`, etc.
- **Guards**: AuthGuard protege rotas privadas

### PWA

- **Manifest**: Configurado para standalone app
- **Service Worker**: Cache de assets e páginas
- **Offline**: Fallback básico para conectividade
- **Install**: Prompt de instalação automático

## 📱 Features Principais

### 🔐 Autenticação

- Criação de conta com seed phrase (12 palavras)
- Importação via seed phrase ou arquivo JSON
- Recuperação de conta
- Modo visitante (funcionalidade limitada)

### 💰 Wallet

- Saldos BZR e BRL
- Envio e recebimento
- Histórico de transações
- QR codes para pagamentos

### 🛒 Marketplace

- Produtos físicos e digitais
- Categorias hierárquicas
- Sistema de avaliações
- Chat integrado com vendedores

### 🔄 P2P Trading

- Anúncios de compra/venda BZR ↔ BRL
- Sistema de escrow automático
- Chat por negociação
- Múltiplos métodos de pagamento

### 🏛️ DAO

- Propostas da comunidade
- Sistema de votação
- Quórum e aprovação
- Tesouro descentralizado

### 👥 Social

- Feed da comunidade
- Posts com likes/comentários
- Perfis públicos
- Sistema de reputação

### 💼 Work

- Vagas pagas em BZR
- Freelances e CLT
- Sistema de candidaturas
- Avaliações de projetos

## 🔧 Desenvolvimento

### Aliases TypeScript

```typescript
// Configurados no vite.config.ts e tsconfig.json
import { Button } from '@shared/ui/Button'
import { useAuthStore } from '@features/auth/store/authStore'
import { translations } from '@app/i18n/translations.json'
```

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção  
npm run preview      # Preview da build
npm run lint         # ESLint
npm run type-check   # Verificação TypeScript
```

### Estrutura de Commit

```
feat: adiciona sistema de escrow P2P
fix: corrige layout mobile no dashboard  
style: atualiza cores do design system
docs: adiciona documentação da API
```

## 🔒 Segurança

- **Seed Phrases**: Armazenadas localmente com crypto.subtle
- **Escrow**: Sistema automatizado para P2P
- **Autenticação**: Guards em todas as rotas privadas
- **Validação**: Input validation em todos os formulários

## 🚀 Deploy

### Variáveis de Ambiente

```bash
# .env.production
VITE_APP_NAME=Bazari
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.bazari.com
```

### Build Otimizada

- Code splitting por rota
- Lazy loading de componentes
- Tree shaking automático
- PWA com cache inteligente

## 📄 Licença

[Definir licença]

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📞 Suporte

- **Email**: contact@libervia.xyz

---

**Bazari** - O futuro do comércio descentralizado 🚀
