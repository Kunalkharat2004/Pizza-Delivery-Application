import { HttpError } from "http-errors";
import logger from "../config/logger";
import config from "../config/config";
import { NextFunction, Request, Response } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;

  logger.error(err.message);

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        statusCode,
        stack: config.NODE_ENV === "production" ? "🥞" : err.stack,
        method: req.method,
      },
    ],
  });
};

export default globalErrorHandler;
