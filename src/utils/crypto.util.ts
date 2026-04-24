import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import serverConfig from "../config/server.config";

/**
 * Shared crypto utility for encrypting/decrypting tokens
 * Uses AES-256-GCM encryption
 */
class CryptoUtil {
  /**
   * Encrypt a string using AES-256-GCM
   */
  static encrypt(text: string, encryptionKey: Buffer): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted + ":" + cipher.getAuthTag().toString("hex");
  }

  /**
   * Decrypt a string using AES-256-GCM
   */
  static decrypt(encryptedText: string, encryptionKey: Buffer): string {
    try {
      const [ivHex, encrypted, authTagHex] = encryptedText.split(":");
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");
      const decipher = createDecipheriv("aes-256-gcm", encryptionKey, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      serverConfig.DEBUG("[CRYPTO] Error decrypting:", error);
      throw new Error("Failed to decrypt token");
    }
  }

  /**
   * Get encryption key from hex string (must be 64 characters = 32 bytes)
   */
  static getKeyFromHex(hexKey: string, serviceName: string = "TOKEN"): Buffer {
    if (!hexKey || hexKey.length !== 64) {
      throw new Error(`${serviceName}_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)`);
    }
    return Buffer.from(hexKey, "hex");
  }
}

export default CryptoUtil;
