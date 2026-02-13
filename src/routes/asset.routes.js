const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/fileUpload');

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Asset management and retrieval
 */

/**
 * @swagger
 * /api/asset:
 *   get:
 *     summary: Get all assets
 *     tags: [Assets]
 *     responses:
 *       200:
 *         description: List of assets
 */
router.get('/', assetController.getAssets);

/**
 * @swagger
 * /api/asset/stats:
 *   get:
 *     summary: Get asset statistics
 *     tags: [Assets]
 *     responses:
 *       200:
 *         description: Asset stats retrieved successfully
 */
router.get('/stats', assetController.getAssetStats);

/**
 * @swagger
 * /api/asset/search:
 *   get:
 *     summary: Search assets
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', assetController.searchAssets);

/**
 * @swagger
 * /api/asset/{id}:
 *   get:
 *     summary: Get asset by ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset details
 */
router.get('/:id', assetController.getAssetById);

/**
 * @swagger
 * /api/asset/{id}/download:
 *   get:
 *     summary: Download an asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset download initiated
 */
router.get('/:id/download', auth, assetController.downloadAsset);

/**
 * @swagger
 * /api/asset/create:
 *   post:
 *     summary: Create a new asset
 *     tags: [Assets]
 *     consumes:
 *       - multipart/form-data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               mainFile:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset created successfully
 */
router.post('/create', uploadMiddleware, adminAuth(), assetController.createAsset);

/**
 * @swagger
 * /api/asset/{id}:
 *   put:
 *     summary: Update an asset
 *     tags: [Assets]
 *     consumes:
 *       - multipart/form-data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               mainFile:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset updated successfully
 */
router.put('/:id', uploadMiddleware, adminAuth(), assetController.updateAsset);

/**
 * @swagger
 * /api/asset/{id}:
 *   delete:
 *     summary: Delete an asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 */
router.delete('/:id', uploadMiddleware, adminAuth(), assetController.deleteAsset);


module.exports = router;
