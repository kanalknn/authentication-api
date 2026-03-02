const express = require('express');
const router = express.Router();
const noteController = require('../../controllers/admin/note.controller');
const adminAuth = require('../../middleware/adminAuth');

router.post('/', adminAuth(['admin']), noteController.createNote);
router.get('/', adminAuth(['admin']), noteController.getAllNotes);
router.get('/:id', adminAuth(['admin']), noteController.getNoteById);
router.put('/:id', adminAuth(['admin']), noteController.updateNote);
router.delete('/:id', adminAuth(['admin']), noteController.deleteNote);

module.exports = router;
