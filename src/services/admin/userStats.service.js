
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get total number of users
async function getTotalUsersCount() {
  try {
    const totalUsers = await prisma.user.count({
      where: {
        isActive: true // Only count active users
      }
    });
    
    return {
      success: true,
      totalUsers,
      message: `Total active users: ${totalUsers}`
    };
  } catch (error) {
    console.error('Error getting total users count:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 2. Get all users count (including inactive)
async function getAllUsersCount() {
  try {
    const allUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });
    const inactiveUsers = allUsers - activeUsers;
    
    return {
      success: true,
      allUsers,
      activeUsers,
      inactiveUsers,
      message: `Total: ${allUsers}, Active: ${activeUsers}, Inactive: ${inactiveUsers}`
    };
  } catch (error) {
    console.error('Error getting all users count:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 3. Get detailed users list with subscription information
async function getUsersListWithSubscriptions(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          include: {
            plan: {
              select: {
                name: true,
                displayName: true,
                type: true,
                price: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        subscriptionHistory: {
          select: {
            planName: true,
            planType: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            subscriptions: true,
            downloads: true,
            payments: true
          }
        }
      }
    });

    // Process the data to get current plan and subscription counts
    const processedUsers = users.map(user => {
      // Find current active subscription
      const currentSubscription = user.subscriptions.find(sub => 
        sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
      );

      // Get total subscription count from history
      const totalSubscriptions = user.subscriptionHistory.length;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        
        // Current subscription info
        currentPlan: currentSubscription ? {
          planName: currentSubscription.plan.displayName,
          planType: currentSubscription.plan.type,
          price: currentSubscription.plan.price,
          status: currentSubscription.status,
          endDate: currentSubscription.endDate,
          premiumDownloadsRemaining: currentSubscription.premiumDownloadsTotal - currentSubscription.premiumDownloadsUsed,
          standardDownloadsRemaining: currentSubscription.standardDownloadsTotal - currentSubscription.standardDownloadsUsed
        } : null,
        
        // Subscription statistics
        subscriptionStats: {
          totalSubscriptions,
          activeSubscriptions: user._count.subscriptions,
          totalDownloads: user._count.downloads,
          totalPayments: user._count.payments
        },
        
        // Recent subscription history (last 3)
        recentSubscriptions: user.subscriptionHistory.slice(0, 3).map(sub => ({
          planName: sub.planName,
          planType: sub.planType,
          status: sub.status,
          date: sub.createdAt
        }))
      };
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      success: true,
      data: {
        users: processedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error getting users list with subscriptions:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 4. Get user subscription summary statistics
async function getUserSubscriptionSummary() {
  try {
    // Get users with subscription counts
    const userStats = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            subscriptions: true,
            subscriptionHistory: true,
            downloads: true
          }
        },
        subscriptions: {
          where: { 
            status: 'ACTIVE',
            endDate: { gt: new Date() }
          },
          include: {
            plan: {
              select: {
                displayName: true,
                type: true
              }
            }
          }
        }
      }
    });

    // Categorize users
    const summary = {
      totalUsers: userStats.length,
      usersWithActiveSubscriptions: 0,
      usersWithNoSubscriptions: 0,
      usersWithExpiredSubscriptions: 0,
      subscriptionTypeCounts: {
        FREE: 0,
        PLUS: 0,
        PRO: 0,
        ELITE: 0,
        LITE1: 0,
        LITE2: 0
      },
      usersBySubscriptionCount: {
        noSubscriptions: 0,
        oneSubscription: 0,
        multipleSubscriptions: 0
      }
    };

    userStats.forEach(user => {
      const totalSubHistory = user._count.subscriptionHistory;
      const activeSubscriptions = user.subscriptions.length;

      // Count by subscription history
      if (totalSubHistory === 0) {
        summary.usersBySubscriptionCount.noSubscriptions++;
        summary.usersWithNoSubscriptions++;
      } else if (totalSubHistory === 1) {
        summary.usersBySubscriptionCount.oneSubscription++;
      } else {
        summary.usersBySubscriptionCount.multipleSubscriptions++;
      }

      // Count active vs expired
      if (activeSubscriptions > 0) {
        summary.usersWithActiveSubscriptions++;
        // Count by subscription type
        user.subscriptions.forEach(sub => {
          summary.subscriptionTypeCounts[sub.plan.type]++;
        });
      } else if (totalSubHistory > 0) {
        summary.usersWithExpiredSubscriptions++;
      }
    });

    return {
      success: true,
      summary
    };
  } catch (error) {
    console.error('Error getting user subscription summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 5. Get specific user's detailed subscription info
async function getUserDetailedInfo(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          orderBy: { createdAt: 'desc' }
        },
        subscriptionHistory: {
          orderBy: { createdAt: 'desc' }
        },
        downloads: {
          include: {
            asset: {
              select: {
                title: true,
                assetCategory: true
              }
            }
          },
          orderBy: { downloadedAt: 'desc' },
          take: 10 // Last 10 downloads
        },
        payments: {
          include: {
            subscriptionPlan: {
              select: {
                displayName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    return {
      success: true,
      user: {
        ...user,
        totalSubscriptions: user.subscriptionHistory.length,
        activeSubscriptions: user.subscriptions.filter(sub => 
          sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
        ).length
      }
    };
  } catch (error) {
    console.error('Error getting user detailed info:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage:
/*
// Get total users count
const totalUsers = await getTotalUsersCount();
console.log(totalUsers);

// Get users list with pagination
const usersList = await getUsersListWithSubscriptions(1, 20);
console.log(usersList);

// Get subscription summary
const summary = await getUserSubscriptionSummary();
console.log(summary);

// Get specific user info
const userInfo = await getUserDetailedInfo('user_id_here');
console.log(userInfo);
*/

module.exports = {
  getTotalUsersCount,
  getAllUsersCount,
  getUsersListWithSubscriptions,
  getUserSubscriptionSummary,
  getUserDetailedInfo
};