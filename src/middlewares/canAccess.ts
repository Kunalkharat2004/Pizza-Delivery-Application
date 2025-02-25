import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import createHttpError from "http-errors";

const canAccess = (roles: Array<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as AuthRequest;
    const roleOfUser = _req.auth.role;

    if (!roles.includes(roleOfUser)) {
      const error = createHttpError(403, "You are not authorized to access this resource");
      next(error);
      return;
    }
    next();
  };
};

export default canAccess;
