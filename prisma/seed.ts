import { PrismaClient, PlanType, BillingCycle } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Plans
  const plans = await Promise.all([
    // Free Plan
    prisma.plan.upsert({
      where: { type: PlanType.FREE },
      update: {},
      create: {
        name: 'Grátis',
        type: PlanType.FREE,
        billingCycle: BillingCycle.MONTHLY,
        price: 0,
        currency: 'BRL',
        maxScreens: 1,
        offlineViewing: false,
        gameVaultAccess: false,
        adFree: false,
        description: 'Acesso básico com anúncios',
        features: [
          'Acesso limitado ao catálogo',
          'Qualidade padrão',
          'Com anúncios',
          '1 tela simultânea'
        ],
        active: true,
        displayOrder: 0,
        popular: false,
      },
    }),

    // Fan Plan (Monthly)
    prisma.plan.upsert({
      where: { type: PlanType.FAN },
      update: {},
      create: {
        name: 'Fan',
        type: PlanType.FAN,
        billingCycle: BillingCycle.MONTHLY,
        price: 14.99,
        currency: 'BRL',
        maxScreens: 1,
        offlineViewing: false,
        gameVaultAccess: false,
        adFree: true,
        description: 'Assista a todo o acervo, sem propagandas',
        features: [
          'Todo o acervo da Pulse',
          'Sem propagandas',
          'Novos episódios logo após o lançamento',
          'Assista em até 1 tela',
          'Qualidade HD'
        ],
        active: true,
        displayOrder: 1,
        popular: false,
      },
    }),

    // Mega Fan Plan (Monthly)
    prisma.plan.upsert({
      where: { type: PlanType.MEGA_FAN },
      update: {},
      create: {
        name: 'Mega Fan',
        type: PlanType.MEGA_FAN,
        billingCycle: BillingCycle.MONTHLY,
        price: 19.99,
        currency: 'BRL',
        maxScreens: 4,
        offlineViewing: true,
        gameVaultAccess: true,
        adFree: true,
        description: 'A experiência completa do streaming',
        features: [
          'Todo o acervo da Pulse',
          'Sem propagandas',
          'Novos episódios logo após o lançamento',
          'Assista em até 4 telas simultâneas',
          'Download para assistir offline',
          'Acesse a Pulse Game Vault',
          'Qualidade 4K Ultra HD'
        ],
        active: true,
        displayOrder: 2,
        popular: true,
      },
    }),

    // Mega Fan Plan (Annual)
    prisma.plan.upsert({
      where: { type: PlanType.MEGA_FAN_ANNUAL },
      update: {},
      create: {
        name: 'Mega Fan Anual',
        type: PlanType.MEGA_FAN_ANNUAL,
        billingCycle: BillingCycle.ANNUALLY,
        price: 199.99,
        currency: 'BRL',
        maxScreens: 4,
        offlineViewing: true,
        gameVaultAccess: true,
        adFree: true,
        description: 'A experiência completa com 16% de desconto',
        features: [
          'Todo o acervo da Pulse',
          'Sem propagandas',
          'Novos episódios logo após o lançamento',
          'Assista em até 4 telas simultâneas',
          'Download para assistir offline',
          'Acesse a Pulse Game Vault',
          'Qualidade 4K Ultra HD',
          '16% de desconto (cobrado anualmente)',
          'Economia de R$ 39,89/ano'
        ],
        active: true,
        displayOrder: 3,
        popular: false,
      },
    }),
  ])

  console.log('✅ Plans created:', plans.length)

  // Hash password for admin user
  const adminPasswordHash = await bcrypt.hash('AdminPulse@2025!', 12)

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pulse.com' },
    update: {},
    create: {
      email: 'admin@pulse.com',
      password: adminPasswordHash,
      name: 'Administrador',
      role: 'ADMIN',
      currentPlan: PlanType.MEGA_FAN,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      maxScreens: 4,
      offlineViewing: true,
      gameVaultAccess: true,
      adFree: true,
      autoRenewal: true,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  // Create a subscription for the admin user
  await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      planId: plans.find(p => p.type === PlanType.MEGA_FAN)!.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      amount: 19.99,
      currency: 'BRL',
      paymentMethod: 'credit_card',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Admin user created:', adminUser.email, '- Password: AdminPulse@2025!')

  // Create test users for each plan
  const testPassword = await bcrypt.hash('TestUser@123!', 12)
  
  // FREE Plan User
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@pulse.com' },
    update: {},
    create: {
      email: 'free@pulse.com',
      password: testPassword,
      name: 'Usuário Grátis',
      role: 'USER',
      currentPlan: PlanType.FREE,
      subscriptionStatus: 'ACTIVE',
      maxScreens: 1,
      offlineViewing: false,
      gameVaultAccess: false,
      adFree: false,
      autoRenewal: true,
    },
  })

  // FAN Plan User
  const fanUser = await prisma.user.upsert({
    where: { email: 'fan@pulse.com' },
    update: {},
    create: {
      email: 'fan@pulse.com',
      password: testPassword,
      name: 'Usuário Fan',
      role: 'PREMIUM',
      currentPlan: PlanType.FAN,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxScreens: 1,
      offlineViewing: false,
      gameVaultAccess: false,
      adFree: true,
      autoRenewal: true,
      lastPaymentDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Create FAN subscription
  await prisma.subscription.create({
    data: {
      userId: fanUser.id,
      planId: plans.find(p => p.type === PlanType.FAN)!.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: 14.99,
      currency: 'BRL',
      paymentMethod: 'pix',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // MEGA FAN Plan User
  const megaFanUser = await prisma.user.upsert({
    where: { email: 'megafan@pulse.com' },
    update: {},
    create: {
      email: 'megafan@pulse.com',
      password: testPassword,
      name: 'Usuário Mega Fan',
      role: 'SUPER_PREMIUM',
      currentPlan: PlanType.MEGA_FAN,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxScreens: 4,
      offlineViewing: true,
      gameVaultAccess: true,
      adFree: true,
      autoRenewal: true,
      lastPaymentDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Create MEGA FAN subscription
  await prisma.subscription.create({
    data: {
      userId: megaFanUser.id,
      planId: plans.find(p => p.type === PlanType.MEGA_FAN)!.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: 19.99,
      currency: 'BRL',
      paymentMethod: 'credit_card',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // MEGA FAN ANNUAL Plan User
  const megaFanAnnualUser = await prisma.user.upsert({
    where: { email: 'megafan-annual@pulse.com' },
    update: {},
    create: {
      email: 'megafan-annual@pulse.com',
      password: testPassword,
      name: 'Usuário Mega Fan Anual',
      role: 'SUPER_PREMIUM',
      currentPlan: PlanType.MEGA_FAN_ANNUAL,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
      maxScreens: 4,
      offlineViewing: true,
      gameVaultAccess: true,
      adFree: true,
      autoRenewal: true,
      lastPaymentDate: new Date(),
      nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  // Create MEGA FAN ANNUAL subscription
  await prisma.subscription.create({
    data: {
      userId: megaFanAnnualUser.id,
      planId: plans.find(p => p.type === PlanType.MEGA_FAN_ANNUAL)!.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      amount: 199.99,
      currency: 'BRL',
      paymentMethod: 'credit_card',
      nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  // Create an EXPIRED user for testing
  const expiredUser = await prisma.user.upsert({
    where: { email: 'expired@pulse.com' },
    update: {},
    create: {
      email: 'expired@pulse.com',
      password: testPassword,
      name: 'Usuário Expirado',
      role: 'USER',
      currentPlan: PlanType.FREE,
      subscriptionStatus: 'EXPIRED',
      subscriptionExpiry: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      maxScreens: 1,
      offlineViewing: false,
      gameVaultAccess: false,
      adFree: false,
      autoRenewal: false,
    },
  })

  // Create an expired subscription
  await prisma.subscription.create({
    data: {
      userId: expiredUser.id,
      planId: plans.find(p => p.type === PlanType.FAN)!.id,
      status: 'EXPIRED',
      startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      amount: 14.99,
      currency: 'BRL',
      paymentMethod: 'boleto',
      cancelledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      cancellationReason: 'Expired due to non-payment',
    },
  })

  // Create a user in GRACE PERIOD
  const gracePeriodUser = await prisma.user.upsert({
    where: { email: 'grace@pulse.com' },
    update: {},
    create: {
      email: 'grace@pulse.com',
      password: testPassword,
      name: 'Usuário Período de Graça',
      role: 'PREMIUM',
      currentPlan: PlanType.FAN,
      subscriptionStatus: 'GRACE_PERIOD',
      subscriptionExpiry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      gracePeriodEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      maxScreens: 1,
      offlineViewing: false,
      gameVaultAccess: false,
      adFree: true,
      autoRenewal: true,
    },
  })

  // Create grace period subscription
  await prisma.subscription.create({
    data: {
      userId: gracePeriodUser.id,
      planId: plans.find(p => p.type === PlanType.FAN)!.id,
      status: 'GRACE_PERIOD',
      startDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      amount: 14.99,
      currency: 'BRL',
      paymentMethod: 'credit_card',
      nextBillingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Test users created:')
  console.log('   🔧 Admin:', adminUser.email, '- Password: AdminPulse@2025!')
  console.log('   🆓 Free:', freeUser.email, '- Password: TestUser@123!')
  console.log('   ⭐ Fan:', fanUser.email, '- Password: TestUser@123!')
  console.log('   🔥 Mega Fan:', megaFanUser.email, '- Password: TestUser@123!')
  console.log('   💎 Mega Fan Annual:', megaFanAnnualUser.email, '- Password: TestUser@123!')
  console.log('   ❌ Expired:', expiredUser.email, '- Password: TestUser@123!')
  console.log('   ⏰ Grace Period:', gracePeriodUser.email, '- Password: TestUser@123!')
  
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })