/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
import { NextFunction, Response } from "express";
import { RegisterRequest } from "../types";
import { UserService } from "../services";
import { Logger } from "winston";
import { Roles } from "../constants";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "path";
import createHttpError from "http-errors";
import config from "../config/config";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async register(req: RegisterRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password, address } = req.body;

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    this.logger.debug(`Userdata:}`, {
      firstName,
      lastName,
      email,
      password: "********",
      address: "********",
    });

    try {
      const user = await this.userService.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        address,
        role: Roles.CUSTOMER,
      });

      this.logger.info(`User created successfully with id: ${user.id}`);

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      let privateKey: Buffer;

      try {
        privateKey = fs.readFileSync(path.join(__dirname, "../../certs/private.pem"));
      } catch (err) {
        const error = createHttpError(500, "Error while reading private key");
        return next(error);
      }

      const accessToken = jwt.sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "auth-service",
      });

      // console.log("Access token: ",accessToken);

      const refreshToken = jwt.sign(payload, String(config.REFRESH_TOKEN_SECRET), {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hour
      });
      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hour
      });

      res.status(201).json({
        message: "User created successfully",
        id: user.id,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}
