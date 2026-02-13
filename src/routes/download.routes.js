const express = require('express');
const {
  checkDownloadEligibility,
  recordDownload,
  getUserDownloads,
  getDashboardStats,
  getDownloadAnalytics
} = require('../controllers/download.controller');

const user = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Downloads
 *   description: APIs related to asset download tracking and stats
 */

/**
 * @swagger
 * /api/download/check-eligibility:
 *   get:
 *     summary: Check if a user is eligible to download
 *     tags: [Downloads]
 *     responses:
 *       200:
 *         description: Eligibility status
 */
router.get('/check-eligibility', checkDownloadEligibility);

/**
 * @swagger
 * /api/download/record:
 *   post:
 *     summary: Record a download event
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetId:
 *                 type: string
 *                 example: "abc123"
 *     responses:
 *       200:
 *         description: Download recorded successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/record', user, recordDownload);

/**
 * @swagger
 * /api/download/user/{userId}:
 *   get:
 *     summary: Get download history for a user
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of downloaded assets
 */
router.get('/user/:userId', user, getUserDownloads);

/**
 * @swagger
 * /api/download/stats:
 *   get:
 *     summary: Get dashboard statistics (admin only)
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Download statistics
 */
router.get('/stats', user, adminAuth(), getDashboardStats);

/**
 * @swagger
 * /api/download/analytics:
 *   get:
 *     summary: Get detailed download analytics (admin only)
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', user, adminAuth(), getDownloadAnalytics);

module.exports = router;
