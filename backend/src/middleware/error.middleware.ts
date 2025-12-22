import type { NextFunction, Request, Response } from "express";
import appConfig from "../config/env";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error caught by middleware:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            details: err.message
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'Invalid ID format'
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            message: 'Duplicate entry',
            field: Object.keys(err.keyValue)[0]
        });
    }

    // Cloudinary errors
    if (err.name === 'Error' && err.message.includes('cloudinary')) {
        return res.status(500).json({
            message: 'Image upload failed'
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = appConfig.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        message,
        ...(appConfig.NODE_ENV !== 'production' && { stack: err.stack })
    });
}