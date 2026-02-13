
const express = require('express');
const router = express.Router();

const userManagementController = require('../../controllers/admin/userManagement.controller');
const adminAuth = require('../../middleware/adminAuth');


// GET /api/admin/users/count - Get total users count
router.get('/count',adminAuth(), userManagementController.getTotalUsersCount);

// GET /api/admin/users/list - Get users list with subscriptions (paginated)
router.get('/list', adminAuth(), userManagementController.getUsersListWithSubscriptions);

// GET /api/admin/users/subscription-summary - Get subscription statistics summary
router.get('/subscription-summary', adminAuth(), userManagementController.getUserSubscriptionSummary);

// GET /api/admin/users/:userId - Get detailed info for specific user
router.get('/:userId', adminAuth(), userManagementController.getUserDetailedInfo);

module.exports = router;