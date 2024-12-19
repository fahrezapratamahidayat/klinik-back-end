"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
const error_handler_1 = require("./utils/error-handler");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = ['https://klinik-front-end.vercel.app'];
        if (process.env.NODE_ENV !== 'production') {
            allowedOrigins.push('http://localhost:3000');
        }
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Routes
(0, routes_1.routes)(app);
// Error handling middleware
app.use(error_handler_1.errorHandler);
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.safeLogger.error('Uncaught Exception:', err);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.safeLogger.error('Unhandled Rejection:', err);
});
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        logger_1.safeLogger.info(`Server is running on port ${port}`);
    });
}
logger_1.safeLogger.info(`Node Environment: ${process.env.NODE_ENV}`);
exports.default = app;
