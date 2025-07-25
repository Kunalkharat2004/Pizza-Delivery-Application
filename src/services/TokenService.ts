import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import config from "../config/config";
import { Repository } from "typeorm";
import createHttpError from "http-errors";

export default class TokenService {
  generateAccessToken(payload: JwtPayload) {
    // const privateKey: string | undefined = config.PRIVATE_KEY;
    let privateKey: Buffer;
    // console.log("privateKey", privateKey);
    try {
      privateKey = fs.readFileSync(path.join(__dirname, "../../certs/private.pem"));
    } catch (err) {
      const error = createHttpError(500, "Private key is not defined");
      throw error;
    }
    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h", // 1 hour
      issuer: "auth-service",
    });

    return accessToken;
  }

  async persistRefreshToken(user: User, refreshTokenRepository: Repository<RefreshToken>) {
    const Time_In_Ms = 1000 * 60 * 60 * 24 * 365; // 1 year
    const refreshTokenRefrence = await refreshTokenRepository.save({
      user: user,
      expiryAt: new Date(Date.now() + Time_In_Ms),
    });

    return refreshTokenRefrence;
  }

  generateRefreshToken(payload: JwtPayload, refreshTokenRefrence: RefreshToken) {
    const refreshToken = jwt.sign(payload, String(config.REFRESH_TOKEN_SECRET), {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(refreshTokenRefrence.id),
    });

    return refreshToken;
  }

  async deleteRefreshToken(refreshTokenRepository: Repository<RefreshToken>, refreshTokenId: string) {
    return await refreshTokenRepository.delete(refreshTokenId);
  }
}
