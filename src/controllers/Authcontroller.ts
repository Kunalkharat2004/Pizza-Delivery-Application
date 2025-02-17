import { NextFunction, Response } from "express";
import { AuthRequest, RegisterRequest } from "../types";
import { UserService } from "../services/User";
import { Logger } from "winston";
import { Roles } from "../constants";
import bcrypt from "bcrypt";
import { JwtPayload } from "jsonwebtoken";
import { RefreshToken } from "../entity/RefreshToken";
import TokenService from "../services/TokenService";
import { Repository } from "typeorm";
import createHttpError from "http-errors";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private refreshTokenRepository: Repository<RefreshToken>
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

      const accessToken = this.tokenService.generateAccessToken(payload);

      const refreshToken = await this.tokenService.generateRefreshToken(payload, user, this.refreshTokenRepository);

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
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
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

  async login(req: RegisterRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Check if the user exists in the database
      const user = await this.userService.checkUserByEmail(email);

      // Compare the password
      const isPasswordValid = await this.userService.isPasswordMatched(password, user);

      if (!isPasswordValid) {
        const error = createHttpError(401, "Invalid email or password");
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const refreshToken = await this.tokenService.generateRefreshToken(payload, user, this.refreshTokenRepository);

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
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      res.status(200).json({
        message: "Login successful",
        id: user.id,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    const data = await this.userService.getUserById(req.auth.sub);

    res.status(200).json({ ...data, password: "********" });
  }
}
