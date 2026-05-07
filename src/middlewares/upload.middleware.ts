import multer, { MulterError } from "multer";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors";
import serverConfig from "../config/server.config";

const storage = multer.memoryStorage();

function createImageUpload(fieldName: string) {
  return multer({
    storage,
    limits: { fileSize: serverConfig.CLOUDINARY.MAX_IMAGE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files are allowed"));
        return;
      }
      cb(null, true);
    },
  }).single(fieldName);
}

const productImageParser = createImageUpload("image");
const profileImageParser = createImageUpload("image");

function handleMulter(err: unknown, next: NextFunction, req: Request): void {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(new BadRequestError("Image exceeds maximum allowed size"));
      return;
    }
    next(new BadRequestError(err.message));
    return;
  }
  if (err instanceof Error) {
    next(new BadRequestError(err.message));
    return;
  }
  if (!req.file?.buffer?.length) {
    next(new BadRequestError('Image file is required (multipart field name: "image")'));
    return;
  }
  next();
}

class UploadMiddleware {
  public parseProductImage(req: Request, res: Response, next: NextFunction): void {
    productImageParser(req, res, (err) => handleMulter(err, next, req));
  }

  public parseProfileImage(req: Request, res: Response, next: NextFunction): void {
    profileImageParser(req, res, (err) => handleMulter(err, next, req));
  }
}

export default new UploadMiddleware();
