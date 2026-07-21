import { NextFunction, Request, Response } from "express";
import { AppError } from "./errors/AppError.js";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let error: AppError = err as AppError;

    if (err.name === "JsonWebToken"){
        error = new AppError('Invalid token', 401, true)
    }
    if (err.name === "TokenExpiredError"){
        error = new AppError('Invalid expired', 401, true)
    }

    const statusCode = error.statusCode || 500;
    const isOperational = error.isOperational || false;

    logError(error, req, statusCode, isOperational);

    const response: any = {
        status: 'error',
        statusCode,
        message: isOperational ? error.message : 'Something went wrong. Please try again later.'
    }

    if (isOperational && error.details){
        response.details = error.details
    }

    if (process.env.NODE_ENV === 'development'){
        response.stack = error.stack;
    }

    res.status(statusCode).json(response);
}

const logError = (
    error: AppError,
    req: Request,
    statusCode: number,
    isOperational: boolean
): void => {
    const errorLog = {
        message: error.message,
        statusCode: statusCode,
        isOperational,
        timestamp: error.timestamp || new Date().toISOString(),
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req?.userId
    }

    if (error.details){
        (errorLog as any).details = error.details
    }

    if (isOperational){
        console.warn('ClientError:', errorLog)
    } else {
        console.error('Server Error:', {
      ...errorLog,
      stack: error.stack,
    });
    }
}