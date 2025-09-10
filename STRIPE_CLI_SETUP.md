# 🔔 Configuração do Stripe CLI para Webhooks

## ❗ **PROBLEMA ATUAL**
- ✅ Checkout sessions estão sendo salvas
- ❌ Webhooks não estão chegando
- ❌ Subscriptions e Payments não estão sendo criadas

## 🛠️ **SOLUÇÃO: Configure Stripe CLI**

### 1️⃣ **Instalar Stripe CLI**
```bash
# Windows (se não tiver ainda)
winget install stripe/stripe-cli

# Ou baixar de: https://github.com/stripe/stripe-cli/releases
```

### 2️⃣ **Login no Stripe**
```bash
stripe login
```

### 3️⃣ **Configurar Webhook Local**
```bash
# Este comando vai ficar rodando em paralelo ao seu dev server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

**IMPORTANTE:** Deixe esse comando rodando em um terminal separado!

### 4️⃣ **Copiar Webhook Secret**
Quando rodar o comando acima, ele vai mostrar algo como:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

### 5️⃣ **Atualizar .env**
```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef... # ⚠️ Use o novo valor!
```

## 🧪 **Testar Fluxo Completo**

### Cenário de Teste:
1. ✅ Stripe CLI rodando (`stripe listen --forward-to localhost:3000/api/payments/webhook`)
2. ✅ Dev server rodando (`npm run dev`)
3. ✅ Acessar `/payments/checkout-demo`
4. ✅ Fazer pagamento de teste
5. ✅ Verificar logs no terminal do webhook
6. ✅ Verificar banco: `checkout_sessions`, `subscriptions`, `payments`

## 🔍 **Verificar Logs**

No terminal do Next.js, você deve ver:
```
🔔 Webhook received!
✅ Webhook signature verified
🎯 Processing event: checkout.session.completed
💳 Processing checkout completion...
✅ Checkout processed
```

## 🎯 **Resultados Esperados**

Após um checkout bem-sucedido:

### Tabela `checkout_sessions`:
```sql
-- Deve ter status 'complete' e paymentStatus 'paid'
SELECT * FROM checkout_sessions ORDER BY created_at DESC LIMIT 1;
```

### Tabela `subscriptions`:
```sql
-- Deve ter uma nova subscription ACTIVE
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
```

### Tabela `payments`:
```sql
-- Deve ter um payment 'completed'
SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;
```

## ⚠️ **Troubleshooting**

### Se não vir logs de webhook:
1. Stripe CLI não está rodando
2. URL do webhook está errada
3. Firewall bloqueando

### Se vir erro de signature:
1. Webhook secret está errado no .env
2. Stripe CLI não está autenticado

### Se webhook processar mas não salvar:
1. Erro no PaymentManager (ver logs)
2. Problema na migração do banco
3. Usuário não encontrado

## 🚀 **Próximos Passos**

1. **Configure Stripe CLI**
2. **Faça um pagamento teste**
3. **Verifique os logs**
4. **Confirme dados no banco**

**Seu sistema está quase 100% funcional!** 🎯