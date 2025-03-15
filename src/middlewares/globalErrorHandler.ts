import { HttpError } from "http-errors";
import logger from "../config/logger";
import config from "../config/config";
import { NextFunction, Request, Response } from "express";
import path from "path";

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;
  logger.error(err.message);

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        statusCode,
        path: req.path,
        location: path.join(__dirname, "..", req.path),
        stack: config.NODE_ENV === "production" ? "🥞" : err.stack,
        method: req.method,
      },
    ],
  });
};

export default globalErrorHandler;
