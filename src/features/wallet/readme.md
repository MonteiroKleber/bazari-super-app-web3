# 🪙 Wallet Module - Bazari Super App

Implementação completa do módulo Wallet conforme especificação do projeto, seguindo os padrões arquiteturais estabelecidos.

## 📋 Características Implementadas

### ✅ Multi-conta
- **Tipos suportados**: sr25519 (Substrate)
- **Funcionalidades**:
  - Criar nova conta (mnemonic 12/24 palavras)
  - Importar por seed/mnemonic
  - Importar JSON (formato Polkadot.js)
  - Watch-only (somente endereço)
  - Renomear, remover, exportar JSON
  - Seleção de conta ativa
  - Persistência com Zustand

### ✅ Multi-ativo
- **Tokens**: BZR (nativo) + assets (pallet-assets)
- **NFTs**: Listagem e visualização (mockável)
- **Separação**: Abas distintas para Tokens e NFTs

### ✅ Fluxos Implementados
- **Home**: Visão geral com saldo total e abas
- **Tokens**: Lista, filtros, ordenação, ações
- **NFTs**: Grid responsivo, filtros, modal PDP
- **Enviar**: Seleção de ativo → destinatário → valor → revisão
- **Receber**: QR Code SVG + copiar/compartilhar
- **Histórico**: Lista local + filtros + busca
- **Gerenciamento de Contas**: CRUD completo
- **Adicionar Token**: Populares + custom por Asset ID
- **Adicionar NFT**: Coleções + preview mockável

## 🏗️ Arquitetura

### 📁 Estrutura de Pastas
```
src/features/wallet/
├── types/wallet.types.ts          # Tipos: Account, Token, Nft, Chain, Tx
├── services/
│   ├── substrateService.ts        # Conexão/assinatura Substrate (mock)
│   ├── tokenService.ts            # Saldos/transferência nativo + assets
│   ├── nftService.ts              # Listagem NFTs (mockável)
│   └── qr.ts                      # Gera QR SVG sem libs externas
├── store/
│   ├── accountsStore.ts           # Contas: CRUD, ativa, persist
│   ├── walletStore.ts             # Ativos, saldos, histórico
│   └── preferencesStore.ts        # Preferências: moeda, rede, UI
├── hooks/
│   ├── useActiveAccount.ts        # Conta ativa + helpers
│   ├── useTokens.ts               # Tokens e saldos normalizados
│   └── useNfts.ts                 # NFTs com paginação/filtro
├── components/
│   ├── WalletHome.tsx             # Tela principal com abas
│   ├── AccountSwitcher.tsx        # Alterna conta ativa
│   ├── AccountsManager.tsx        # Gerencia contas
│   ├── TokensTab.tsx              # Lista tokens
│   ├── NftsTab.tsx                # Grid NFTs
│   ├── SendFlow.tsx               # Fluxo de envio (4 passos)
│   ├── Receive.tsx                # Endereço + QR + compartilhar
│   ├── History.tsx                # Histórico com filtros
│   ├── AddToken.tsx               # Adicionar tokens custom
│   └── AddNft.tsx                 # Adicionar coleções NFT
└── index.ts                       # Barrel exports
```

### 🔧 Stores Zustand

#### `accountsStore.ts`
```typescript
// Gerenciamento de contas
{
  accounts: Account[]
  activeAccountId?: string
  
  // Actions
  addFromMnemonic(mnemonic: string, name?: string): Promise<Account>
  importJson(json: any, password: string): Promise<Account>
  addWatchOnly(address: string, name?: string): Account
  remove(accountId: string): void
  rename(accountId: string, name: string): void
  exportJson(accountId: string, password: string): Promise<any>
  setActive(accountId: string): void
}
```

#### `walletStore.ts`
```typescript
// Tokens, NFTs, saldos e histórico
{
  tokens: Token[]
  customTokens: Token[]
  nfts: Nft[]
  customNfts: Nft[]
  balances: Record<accountId, Record<assetKey, string>>
  history: Record<accountId, Tx[]>
  
  // Actions
  loadBalances(accountId: string): Promise<void>
  transferToken(params: TransferParams): Promise<Tx>
  transferNft(params: NftTransferParams): Promise<Tx>
  addCustomToken(token: AddTokenParams): void
  addCustomNft(nft: AddNftParams): void
  appendHistory(accountId: string, tx: Tx): void
}
```

#### `preferencesStore.ts`
```typescript
// Preferências do usuário
{
  fiatCurrency: 'BRL' | 'USD' | 'EUR'
  networkId: string
  locale?: string
  ui: {
    showZeroBalances: boolean
    defaultTab: 'tokens' | 'nfts'
    theme: 'light' | 'dark' | 'auto'
    compactMode: boolean
  }
}
```

## 🛠️ Services

### `substrateService.ts`
- Conexão com rede Substrate (mock)
- Estimativa de taxa e assinatura de transações
- Informações da chain (símbolo, decimals, ss58Prefix)

### `tokenService.ts`
- Agregação de saldos (nativo + assets)
- Normalização de tokens com decimals/símbolos
- Validação e estimativa de transferências

### `nftService.ts`
- Listagem de NFTs por conta/coleção
- Transferência de NFTs
- Metadados mockáveis

### `qr.ts`
- Geração de QR Code SVG sem libs externas
- Suporte a payment URIs
- Customização de tamanho e cores

## 🎣 Hooks Personalizados

### `useActiveAccount()`
```typescript
const {
  activeAccount,      // Conta ativa atual
  accounts,          // Todas as contas
  switchAccount,     // Trocar conta ativa
  formatAddress,     // Formatar endereço
  isWatchOnly        // Verificar se é watch-only
} = useActiveAccount()
```

### `useTokens()`
```typescript
const {
  tokens,            // Tokens com saldos
  nativeToken,       // Token nativo (BZR)
  assetTokens,       // Asset tokens
  totalBalance,      // Saldo total em BZR
  refreshBalances,   // Recarregar saldos
  isLoading         // Estado de carregamento
} = useTokens()
```

### `useNfts()`
```typescript
const {
  nfts,              // NFTs filtrados
  collections,       // Coleções únicas
  isLoading,         // Estado de carregamento
  handleSearch,      // Buscar NFTs
  handleCollectionFilter, // Filtrar por coleção
  refreshNfts        // Recarregar NFTs
} = useNfts()
```

## 🌐 Rotas

```typescript
/wallet                      -> <WalletHome />
/wallet/send                 -> <SendFlow />
/wallet/receive              -> <Receive />
/wallet/history              -> <History />
/wallet/accounts             -> <AccountsManager />
/wallet/add-token            -> <AddToken />
/wallet/add-nft              -> <AddNft />
```

## 🌍 i18n

Todas as traduções estão centralizadas em `translations.json` sob o namespace `wallet.*`:

```json
{
  "pt": {
    "wallet": {
      "title": "Carteira",
      "tabs": { "tokens": "Tokens", "nfts": "NFTs" },
      "actions": {
        "send": "Enviar",
        "receive": "Receber",
        "history": "Histórico"
      }
      // ... mais traduções
    }
  },
  "en": { "wallet": { ... } },
  "es": { "wallet": { ... } }
}
```

Uso:
```typescript
const { t } = useI18n()
const title = t('wallet.title') // "Carteira"
```

## 🎨 Componentes UI Utilizados

Seguindo o padrão do projeto, utiliza **apenas** componentes existentes:
- `Button`, `Input`, `Select`, `Card`, `Tabs`, `Modal`
- `Badge`, `EmptyState`, `LoadingSpinner`, `Drawer`
- `Avatar`, `Textarea` (criado se necessário)

## ⚡ Performance

- **useMemo/useCallback** para listas pesadas
- **Debounce** para buscas/filtragens
- **Virtual scrolling** preparado para listas grandes
- **Lazy loading** de componentes

## 🔒 Segurança

- Seed phrases tratadas com `@polkadot/util-crypto`
- Validação de endereços SS58
- Confirmação obrigatória para remoção de contas
- Avisos sobre irreversibilidade de transações

## 🚀 Integração ao Projeto

### 1. Dependências
Certifique-se de que essas dependências estão instaladas:
```json
{
  "@polkadot/util-crypto": "^12.0.0",
  "@polkadot/keyring": "^12.0.0",
  "@polkadot/util": "^12.0.0"
}
```

### 2. Rotas
O arquivo `src/pages/WalletPage.tsx` já está configurado. Certifique-se de que `AppRoutes.tsx` inclui:
```typescript
<Route path="/wallet/*" element={
  <AuthGuard>
    <WalletPage />
  </AuthGuard>
} />
```

### 3. Translations
Adicione as traduções do `wallet_translations.json` ao arquivo `translations.json` principal do projeto.

### 4. Componentes UI
Se algum componente não existir (`Select`, `Textarea`, `Drawer`), use as implementações fornecidas em `@shared/ui/`.

## 🧪 Testes

### Smoke Tests Básicos
- [ ] Acessar `/wallet` mostra abas Tokens/NFTs e AccountSwitcher
- [ ] Multi-conta: criar/importar/alternar/exportar/remover/watch-only
- [ ] Tokens: ver BZR no topo, filtrar/ordenar, ações funcionam
- [ ] NFTs: grid, filtro, modal PDP, transferir via SendFlow
- [ ] Receive: endereço + QR SVG + copiar
- [ ] History: exibe transações, persiste localmente
- [ ] Todos os textos via `t('wallet...')` funcionam
- [ ] Build TypeScript sem erros

## 📝 Notas Técnicas

### Compatibilidade
- **Reutiliza** sistema de autenticação existente
- **Não quebra** funcionalidades atuais
- **Evolui** para multi-conta mantendo chave pública atual
- **Sem novas bibliotecas** além das especificadas

### Mock vs Real
- Services implementados com mocks funcionais
- Fácil substituição por integrações reais
- Estrutura preparada para blockchain real
- Formato compatível com Polkadot.js

### Futuras Integrações
- Substituir `substrateService` mock por real
- Conectar `tokenService` com chain metadata
- Implementar `nftService` com pallet real
- Adicionar notificações push para transações

---

## 📄 Critérios de Aceite ✅

- [x] Wallet multi-conta funcional e persistida
- [x] Abas "Tokens" e "NFTs" com listas, filtros e ações
- [x] Enviar tokens/NFTs com revisão e assinatura
- [x] Receber com QR Code SVG
- [x] Histórico visível e persistido
- [x] Adicionar Token/NFT persistem e aparecem
- [x] Sem novas libs, sem mudanças no rodapé/layout global
- [x] i18n consolidado em translations.json
- [x] Tailwind 3.4.3, código limpo e tipado
- [x] UX responsiva e acessível

**Implementação completa conforme especificação! 🎉**