const prisma = require('../config/database');

const createNote = async (data) => {
    return await prisma.note.create({
        data
    });
};

const getAllNotes = async () => {
    return await prisma.note.findMany({
        include: { student: true }
    });
};

const getNoteById = async (id) => {
    return await prisma.note.findUnique({
        where: { id },
        include: { student: true }
    });
};

const updateNote = async (id, data) => {
    return await prisma.note.update({
        where: { id },
        data
    });
};

const deleteNote = async (id) => {
    return await prisma.note.delete({
        where: { id }
    });
};

module.exports = {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
};
