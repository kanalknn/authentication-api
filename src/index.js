const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const tokenModel = require('./models/token.model');
const setupSwagger = require('./config/swagger');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

const app = express();
//Import jobs
require('./jobs/subscriptionJobs');

app.use(express.json({
    limit: "50mb"
}));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));

setupSwagger(app);
app.use(errorHandler);


// Token cleanup job (runs every hour)
setInterval(async () => {
    try {
        const { count } = await tokenModel.clearExpiredTokens();
        console.log(`Cleaned up ${count} expired tokens`);
    } catch (error) {
        console.error('Token cleanup error:', error.message);
    }
}, 3600000);

// Imported Routes
const adminAuthRoutes = require('./routes/admin/auth.routes');
const adminRoutes = require('./routes/admin/admin.routes');
const studentRoutes = require('./routes/admin/student.routes');
const noteRoutes = require('./routes/admin/note.routes');
const userAuthRoutes = require('./routes/user/auth.routes');





//Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/students', studentRoutes);
app.use('/api/admin/notes', noteRoutes);
app.use('/api/user/auth', userAuthRoutes);






/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 */

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    tokenModel.clearExpiredTokens()
        .then(({ count }) => console.log(`Cleaned up ${count} expired tokens on startup`))
        .catch(err => console.error('Startup token cleanup error:', err.message));
});
server.keepAliveTimeout = 600000; // 10 minutes
server.headersTimeout = 610000; // 10.1 minutes