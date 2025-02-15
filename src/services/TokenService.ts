import { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import config from "../config/config";
import { Repository } from "typeorm";

export default class TokenService {
  generateAccessToken(payload: JwtPayload) {
    const privateKey: Buffer = fs.readFileSync(path.join(__dirname, "../../certs/private.pem"));

    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });

    return accessToken;
  }

  async generateRefreshToken(payload: JwtPayload, user: User, refreshTokenRepository: Repository<RefreshToken>) {
    const Time_In_Ms = 1000 * 60 * 60 * 24 * 365; // 1 year
    const refreshTokenRefrence = await refreshTokenRepository.save({
      user: user,
      expiryAt: new Date(Date.now() + Time_In_Ms),
    });

    const refreshToken = jwt.sign(payload, String(config.REFRESH_TOKEN_SECRET), {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(refreshTokenRefrence.id),
    });

    return refreshToken;
  }
}
