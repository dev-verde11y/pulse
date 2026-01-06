import { StripeCheckoutButton } from '@/components/payments/stripe-checkout-button'

export default function PricingExample() {
  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha sua Classe RPG
          </h1>
          <p className="text-gray-300 text-lg">
            Teste da integração com Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚔️</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Cavaleiro</h2>
              <p className="text-gray-400 mb-4">Rising Knight • Básico mensal</p>
              <div className="text-3xl font-bold text-white">
                R$ 14,99<span className="text-lg text-gray-300">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Sem anúncios
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                HD Quality
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                1 tela simultânea
              </li>
            </ul>

            <StripeCheckoutButton
              priceId="price_1S5nLD91l9itSVBOCQpvSL1R"
              planName="Cavaleiro"
              mode="subscription"
              className="w-full"
            />
          </div>

          {/* Titã - Divine Power - Popular */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500 relative transform scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                👑 POPULAR
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👑</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Titã</h2>
              <p className="text-gray-400 mb-4">Divine Power • Experiência completa</p>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                R$ 19,99<span className="text-lg text-gray-300">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Tudo do Cavaleiro
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                4K Ultra HD
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                4 telas simultâneas
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Download offline
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Game Vault
              </li>
            </ul>

            <StripeCheckoutButton
              priceId="price_1S5rQZ91l9itSVBOIF3iJBPH"
              planName="Titã"
              mode="subscription"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            />
          </div>

          {/* Titã Anual - Legendary Soul */}
          <div className="bg-gray-800 rounded-lg p-6 border border-green-500/50">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💎</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Titã Anual</h2>
              <p className="text-gray-400 mb-4">Legendary Soul • Melhor valor</p>
              <div className="text-3xl font-bold text-white">
                R$ 199,99<span className="text-lg text-gray-300">/ano</span>
              </div>
              <div className="mt-2">
                <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                  💰 Economize 16%
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Tudo do Titã
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Pagamento anual
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                R$ 16,66/mês
              </li>
              <li className="text-gray-300 flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Suporte prioritário
              </li>
            </ul>

            <StripeCheckoutButton
              priceId="price_1S5nOM91l9itSVBOqsJ2vJQU"
              planName="Titã Anual"
              mode="subscription"
              className="w-full bg-green-600 hover:bg-green-700"
            />
          </div>
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="bg-green-900/20 border border-green-400/20 rounded-lg p-4 max-w-3xl mx-auto">
            <h3 className="text-green-400 font-semibold mb-2">✅ 3 Classes RPG Configuradas</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="font-semibold text-blue-400">⚔️ Cavaleiro</div>
                  <div className="text-xs text-gray-400">price_1S5nLD91l9itSVBOCQpvSL1R</div>
                  <div className="text-xs">R$ 14,99/mês</div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                  <div className="font-semibold text-purple-400">👑 Titã</div>
                  <div className="text-xs text-gray-400">price_1S5rQZ91l9itSVBOIF3iJBPH</div>
                  <div className="text-xs">R$ 19,99/mês</div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded">
                  <div className="font-semibold text-green-400">💎 Titã Anual</div>
                  <div className="text-xs text-gray-400">price_1S5nOM91l9itSVBOqsJ2vJQU</div>
                  <div className="text-xs">R$ 199,99/ano</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-400/20 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-blue-400 font-semibold mb-2">🔔 Webhook Funcionando</h3>
            <p className="text-gray-300 text-sm">
              Stripe CLI configurado e webhook processando eventos. Todos os pagamentos são registrados no banco!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}