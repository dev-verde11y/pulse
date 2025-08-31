import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionManager } from '@/lib/subscription-utils'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting subscription check...')
    
    // Check and update expired subscriptions
    const expiredCount = await SubscriptionManager.checkAndUpdateExpiredSubscriptions()
    
    console.log(`✅ Processed ${expiredCount} expired subscriptions`)
    
    return NextResponse.json({ 
      success: true, 
      processed: expiredCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error checking subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to check subscriptions' }, 
      { status: 500 }
    )
  }
}

// This endpoint should be called daily by a cron service
// Example: curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourapp.com/api/cron/check-subscriptions