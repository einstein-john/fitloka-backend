import { Request } from "express";
import { UserInstance } from "../database/models/User";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MagicLinkLoginRequest {
  token: string;
}

export interface JwtTokenPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export interface LoginLinkTokenPayload extends JwtTokenPayload {
  type: "login_link";
}

export interface LoginResponseData {
  token: string;
  user: Record<string, unknown>;
}

export interface LoginResponse {
  message: string;
  data: LoginResponseData;
}

export interface AuthenticatedUserRequest extends Request {
  user?: UserInstance;
  userId?: number;
  isAdmin?: boolean;
  headers: {
    [key: string]: string | string[] | undefined;
    authorization?: string;
  };
}

export interface AuthLoginResult {
  user: UserInstance;
  token: string;
}

export interface AuthTokenVerificationResult {
  userId: number;
}

export interface AuthLoginLinkVerificationResult {
  userId: number;
  type: string;
}
