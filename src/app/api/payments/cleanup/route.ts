import { NextRequest, NextResponse } from 'next/server'
import { PaymentManager } from '@/lib/payments/payment-manager'

// Cron job or manual cleanup for abandoned checkouts
export async function POST(request: NextRequest) {
  try {
    // Simple API key protection
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.CLEANUP_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const abandonedCount = await PaymentManager.handleAbandonedCheckouts()

    return NextResponse.json({
      success: true,
      abandonedCheckoutsUpdated: abandonedCount
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup' },
      { status: 500 }
    )
  }
}