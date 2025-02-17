import { expressjwt, GetVerificationKey } from "express-jwt";
import jwksRsa from "jwks-rsa";
import config from "../config/config";
import { Request } from "express";

export default expressjwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as unknown as GetVerificationKey,

  algorithms: ["RS256"],

  getToken: (req: Request) => {
    type AuthCookie = {
      accessToken: string;
    };

    const { accessToken } = req.cookies as AuthCookie;

    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer" &&
      req.headers.authorization.split(" ")[1] !== undefined
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (accessToken) {
      return accessToken;
    }
  },
});
