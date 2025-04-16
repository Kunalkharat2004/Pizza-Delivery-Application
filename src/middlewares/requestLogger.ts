import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startHrTime = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startHrTime);
    const responseTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2); // in ms
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
    });
  });

  next();
};
