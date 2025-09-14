import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get current date for comparisons
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        plan: {
          select: {
            name: true,
            price: true
          }
        }
      }
    })

    // Fetch payments data
    const [completedPayments, pendingPayments, recentPayments] = await Promise.all([
      // Completed payments this month
      prisma.payment.findMany({
        where: {
          status: 'completed',
          paidAt: {
            gte: currentMonth
          }
        },
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              },
              plan: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),
      
      // Pending payments
      prisma.payment.findMany({
        where: {
          status: 'pending'
        }
      }),
      
      // Recent payments for history
      prisma.payment.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              },
              plan: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    ])

    // Calculate last month payments for growth comparison
    const lastMonthPayments = await prisma.payment.count({
      where: {
        status: 'completed',
        paidAt: {
          gte: lastMonth,
          lt: currentMonth
        }
      }
    })

    // Calculate metrics
    const totalRevenue = completedPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount.toString())
    }, 0)

    const activeSubscriptionsCount = activeSubscriptions.length
    const pendingPaymentsCount = pendingPayments.length

    // Calculate monthly growth
    const currentMonthPayments = completedPayments.length
    const monthlyGrowth = lastMonthPayments > 0 
      ? Math.round(((currentMonthPayments - lastMonthPayments) / lastMonthPayments) * 100)
      : 0

    return NextResponse.json({
      totalRevenue,
      activeSubscriptions: activeSubscriptionsCount,
      pendingPayments: pendingPaymentsCount,
      monthlyGrowth,
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        amount: parseFloat(payment.amount.toString()),
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        userName: payment.subscription.user.name || payment.subscription.user.email,
        planName: payment.subscription.plan.name,
        date: payment.paidAt || payment.createdAt
      })),
      recentSubscriptions: activeSubscriptions.slice(0, 10).map(sub => ({
        id: sub.id,
        planName: sub.plan.name,
        amount: parseFloat(sub.amount.toString()),
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate
      }))
    })
  } catch (error) {
    console.error('Error fetching financial dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}