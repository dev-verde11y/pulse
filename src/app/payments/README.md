# 💳 Sistema de Pagamentos - Pulse

## 📁 Estrutura Organizada

### 🔗 **APIs** (`/api/payments/`)
```
src/app/api/payments/
├── create-checkout/     # Criar sessões Stripe Checkout
├── webhook/             # Processar eventos Stripe  
├── stripe-info/         # Debug - listar products/prices
└── index.ts            # Constantes e tipos
```

### 🎨 **Componentes** (`@/components/payments/`)
```
src/components/payments/
├── stripe-checkout-button.tsx  # Botão de checkout
└── index.ts                   # Exports e tipos
```

### 📱 **Páginas** (`/payments/`)
```
src/app/payments/
├── checkout-demo/       # Página de teste
├── success/            # Pós-pagamento sucesso
├── cancel/             # Pagamento cancelado
└── README.md          # Esta documentação
```

### ⚙️ **Utilitários** (`@/lib/payments/`)
```
src/lib/payments/
└── index.ts            # Tipos e utilities
```

## 🚀 **URLs Atualizadas**

### Antigas → Novas
- ❌ `/api/create-checkout` → ✅ `/api/payments/create-checkout`
- ❌ `/api/webhook` → ✅ `/api/payments/webhook`  
- ❌ `/pricing-example` → ✅ `/payments/checkout-demo`
- ❌ `/success` → ✅ `/payments/success`
- ❌ `/cancel` → ✅ `/payments/cancel`

## 📝 **Como Usar**

### Import Componente
```tsx
import { StripeCheckoutButton } from '@/components/payments'

<StripeCheckoutButton 
  priceId="price_xxx" 
  planName="Fan" 
/>
```

### API Endpoints
```typescript
import { PAYMENT_ROUTES } from '@/app/api/payments'

fetch(PAYMENT_ROUTES.CREATE_CHECKOUT, {...})
```

## ✅ **Benefícios**

1. **Organizado**: Tudo relacionado a pagamentos em um lugar
2. **Modular**: Fácil de expandir e manter  
3. **Tipado**: Types centralizados
4. **Reutilizável**: Componentes e utilities exportados
5. **Escalável**: Estrutura preparada para crescer