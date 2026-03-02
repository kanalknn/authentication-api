/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management for admins
 */

const studentModel = require('../../models/student.model');

/**
 * @swagger
 * /api/admin/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - rollNumber
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Bad request
 */
const createStudent = async (req, res) => {
    try {
        const { name, email, rollNumber, phoneNumber, address } = req.body;

        if (!name || !email || !rollNumber) {
            return res.status(400).json({ success: false, message: 'Name, email, and roll number are required' });
        }

        const student = await studentModel.createStudent({
            name,
            email,
            rollNumber,
            phoneNumber,
            address
        });

        res.status(201).json({ success: true, student });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all students
 */
const getAllStudents = async (req, res) => {
    try {
        const students = await studentModel.getAllStudents();
        res.json({ success: true, students });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @swagger
 * /api/admin/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
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
 *         description: Student details
 *       404:
 *         description: Student not found
 */
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await studentModel.getStudentById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, student });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @swagger
 * /api/admin/students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated successfully
 */
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const student = await studentModel.updateStudent(id, data);
        res.json({ success: true, student });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @swagger
 * /api/admin/students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
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
 *         description: Student deleted successfully
 */
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await studentModel.deleteStudent(id);
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};
