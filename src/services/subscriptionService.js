const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utilities/logger');

class SubscriptionService {
  // Check and update expired subscriptions
  async checkExpiredSubscriptions() {
    try {
      const now = new Date();
      
      const expiredSubscriptions = await prisma.subscription.updateMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            lt: now
          }
        },
        data: {
          status: 'EXPIRED'
        }
      });

      logger.info(`Updated ${expiredSubscriptions.count} expired subscriptions`);
      return expiredSubscriptions.count;
    } catch (error) {
      logger.error('Error checking expired subscriptions:', error);
      throw error;
    }
  }

  // Get user's active subscription
  async getUserActiveSubscription(userId) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          endDate: {
            gte: new Date()
          }
        },
        include: {
          plan: true
        }
      });

      return subscription;
    } catch (error) {
      logger.error('Error getting user active subscription:', error);
      throw error;
    }
  }

  // Check if user can access design
  async canUserAccessDesign(userId, designId) {
    try {
      const subscription = await this.getUserActiveSubscription(userId);
      
      if (!subscription) {
        return { canAccess: false, reason: 'No active subscription' };
      }

      if (subscription.creditsRemaining <= 0) {
        return { canAccess: false, reason: 'No credits remaining' };
      }

      const design = await prisma.design.findUnique({
        where: { id: designId },
        select: { category: true, isActive: true }
      });

      if (!design) {
        return { canAccess: false, reason: 'Design not found' };
      }

      if (!design.isActive) {
        return { canAccess: false, reason: 'Design is not available' };
      }

      // Check if subscription allows access to design category
      if (subscription.plan.category === 'STANDARD' && design.category === 'PREMIUM') {
        return { canAccess: false, reason: 'Premium subscription required' };
      }

      return { canAccess: true, subscription };
    } catch (error) {
      logger.error('Error checking user design access:', error);
      throw error;
    }
  }

  // Get subscription analytics
  async getSubscriptionAnalytics(period = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const [
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        newSubscriptions,
        subscriptionsByPlan,
        revenue
      ] = await Promise.all([
        prisma.subscription.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.subscription.count({ where: { status: 'EXPIRED' } }),
        prisma.subscription.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        prisma.subscription.groupBy({
          by: ['planId'],
          _count: { planId: true },
          where: { status: 'ACTIVE' }
        }),
        prisma.subscription.aggregate({
          _sum: { totalAmount: true },
          where: {
            createdAt: { gte: startDate },
            status: { in: ['ACTIVE', 'EXPIRED'] }
          }
        })
      ]);

      // Get plan details for subscription breakdown
      const planIds = subscriptionsByPlan.map(s => s.planId);
      const plans = await prisma.subscriptionPlan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, name: true, displayName: true }
      });

      const subscriptionBreakdown = subscriptionsByPlan.map(sub => {
        const plan = plans.find(p => p.id === sub.planId);
        return {
          ...sub,
          plan
        };
      });

      return {
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        newSubscriptions,
        subscriptionBreakdown,
        totalRevenue: revenue._sum.totalAmount || 0,
        period: `${period} days`
      };
    } catch (error) {
      logger.error('Error getting subscription analytics:', error);
      throw error;
    }
  }
}   
module.exports = SubscriptionService;