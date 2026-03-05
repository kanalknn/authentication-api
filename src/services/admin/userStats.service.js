
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
    });

    // Process the data to return a format compatible with the frontend
    const processedUsers = users.map(user => {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified || false,
        isActive: user.isActive !== undefined ? user.isActive : true,
        createdAt: user.createdAt,

        // Return null/placeholders for missing relations to prevent frontend crashes
        currentPlan: null,
        subscriptionStats: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          totalDownloads: 0,
          totalPayments: 0
        },
        recentSubscriptions: []
      };
    });

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
    console.error('Error getting users list:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 4. Get user subscription summary statistics
async function getUserSubscriptionSummary() {
  try {
    const totalUsers = await prisma.user.count();

    // Simplistic count based on current schema
    const activeUsers = await prisma.user.count({
      where: {
        isVerified: true
      }
    });

    const summary = {
      totalUsers,
      usersWithActiveSubscriptions: 0,
      usersWithNoSubscriptions: totalUsers,
      usersWithExpiredSubscriptions: 0,
      subscriptionTypeCounts: {
        FREE: totalUsers,
        PLUS: 0,
        PRO: 0,
        ELITE: 0,
        LITE1: 0,
        LITE2: 0
      },
      usersBySubscriptionCount: {
        noSubscriptions: totalUsers,
        oneSubscription: 0,
        multipleSubscriptions: 0
      }
    };

    return {
      success: true,
      summary
    };
  } catch (error) {
    console.error('Error getting user summary:', error);
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
      where: { id: userId }
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
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        subscriptions: [],
        subscriptionHistory: [],
        downloads: [],
        payments: []
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