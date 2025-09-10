import { StripeCheckoutButton } from '@/components/payments/stripe-checkout-button'

export default function PricingExample() {
  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-gray-300 text-lg">
            Teste da integração com Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plano Mensal */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Fan</h2>
              <p className="text-gray-300 mb-4">Plano mensal</p>
              <div className="text-3xl font-bold text-white">
                R$ 14,99<span className="text-lg text-gray-300">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="text-gray-300 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Sem anúncios
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                HD Quality
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                2 telas simultâneas
              </li>
            </ul>

            <StripeCheckoutButton
              priceId="price_1S5nLD91l9itSVBOCQpvSL1R"
              planName="Fan"
              mode="subscription"
              className="w-full"
            />
          </div>

          {/* Plano Anual */}
          <div className="bg-gray-800 rounded-lg p-8 border border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Mais Popular
              </span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Mega Fan</h2>
              <p className="text-gray-300 mb-4">Plano anual</p>
              <div className="text-3xl font-bold text-white">
                R$ 199,99<span className="text-lg text-gray-300">/ano</span>
              </div>
              <p className="text-green-400 text-sm mt-1">Economize 16%</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="text-gray-300 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Tudo do Fan
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                4K Ultra HD
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                4 telas simultâneas
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Game Vault Access
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Visualização offline
              </li>
            </ul>

            <StripeCheckoutButton
              priceId="price_1S5nOM91l9itSVBOqsJ2vJQU"
              planName="Mega Fan"
              mode="subscription"
              className="w-full bg-blue-600 hover:bg-blue-700"
            />
          </div>
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-400/20 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Configuração Necessária</h3>
            <p className="text-gray-300 text-sm mb-2">
              Para testar, você precisa substituir os price IDs pelos corretos do seu Stripe Dashboard.
            </p>
            <p className="text-gray-400 text-xs">
              ✅ Nova estrutura organizada:<br/>
              • APIs: <code className="bg-gray-800 px-1 rounded text-xs">/api/payments/*</code><br/>
              • Componentes: <code className="bg-gray-800 px-1 rounded text-xs">@/components/payments</code><br/>
              • Páginas: <code className="bg-gray-800 px-1 rounded text-xs">/payments/*</code>
            </p>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-400/20 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-blue-400 font-semibold mb-2">ℹ️ Teste Sem Login</h3>
            <p className="text-gray-300 text-sm">
              O checkout agora funciona sem login (usa email teste). Para produção, remova essa funcionalidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}