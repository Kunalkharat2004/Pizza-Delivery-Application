import { expressjwt } from "express-jwt";
import config from "../config/config";
import { Request } from "express";
import { AuthCookie, IRefreshtoken } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";

export const validate_And_Check_IsRevoked_RefreshToken = expressjwt({
  secret: config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken: (req: Request) => {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
  async isRevoked(req: Request, token) {
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const refreshToken = await refreshTokenRepo.findOne({
        where: {
          id: (token?.payload as IRefreshtoken).jti,
          user: { id: String(token?.payload.sub) },
        },
      });

      return refreshToken === null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      logger.error("Error while getting refresh token", {
        id: (token?.payload as IRefreshtoken).jti,
      });
    }
    return true;
  },
});

export const validateRefreshToken = expressjwt({
  secret: config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken: (req: Request) => {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
});
