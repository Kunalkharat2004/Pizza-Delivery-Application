import { HttpError } from "http-errors";
import logger from "../config/logger";
import config from "../config/config";
import { NextFunction, Request, Response } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;
  const errorId = uuidv4();
  const errorMessage = config.NODE_ENV === "production" ? "Internal Server Error" : err.message;

  logger.error(errorMessage, {
    id: errorId,
    type: err.name,
    statusCode,
    path: req.path,
    location: path.join(__dirname, "..", req.path),
    errorStack: config.NODE_ENV === "production" ? "🥞" : err.stack,
    method: req.method,
  });

  res.status(statusCode).json({
    errors: [
      {
        ref: errorId,
        type: err.name,
        msg: errorMessage,
        path: req.path,
        location: path.join(__dirname, "..", req.path),
        method: req.method,
        statusCode,
        errorStack: config.NODE_ENV === "production" ? "🥞" : err.stack,
      },
    ],
  });
};

export default globalErrorHandler;
