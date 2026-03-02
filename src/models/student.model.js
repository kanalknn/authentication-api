const prisma = require('../config/database');

const createStudent = async (data) => {
    return await prisma.student.create({
        data
    });
};

const getAllStudents = async () => {
    return await prisma.student.findMany({
        include: { notes: true }
    });
};

const getStudentById = async (id) => {
    return await prisma.student.findUnique({
        where: { id },
        include: { notes: true }
    });
};

const updateStudent = async (id, data) => {
    return await prisma.student.update({
        where: { id },
        data
    });
};

const deleteStudent = async (id) => {
    return await prisma.student.delete({
        where: { id }
    });
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};
