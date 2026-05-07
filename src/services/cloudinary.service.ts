import { v2 as cloudinary } from "cloudinary";
import serverConfig from "../config/server.config";
import { ApplicationError } from "../errors";

class CloudinaryService {
  private applyConfigSilent(): boolean {
    if (!serverConfig.cloudinaryConfigured) return false;
    cloudinary.config({
      cloud_name: serverConfig.CLOUDINARY.CLOUD_NAME,
      api_key: serverConfig.CLOUDINARY.API_KEY,
      api_secret: serverConfig.CLOUDINARY.API_SECRET,
    });
    return true;
  }

  private configure(): void {
    if (!this.applyConfigSilent()) {
      throw new ApplicationError(
        503,
        "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
      );
    }
  }

  /**
   * Best-effort public_id from a delivery URL for this app's cloud only.
   * Skips URLs with inline transformations we can't reliably parse.
   */
  private extractPublicIdFromOurUrl(url: string): string | null {
    if (!serverConfig.cloudinaryConfigured) return null;
    const cloud = serverConfig.CLOUDINARY.CLOUD_NAME;
    try {
      const u = new URL(url);
      if (u.hostname !== "res.cloudinary.com") return null;
      const prefix = `/${cloud}/image/upload/`;
      const pos = u.pathname.indexOf(prefix);
      if (pos === -1) return null;
      const afterUpload = u.pathname.slice(pos + prefix.length);
      const parts = afterUpload.split("/").filter(Boolean);
      let i = 0;
      while (i < parts.length && /^v\d+$/i.test(parts[i]!)) i += 1;
      while (i < parts.length && parts[i]!.includes(",")) i += 1;
      if (i >= parts.length) return null;
      const pathWithExt = parts.slice(i).join("/");
      if (!pathWithExt || pathWithExt.includes(",")) return null;
      const withoutExt = pathWithExt.replace(/\.[a-z0-9]+$/i, "");
      return decodeURIComponent(withoutExt) || null;
    } catch {
      return null;
    }
  }

  /**
   * Deletes an asset in the background (does not block the HTTP request).
   */
  public scheduleDestroyBySecureUrl(url: string | null | undefined): void {
    if (!url?.trim()) return;
    const publicId = this.extractPublicIdFromOurUrl(url);
    if (!publicId) return;

    setImmediate(() => {
      void (async () => {
        try {
          if (!this.applyConfigSilent()) return;
          const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
          serverConfig.DEBUG(`Cloudinary cleanup destroy ${publicId}: ${JSON.stringify(result)}`);
        } catch (err) {
          serverConfig.DEBUG(`Cloudinary cleanup failed for ${publicId}: ${JSON.stringify(err)}`);
        }
      })();
    });
  }

  public async uploadImageBuffer(
    buffer: Buffer,
    folder: string
  ): Promise<{ secureUrl: string; publicId: string }> {
    this.configure();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          unique_filename: true,
          overwrite: false,
        },
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result?.secure_url) {
            reject(new Error("Cloudinary returned no secure_url"));
            return;
          }
          resolve({ secureUrl: result.secure_url, publicId: result.public_id });
        }
      );
      stream.end(buffer);
    });
  }
}

export default new CloudinaryService();
