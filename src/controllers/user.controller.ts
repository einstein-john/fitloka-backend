import { NextFunction, Response } from "express";
import userService from "../services/user.service";
import authService from "../services/auth.service";
import cloudinaryService from "../services/cloudinary.service";
import serverConfig from "../config/server.config";
import { AuthenticatedUserRequest } from "../types";
import { UserAttributes } from "../types/user.interface";
import { canAccessResource } from "../utils/auth.util";

export default class UserController {
  protected async getCurrentUser(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User authentication required" });
        return;
      }
      res.status(200).json({
        message: "User fetched successfully",
        data: authService.sanitizeUser(req.user),
      });
    } catch (error) {
      serverConfig.DEBUG(`Error fetching current user: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async uploadProfilePicture(
    req: AuthenticatedUserRequest & { file?: Express.Multer.File },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: "User authentication required" });
        return;
      }
      const previousPicture =
        req.user?.getDataValue?.("profilePicture") ??
        (req.user as { profilePicture?: string | null })?.profilePicture ??
        null;
      const file = req.file;
      if (!file?.buffer?.length) {
        res.status(400).json({ message: "Image file is required", data: {} });
        return;
      }
      const { secureUrl } = await cloudinaryService.uploadImageBuffer(
        file.buffer,
        serverConfig.CLOUDINARY.FOLDER_PROFILES
      );
      await userService.updateUser(req.userId, { profilePicture: secureUrl });
      const updatedUser = await userService.getUserById(req.userId);
      res.status(200).json({
        message: "Profile picture updated",
        data: updatedUser ? authService.sanitizeUser(updatedUser) : null,
      });
      if (previousPicture && previousPicture !== secureUrl) {
        cloudinaryService.scheduleDestroyBySecureUrl(previousPicture);
      }
    } catch (error) {
      serverConfig.DEBUG(`Error uploading profile picture: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async getUser(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: "User authentication required" });
        return;
      }
      const { id } = req.params;
      if (!canAccessResource(req, Number(id))) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      const user = await userService.getUserById(Number(id));
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json({
        message: "User fetched successfully",
        data: authService.sanitizeUser(user),
      });
    } catch (error) {
      serverConfig.DEBUG(`Error fetching user: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async updateUser(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: "User authentication required" });
        return;
      }
      const { id } = req.params;
      if (!canAccessResource(req, Number(id))) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      const userData = req.body as Partial<UserAttributes>;
      if (userData.password && String(userData.password).length > 0) {
        const { hashPassword } = await import("../utils/password.util");
        userData.password = hashPassword(String(userData.password));
      } else {
        delete userData.password;
      }
      await userService.updateUser(Number(id), userData);
      const updatedUser = await userService.getUserById(Number(id));
      res.status(200).json({
        message: "User updated successfully",
        data: updatedUser ? authService.sanitizeUser(updatedUser) : null,
      });
    } catch (error) {
      serverConfig.DEBUG(`Error updating user: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async deleteUser(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: "User authentication required" });
        return;
      }
      const { id } = req.params;
      if (!canAccessResource(req, Number(id))) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      await userService.deleteUser(Number(id));
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      serverConfig.DEBUG(`Error deleting user: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
