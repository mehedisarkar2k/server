import { Request, Response, NextFunction } from 'express';
import { Logger, SendResponse } from '@/core';

// Type for async route handlers
type AsyncRouteHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

// Type for sync route handlers
type SyncRouteHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => any;

// Union type for both async and sync handlers
type RouteHandler = AsyncRouteHandler | SyncRouteHandler;

/**
 * SIMPLE VERSION: For ASYNC functions only (functions that use await/Promise)
 * 
 * Use this when your route handler is async (has 'async' keyword or returns a Promise).
 * It automatically catches any errors and sends them to the error handler.
 * 
 * @param handler - An async function that handles the route
 * @returns A wrapped function that catches promise errors
 * 
 * @example
 * ```typescript
 * // ✅ Good - Use asyncHandler for async functions
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await database.getUsers(); // This might throw an error
 *   res.json(users);
 * }));
 * 
 * // ❌ Without asyncHandler, you'd need try-catch:
 * app.get('/users', async (req, res, next) => {
 *   try {
 *     const users = await database.getUsers();
 *     res.json(users);
 *   } catch (error) {
 *     next(error); // Manual error handling
 *   }
 * });
 * ```
 */
export const asyncHandler = (handler: AsyncRouteHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Execute the handler and catch any promise rejections
        Promise.resolve(handler(req, res, next)).catch((error) => {
            Logger.error(`Error in route handler: ${error.message}`, {
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });

            // Pass the error to the global error handler
            next(error);
        });
    };
};

/**
 * FLEXIBLE VERSION: For BOTH sync and async functions
 * 
 * Use this when you want one wrapper that works with any type of route handler.
 * It detects if the function returns a Promise and handles errors accordingly.
 * 
 * @param handler - Any function (sync or async) that handles the route
 * @returns A wrapped function that catches all types of errors
 * 
 * @example
 * ```typescript
 * // ✅ Works with async functions
 * app.get('/users', routeHandler(async (req, res) => {
 *   const users = await database.getUsers();
 *   res.json(users);
 * }));
 * 
 * // ✅ Also works with regular (sync) functions
 * app.get('/status', routeHandler((req, res) => {
 *   const status = calculateStatus(); // Regular function, no await
 *   res.json({ status });
 * }));
 * 
 * // 💡 Most people prefer asyncHandler because it's more explicit
 * ```
 */
export const routeHandler = (handler: RouteHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Execute the handler
            const result = handler(req, res, next);

            // If the result is a promise, catch any rejections
            if (result && typeof result.catch === 'function') {
                result.catch((error: Error) => {
                    Logger.error(`Error in async route handler: ${error.message}`, {
                        error: error.message,
                        stack: error.stack,
                        url: req.url,
                        method: req.method,
                        ip: req.ip,
                        userAgent: req.get('User-Agent'),
                    });

                    // Pass the error to the global error handler
                    next(error);
                });
            }
        } catch (error) {
            Logger.error(`Error in sync route handler: ${(error as Error).message}`, {
                error: (error as Error).message,
                stack: (error as Error).stack,
                url: req.url,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            });

            // Pass the error to the global error handler
            next(error);
        }
    };
};

/**
 * Legacy alias for asyncHandler for backward compatibility
 * @deprecated Use asyncHandler instead
 */
export const catchAsync = asyncHandler;

/**
 * Middleware to handle 404 errors for routes that don't exist.
 * This should be placed AFTER all your route definitions but BEFORE the global error handler.
 * 
 * @example
 * ```typescript
 * import { notFoundHandler } from '@/middlewares';
 * 
 * // All your routes first
 * app.get('/users', asyncHandler(async (req, res) => { ... }));
 * app.post('/auth/login', asyncHandler(async (req, res) => { ... }));
 * 
 * // Then the not found handler
 * app.use(notFoundHandler);
 * 
 * // Finally the global error handler
 * app.use(globalErrorHandler);
 * ```
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    Logger.warn(`Route not found: ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });

    return SendResponse.notFound({
        res,
        message: `Route ${req.method} ${req.url} not found`,
    });
};
