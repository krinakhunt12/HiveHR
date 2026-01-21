/**
 * HiveHR Backend Server
 * Express.js server with Supabase integration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import leaveRoutes from './src/routes/leaveRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';

// Import middleware
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'HiveHR Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/companies', companyRoutes);

// API documentation route
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'HiveHR Backend API',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register (Admin only)',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me',
                refresh: 'POST /api/auth/refresh',
                changePassword: 'POST /api/auth/change-password'
            },
            employees: {
                getAll: 'GET /api/employees',
                getById: 'GET /api/employees/:id',
                create: 'POST /api/employees (Admin only)',
                update: 'PUT /api/employees/:id (HR/Admin)',
                delete: 'DELETE /api/employees/:id (Admin only)',
                stats: 'GET /api/employees/:id/stats'
            },
            attendance: {
                checkIn: 'POST /api/attendance/check-in',
                checkOut: 'POST /api/attendance/check-out',
                myAttendance: 'GET /api/attendance/my-attendance',
                today: 'GET /api/attendance/today',
                all: 'GET /api/attendance/all (HR/Admin)',
                employee: 'GET /api/attendance/employee/:userId (HR/Admin)',
                manual: 'POST /api/attendance/manual (HR/Admin)',
                stats: 'GET /api/attendance/stats (HR/Admin)'
            },
            leaves: {
                create: 'POST /api/leaves',
                myLeaves: 'GET /api/leaves/my-leaves',
                balance: 'GET /api/leaves/balance',
                all: 'GET /api/leaves/all (HR/Admin)',
                approve: 'PUT /api/leaves/:id/approve (HR/Admin)',
                reject: 'PUT /api/leaves/:id/reject (HR/Admin)',
                cancel: 'DELETE /api/leaves/:id'
            }
        }
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     🐝 HiveHR Backend Server          ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Status: Running                       ║`);
    console.log(`║  Port: ${PORT}                            ║`);
    console.log(`║  Environment: ${process.env.NODE_ENV || 'development'}              ║`);
    console.log(`║  API Docs: http://localhost:${PORT}/api   ║`);
    console.log('╚════════════════════════════════════════╝');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

export default app;
