import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { ENV } from '@/config';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Determine the logging level based on the environment
const level = () => ENV?.NODE_ENV === 'development' ? 'debug' : 'warn';


// Add custom colors to the logging levels
winston.addColors(colors);

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
    winston.format.printf((info) => {
        if (info.level === 'error' && info.stack) {
            // For error logs, include the stack trace
            return `${info.timestamp} ${info.level}: ${info.message}\n${info.stack}`;
        }
        return `${info.timestamp} ${info.level}: ${info.message}`;
    }),
    winston.format.splat(), // Enable string interpolation and multiple arguments
);

const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            logFormat,
        ),
    }),

    new DailyRotateFile({
        filename: 'logs/%DATE%-error.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        maxFiles: '14d', // Retain logs for 14 days
    }),

    new DailyRotateFile({
        filename: 'logs/%DATE%-all.log',
        datePattern: 'YYYY-MM-DD',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        maxFiles: '14d',
    }),
];

const Logger = winston.createLogger({
    level: level(), // Dynamic logging level
    levels,
    format: logFormat, // Custom log format
    transports,
});

// Enhanced Logger class to handle multiple arguments
class EnhancedLogger {
    private logger = Logger;

    error(...args: any[]) {
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        this.logger.error(message);
    }

    warn(...args: any[]) {
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        this.logger.warn(message);
    }

    info(...args: any[]) {
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        this.logger.info(message);
    }

    http(...args: any[]) {
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        this.logger.http(message);
    }

    debug(...args: any[]) {
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        this.logger.debug(message);
    }
}

const LoggerInstance = new EnhancedLogger();

export { LoggerInstance as Logger };