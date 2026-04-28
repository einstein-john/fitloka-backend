import jwt from "jsonwebtoken";
import serverConfig from "../config/server.config";
import userService from "./user.service";
import emailService from "./email.service";
import type { UserInstance } from "../database/models/User";
import { NotFoundError, UnauthorizedError, ConflictError } from "../errors";
import {
  AuthLoginResult,
  AuthTokenVerificationResult,
  AuthLoginLinkVerificationResult,
  EmailVerificationTokenPayload,
  JwtTokenPayload,
  LoginLinkTokenPayload,
} from "../types/auth.interface";
import { hashPassword, verifyPassword } from "../utils/password.util";

class AuthService {
  public generateToken(userId: number): string {
    return jwt.sign({ userId }, serverConfig.JWT.SECRET, {
      expiresIn: serverConfig.JWT.EXPIRES_IN,
    });
  }

  public verifyToken(token: string): AuthTokenVerificationResult {
    try {
      const decoded = jwt.verify(token, serverConfig.JWT.SECRET) as JwtTokenPayload;
      return { userId: decoded.userId };
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }

  public generateLoginLinkToken(userId: number): string {
    return jwt.sign({ userId, type: "login_link" }, serverConfig.JWT.SECRET, { expiresIn: "15m" });
  }

  public generateEmailVerificationToken(userId: number): string {
    return jwt.sign({ userId, type: "email_verification" }, serverConfig.JWT.SECRET, {
      expiresIn: "24h",
    });
  }

  public verifyLoginLinkToken(token: string): AuthLoginLinkVerificationResult {
    try {
      const decoded = jwt.verify(token, serverConfig.JWT.SECRET) as LoginLinkTokenPayload;
      if (decoded.type !== "login_link") {
        throw new UnauthorizedError("Invalid token type");
      }
      return { userId: decoded.userId, type: decoded.type };
    } catch {
      throw new UnauthorizedError("Invalid or expired login link");
    }
  }

  public verifyEmailVerificationToken(token: string): AuthLoginLinkVerificationResult {
    try {
      const decoded = jwt.verify(token, serverConfig.JWT.SECRET) as EmailVerificationTokenPayload;
      if (decoded.type !== "email_verification") {
        throw new UnauthorizedError("Invalid token type");
      }
      return { userId: decoded.userId, type: decoded.type };
    } catch {
      throw new UnauthorizedError("Invalid or expired email verification link");
    }
  }

  public async register(input: {
    username: string;
    email: string;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
  }): Promise<AuthLoginResult> {
    const emailTaken = await userService.getUserByEmail(input.email);
    if (emailTaken) throw new ConflictError("Email already registered");
    const usernameTaken = await userService.getUserByUsername(input.username);
    if (usernameTaken) throw new ConflictError("Username already taken");

    const user = await userService.createUser({
      username: input.username,
      email: input.email,
      password: hashPassword(input.password),
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      enabled: false,
      isAdmin: false,
      profilePicture: null,
      lastLogin: null,
    });

    const verificationToken = this.generateEmailVerificationToken(user.id);
    const verificationLink = new URL(serverConfig.EMAIL_CONFIRMATION.REDIRECT_URL);
    verificationLink.searchParams.set("token", verificationToken);
    await emailService.sendEmailConfirmationEmail(user.email, verificationLink.toString());

    const token = this.generateToken(user.id);
    return { user, token };
  }

  public async login(email: string, password: string): Promise<AuthLoginResult> {
    const user = await userService.getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      throw new UnauthorizedError("Invalid email or password");
    }
    if (!user.enabled) {
      throw new UnauthorizedError("Please confirm your email before signing in");
    }
    await userService.updateUser(user.id, { lastLogin: new Date() });
    const token = this.generateToken(user.id);
    return { user, token };
  }

  public async loginWithMagicLink(token: string): Promise<AuthLoginResult> {
    const decoded = this.verifyLoginLinkToken(token);
    const user = await userService.getUserById(decoded.userId);
    if (!user) throw new NotFoundError("User not found");
    if (!user.enabled) throw new UnauthorizedError("User account is disabled");
    await userService.updateUser(user.id, { lastLogin: new Date() });
    const sessionToken = this.generateToken(user.id);
    return { user, token: sessionToken };
  }

  public async requestMagicLink(email: string): Promise<void> {
    const user = await userService.getUserByEmail(email);
    if (!user || !user.enabled) {
      return;
    }

    const token = this.generateLoginLinkToken(user.id);
    const magicLink = new URL(serverConfig.MAGIC_LINK.REDIRECT_URL);
    magicLink.searchParams.set("token", token);

    await emailService.sendMagicLinkEmail(user.email, magicLink.toString());
  }

  public async confirmEmail(token: string): Promise<void> {
    const decoded = this.verifyEmailVerificationToken(token);
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (user.enabled) {
      return;
    }
    await userService.updateUser(user.id, { enabled: true });
  }

  public sanitizeUser(user: UserInstance) {
    const plain = user.get({ plain: true }) as unknown as Record<string, unknown>;
    delete plain.password;
    return plain;
  }
}

export default new AuthService();
