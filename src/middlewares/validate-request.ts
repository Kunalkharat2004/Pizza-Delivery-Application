import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(createHttpError(400, result.array()[0].msg as string));
  }
  next();
};

export default validateRequest;
