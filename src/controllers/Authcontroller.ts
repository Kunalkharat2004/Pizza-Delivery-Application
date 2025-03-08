import { NextFunction, Response } from "express";
import { AuthRequest, RegisterRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { Roles } from "../constants";
import { JwtPayload } from "jsonwebtoken";
import { RefreshToken } from "../entity/RefreshToken";
import TokenService from "../services/TokenService";
import { Repository } from "typeorm";
import createHttpError from "http-errors";

export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  setCookies(res: Response, accessToken: string, refreshToken: string) {
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
  }

  async register(req: RegisterRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password, address } = req.body;

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
        password,
        address,
        role: Roles.CUSTOMER,
      });

      this.logger.info(`User created successfully with id: ${user.id}`);

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const refreshTokenRefrence = await this.tokenService.persistRefreshToken(user, this.refreshTokenRepository);

      const refreshToken = this.tokenService.generateRefreshToken(payload, refreshTokenRefrence);

      this.setCookies(res, accessToken, refreshToken);

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
        sub: user.id,
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const refreshTokenRefrence = await this.tokenService.persistRefreshToken(user, this.refreshTokenRepository);

      const refreshToken = this.tokenService.generateRefreshToken(payload, refreshTokenRefrence);

      this.setCookies(res, accessToken, refreshToken);

      this.logger.info(`User logged in successfully`, { id: user.id });
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

    res.json({ ...data, password: "********" });
  }

  async refresh(req: AuthRequest, res: Response) {
    const payload: JwtPayload = {
      sub: req.auth.sub,
      role: req.auth.role,
    };

    // Generate a new AccessToken
    const accessToken = this.tokenService.generateAccessToken(payload);
    this.logger.info("Created new access token");

    // Persist the new RefreshToken in database

    const user = await this.userService.getUserById(req.auth.sub);

    // Delete the old RefreshToken
    await this.tokenService.deleteRefreshToken(this.refreshTokenRepository, req.auth.jti);
    this.logger.info("Deleted old refresh token");

    const refreshTokenRefrence = await this.tokenService.persistRefreshToken(user, this.refreshTokenRepository);

    // Generate a new RefreshToken
    const refreshToken = this.tokenService.generateRefreshToken(payload, refreshTokenRefrence);
    this.logger.info("Created new refresh token");

    // Set the cookies
    this.setCookies(res, accessToken, refreshToken);
    this.logger.info("Successfully set the cookies");

    res.status(200).json({
      message: "Token refreshed successfully",
      id: req.auth.jti,
    });
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Delete the refreshToken from the database
      await this.tokenService.deleteRefreshToken(this.refreshTokenRepository, req.auth.jti);
      this.logger.info("Deleted refresh token", { id: req.auth.jti });
      this.logger.info("User logged out successfully!", { id: req.auth.sub });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({});
    } catch (err) {
      next(err);
      return;
    }
  }
}
