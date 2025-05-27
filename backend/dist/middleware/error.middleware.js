"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
// Custom error class for API errors
class ApiError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = 'ApiError';
    }
    static badRequest(message, errors) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }
    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }
    static internal(message = 'Internal server error') {
        return new ApiError(500, message);
    }
}
exports.ApiError = ApiError;
// Global error handling middleware
const errorHandler = (err, req, res, _next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    // Handle ApiError instances
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(Object.assign({ success: false, message: err.message }, (err.errors && { errors: err.errors })));
    }
    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            success: false,
            message: 'Database operation failed',
            error: err.message
        });
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }
    // Default to 500 internal server error
    return res.status(500).json(Object.assign({ success: false, message: 'Internal server error' }, (process.env.NODE_ENV === 'development' && { error: err.message })));
};
exports.errorHandler = errorHandler;
