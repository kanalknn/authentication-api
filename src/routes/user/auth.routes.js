const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/auth.controller');
const userStatsController = require('../../controllers/admin/userManagement.controller');
const adminAuth = require('../../middleware/adminAuth');

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOTP);
router.post('/google', authController.loginWithGoogle);
router.post('/email', authController.loginWithEmail);
router.post('/logout', authController.logout);
router.post('/resend-otp', authController.resendOTP);

router.get('/count', adminAuth(), userStatsController.getTotalUsersCount);
router.get('/list',adminAuth(), userStatsController.getUsersListWithSubscriptions);
router.get('/subscription-summary', adminAuth(), userStatsController.getUserSubscriptionSummary);
router.get('/:userId', adminAuth(), userStatsController.getUserDetailedInfo);
module.exports = router;