import { NextFunction, Request, Response } from "express";
import authService from "../services/auth.service";
import serverConfig from "../config/server.config";
import { LoginRequest, LoginResponse, RegisterRequest } from "../types";

export default class AuthController {
  protected async register(
    req: Request<Record<string, never>, LoginResponse, RegisterRequest>,
    res: Response<LoginResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      const { user, token } = await authService.register({
        username,
        email,
        password,
        firstName,
        lastName,
      });
      res.status(201).json({
        message: "Registration successful",
        data: { token, user: authService.sanitizeUser(user) },
      });
    } catch (error) {
      serverConfig.DEBUG(`Error during register: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async login(
    req: Request<Record<string, never>, LoginResponse, LoginRequest>,
    res: Response<LoginResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.status(200).json({
        message: "Login successful",
        data: { token, user: authService.sanitizeUser(user) },
      });
    } catch (error) {
      serverConfig.DEBUG(`Error during login: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async loginWithMagicLink(
    req: Request,
    res: Response<LoginResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = typeof req.query.token === "string" ? req.query.token : undefined;
      if (!token || typeof token !== "string") {
        res.status(400).json({
          message: "Token is required",
          data: {} as LoginResponse["data"],
        });
        return;
      }
      const { user, token: sessionToken } = await authService.loginWithMagicLink(token);
      res.status(200).json({
        message: "Login successful",
        data: { token: sessionToken, user: authService.sanitizeUser(user) },
      });
    } catch (error) {
      serverConfig.DEBUG(`Error during magic link login: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
