/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note management for admins
 */

const noteModel = require('../../models/note.model');

/**
 * @swagger
 * /api/admin/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               studentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Bad request
 */
const createNote = async (req, res) => {
    try {
        const { title, content, studentId } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        const note = await noteModel.createNote({
            title,
            content,
            studentId
        });

        res.status(201).json({ success: true, note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @swagger
 * /api/admin/notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all notes
 */
const getAllNotes = async (req, res) => {
    try {
        const notes = await noteModel.getAllNotes();
        res.json({ success: true, notes });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @swagger
 * /api/admin/notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
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
 *         description: Note details
 *       404:
 *         description: Note not found
 */
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await noteModel.getNoteById(id);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }
        res.json({ success: true, note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @swagger
 * /api/admin/notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 */
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const note = await noteModel.updateNote(id, data);
        res.json({ success: true, note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @swagger
 * /api/admin/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
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
 *         description: Note deleted successfully
 */
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        await noteModel.deleteNote(id);
        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
};
