import { Logger } from '@/core';
import { Request, Response, NextFunction } from 'express';
import { Db } from 'mongodb';

export const addLocals = (db?: Db) => {
    /**
     * Middleware to add database connection to res.locals
     * This allows access to the database connection in route handlers
     */
    Logger.info('Adding database connection to res.locals');
    return (req: Request, res: Response, next: NextFunction) => {
        // Add database connection to res.locals
        if (db) {
            res.locals.db = db;
            Logger.info('Database connection added to res.locals');
        } else {
            res.locals.db = null; // or handle as needed
        }

        next();
    };
};