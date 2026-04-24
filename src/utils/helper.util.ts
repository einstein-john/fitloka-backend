import * as crypto from "crypto";
import serverConfig from "../config/server.config";

class HelperUtil {
  public getPaginationData(limit: number, page: number, totalCount: number) {
    const currentPage = page;
    const totalPages = Math.ceil(totalCount / limit);
    const previousPage = page - 1 === 0 ? null : page - 1;
    const nextPage = page + 1 > totalPages ? null : page + 1;
    return { currentPage, totalPages, previousPage, nextPage };
  }

  public getSlug(name: string): string {
    const slug = name.replace(/([^\w ]|_)/g, "");
    return `${slug.replace(/\s+/g, "-").toLowerCase()}`;
  }

  public generateRandomPassword(): string {
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = lowercaseChars.toUpperCase();
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_+={}[];':\"\\|,.<>/?";

    // Combine all character pools:
    const allChars = lowercaseChars + uppercaseChars + numbers + symbols;

    // Generate random characters using crypto.randomFillSync:
    const passwordBuffer = new Uint8Array(10);
    crypto.randomFillSync(passwordBuffer);

    // Convert bytes to password characters:
    let password = "";
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor((passwordBuffer[i] / 256) * allChars.length);
      password += allChars[randomIndex];
    }

    return password;
  }

  public getStartAndEndOfDay(date: Date): { startOfDay: Date; endOfDay: Date } {
    const formattedDate = date.toLocaleDateString("af-AZ");
    const startOfDay = new Date(formattedDate);
    const endOfDay = new Date(`${formattedDate}T23:59:59.999Z`);

    return { startOfDay, endOfDay };
  }

  public getDaysFromNow(duration: number, date: Date = new Date()): Date {
    const daysFromNow = new Date(date);
    daysFromNow.setDate(daysFromNow.getDate() + duration);

    return daysFromNow;
  }

  public formatDateForMail(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  public formatAmountWithCurrency(value: number | string): string {
    try {
      const amount = typeof value === "string" ? parseFloat(value) : value;

      if (isNaN(amount)) {
        return "₦0.00";
      }

      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      serverConfig.DEBUG(`Error formatting amount with currency: ${error}`);
      return "₦0.00";
    }
  }

  public extractNumber(value: string): number {
    const numberRegex = /\d+/g;
    const match = numberRegex.exec(value);
    if (!match) {
      serverConfig.DEBUG(`Error when extracting number from string: ${value}`);
      return 0;
    }
    return parseInt(match[0], 10);
  }

  public isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  public flattenObject(
    obj: any,
    path = "",
    acc: Record<string, any> = {},
    privateKeys: string[] = []
  ) {
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => {
        const newPath = path ? `${path}[${idx}]` : `[${idx}]`;
        this.flattenObject(item, newPath, acc);
      });
    } else if (obj && typeof obj === "object") {
      Object.entries(obj)
        .filter(([key, _]) => !(key.startsWith("_") || privateKeys.includes(key)))
        .forEach(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          this.flattenObject(value, newPath, acc);
        });
    } else {
      acc[path] = obj;
    }
    return acc;
  }

  public isObject(value: unknown): value is object {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  public isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  public compareArrays(current: unknown[], previous: unknown[]): Record<string, unknown> {
    // Flatten both arrays for comparison
    const flatCurrent = this.flattenObject(current);
    const flatPrevious = this.flattenObject(previous);

    const changes: Record<string, unknown> = {};
    const currentKeys = new Set(Object.keys(flatCurrent));
    const previousKeys = new Set(Object.keys(flatPrevious));

    // Check for changed or added fields
    for (const [key, value] of Object.entries(flatCurrent)) {
      const prevValue = flatPrevious[key];
      if (value !== prevValue) {
        changes[key] = value;
      }
    }

    // Check for removed fields
    for (const key of previousKeys) {
      if (!currentKeys.has(key)) {
        changes[key] = null;
      }
    }

    return changes;
  }

  public compareObjects<T extends object>(
    current: T,
    previous: T | null | undefined
  ): Record<string, unknown> {
    // Early return if no previous object
    if (!previous) {
      return this.flattenObject(current);
    }

    // Flatten both objects
    const flatCurrent = this.flattenObject(current);
    const flatPrevious = this.flattenObject(previous);

    const changes: Record<string, unknown> = {};
    const currentKeys = new Set(Object.keys(flatCurrent));
    const previousKeys = new Set(Object.keys(flatPrevious));

    // Check for changed or added fields
    for (const [key, value] of Object.entries(flatCurrent)) {
      const prevValue = flatPrevious[key];
      if (value !== prevValue) {
        changes[key] = value;
      }
    }

    // Check for removed fields
    for (const key of previousKeys) {
      if (!currentKeys.has(key)) {
        changes[key] = null;
      }
    }

    return changes;
  }
}

export default new HelperUtil();
