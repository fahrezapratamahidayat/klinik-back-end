"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeLogger = void 0;
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});
// Simple logger interface
exports.safeLogger = {
    info: (...args) => {
        try {
            logger.info(args);
        }
        catch {
            console.log(...args);
        }
    },
    error: (...args) => {
        try {
            logger.error(args);
        }
        catch {
            console.error(...args);
        }
    },
    warn: (...args) => {
        try {
            logger.warn(args);
        }
        catch {
            console.warn(...args);
        }
    },
    debug: (...args) => {
        try {
            logger.debug(args);
        }
        catch {
            console.debug(...args);
        }
    }
};
