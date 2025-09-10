import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    // List all products and their prices
    const products = await stripe.products.list({
      active: true,
      limit: 10
    })

    const productInfo = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true
        })

        return {
          productId: product.id,
          productName: product.name,
          prices: prices.data.map(price => ({
            priceId: price.id,
            amount: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval || 'one-time',
            type: price.type
          }))
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: productInfo
    })

  } catch (error) {
    console.error('Stripe info error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Stripe info' },
      { status: 500 }
    )
  }
}