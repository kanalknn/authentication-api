const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const adminAuth = require('../middleware/adminAuth');
const { categoryUploadMiddleware } = require('../middleware/fileUpload');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 */

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /api/category/stats:
 *   get:
 *     summary: Get category statistics
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category stats
 */
router.get('/stats', categoryController.getCategoryStats);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: A single category
 *       404:
 *         description: Category not found
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @swagger
 * /api/category/create:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Invalid input
 */
router.post('/create', categoryUploadMiddleware, adminAuth(), categoryController.createCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Category not found
 */
router.put('/:id', categoryUploadMiddleware, adminAuth(), categoryController.updateCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */
router.delete('/:id', adminAuth(), categoryController.deleteCategory);

module.exports = router;
