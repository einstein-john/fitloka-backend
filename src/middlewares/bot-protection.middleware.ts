import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import serverConfig from "../config/server.config";
import { NodeEnvOptions } from "../config/constants";

// Known bot and crawler user agents
const BOT_USER_AGENTS = [
  // Search engine crawlers
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "applebot",
  "crawler",
  "spider",

  // SEO and analytics tools
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "semrushbot",
  "megaindex",
  "blexbot",
  "sistrix",
  "screaming frog",
  "sitebulb",
  "deepcrawl",
  "botify",
  "oncrawl",
  "lighthouse",

  // Security scanners
  "nmap",
  "nikto",
  "sqlmap",
  "nessus",
  "openvas",
  "burpsuite",
  "zap",
  "acunetix",
  "netsparker",
  "qualys",
  "rapid7",
  "tenable",
  "veracode",
  "checkmarx",

  // Generic bot patterns
  "bot",
  "crawler",
  "spider",
  "scraper",
  "fetcher",
  "harvester",
  "extractor",
  "monitor",
  "checker",
  "validator",
  "tester",
  "scanner",
  "probe",
  "agent",
];

// Suspicious patterns in user agents
const SUSPICIOUS_PATTERNS = [
  /^$/, // Empty user agent
  /^curl/i,
  /^wget/i,
  /^python/i,
  /^java/i,
  /^php/i,
  /^node/i,
  /^go-http/i,
  /^libwww/i,
  /^lwp/i,
  /^http/i,
  /^request/i,
  /^fetch/i,
  /^axios/i,
  /^postman/i,
  /^insomnia/i,
  /^thunder/i,
  /^okhttp/i,
  /^apache/i,
  /^nginx/i,
];

const detectLocalRequest = (req: Request): boolean => {
  const ip = req.ip || req.connection.remoteAddress || "";

  // Early return for empty IP
  if (!ip) return false;

  // Exact matches for common local addresses
  const exactMatches = new Set([
    "127.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "localhost",
    "0.0.0.0",
    "::",
  ]);

  if (exactMatches.has(ip)) return true;

  // IPv4 patterns
  if (ip.includes(".")) {
    return (
      ip.startsWith("127.") || // Loopback
      ip.startsWith("192.168.") || // Private network
      ip.startsWith("10.") || // Private network
      ip.startsWith("172.") || // Private network (includes Docker)
      ip.startsWith("169.254.")
    ); // Link-local
  }

  // IPv6 patterns
  if (ip.includes(":")) {
    // IPv4-mapped IPv6 addresses
    if (ip.startsWith("::ffff:")) {
      const mappedIp = ip.substring(7); // Remove '::ffff:' prefix
      return (
        mappedIp.startsWith("127.") ||
        mappedIp.startsWith("192.168.") ||
        mappedIp.startsWith("10.") ||
        mappedIp.startsWith("172.") ||
        mappedIp.startsWith("169.254.")
      );
    }

    // Native IPv6 patterns
    return (
      ip.startsWith("fc00:") || // Unique local addresses
      ip.startsWith("fe80:")
    ); // Link-local addresses
  }

  return false;
};

/**
 * Detect truly suspicious activity patterns
 */
const isTrulySuspicious = (req: Request): boolean => {
  const userAgent = req.get("User-Agent") || "";
  const ip = req.ip || req.connection.remoteAddress || "";
  const path = req.path;
  const lowerUserAgent = userAgent.toLowerCase();

  // Skip suspicious detection for IPv6 localhost (::1)
  if (ip === "::1") {
    return false;
  }

  // High-confidence suspicious patterns
  const suspiciousPatterns = [
    // Empty or missing critical headers
    !req.get("Accept"),
    !req.get("Accept-Language"),
    !req.get("Accept-Encoding"),

    // Suspicious user agent patterns
    userAgent.length < 10,
    userAgent.length > 1000,
    /^[a-z]+$/i.test(userAgent), // Only lowercase letters
    /^\d+$/.test(userAgent), // Only numbers
    /^[a-z0-9]+$/i.test(userAgent) && userAgent.length < 15, // Short alphanumeric

    // Known malicious patterns
    lowerUserAgent.includes("sqlmap"),
    lowerUserAgent.includes("nikto"),
    lowerUserAgent.includes("nmap"),
    lowerUserAgent.includes("burp"),
    lowerUserAgent.includes("zap"),
    lowerUserAgent.includes("acunetix"),
    lowerUserAgent.includes("netsparker"),
    lowerUserAgent.includes("nessus"),
    lowerUserAgent.includes("openvas"),

    // Generic bot patterns (but not legitimate ones)
    lowerUserAgent.includes("bot") &&
      !lowerUserAgent.includes("googlebot") &&
      !lowerUserAgent.includes("bingbot"),
    lowerUserAgent.includes("crawler") && !lowerUserAgent.includes("googlebot"),
    lowerUserAgent.includes("spider") && !lowerUserAgent.includes("googlebot"),
    lowerUserAgent.includes("scraper"),
    lowerUserAgent.includes("harvester"),
    lowerUserAgent.includes("extractor"),

    // Command-line tools
    lowerUserAgent.startsWith("curl/"),
    lowerUserAgent.startsWith("wget/"),
    lowerUserAgent.startsWith("python-requests/"),
    lowerUserAgent.startsWith("java/"),
    lowerUserAgent.startsWith("go-http-client/"),
    lowerUserAgent.startsWith("libwww-perl/"),
    lowerUserAgent.startsWith("lwp-trivial/"),

    // Testing tools
    lowerUserAgent.includes("postman"),
    lowerUserAgent.includes("insomnia"),
    lowerUserAgent.includes("thunder"),
    lowerUserAgent.includes("okhttp"),

    // Suspicious path patterns
    path.includes(".."), // Directory traversal
    path.includes("//"), // Double slashes
    path.includes("\\"), // Backslashes
    path.includes("<script"), // XSS attempts
    path.includes("javascript:"), // XSS attempts
    path.includes("data:"), // Data URLs

    // Suspicious query parameters
    Object.keys(req.query).some(
      (key) =>
        key.includes("script") ||
        key.includes("javascript") ||
        key.includes("eval") ||
        key.includes("exec")
    ),
  ];

  // Check for multiple suspicious indicators
  const suspiciousCount = suspiciousPatterns.filter(Boolean).length;

  // Require at least 2 suspicious indicators to log
  return suspiciousCount >= 2;
};

class BotProtectionMiddleware {
  /**
   * Detect if the request is from a bot or crawler
   */
  public detectBot(req: Request): boolean {
    // Skip bot detection for local requests
    if (detectLocalRequest(req)) {
      return false;
    }

    const userAgent = req.get("User-Agent") || "";
    const userAgentLower = userAgent.toLowerCase();

    // Check for known bot user agents
    const isKnownBot = BOT_USER_AGENTS.some((bot) => userAgentLower.includes(bot.toLowerCase()));

    // Check for suspicious patterns
    const hasSuspiciousPattern = SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(userAgent));

    // Check for missing or very short user agents
    const isSuspiciousUserAgent = userAgent.length < 10 || userAgent.length > 500;

    // Check for missing common headers that browsers typically send
    const missingBrowserHeaders =
      !req.get("Accept") || !req.get("Accept-Language") || !req.get("Accept-Encoding");

    return isKnownBot || hasSuspiciousPattern || isSuspiciousUserAgent || missingBrowserHeaders;
  }

  /**
   * Block bot requests
   */
  public blockBots(req: Request, res: Response, next: NextFunction): void {
    if (this.detectBot(req)) {
      // const userAgent = req.get('User-Agent') || 'Unknown';
      // const ip = req.ip || req.connection.remoteAddress || 'Unknown';

      // Log the blocked request
      // ntfyService.sendErrorNotification(`Blocked bot request from ${ip} with User-Agent: ${userAgent}`, 'Bot detected');

      // Return 403 Forbidden with a clear message
      res.status(403).json({
        message: "Access denied. This API is not available for automated requests.",
        code: "BOT_DETECTED",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  }

  public detectLocalRequest(req: Request): boolean {
    return detectLocalRequest(req);
  }

  /**
   * Create rate limiter for API endpoints
   */
  public createRateLimiter(
    options: {
      windowMs?: number;
      max?: number;
      message?: string;
      skipSuccessfulRequests?: boolean;
    } = {}
  ) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100, // limit each IP to 100 requests per windowMs
      message = "Too many requests from this IP, please try again later.",
      skipSuccessfulRequests = false,
    } = options;

    return rateLimit({
      windowMs,
      max,
      message: {
        message,
        code: "RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString(),
      },
      skipSuccessfulRequests,
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting in development
      skip: (_req) => serverConfig.NODE.ENV === NodeEnvOptions.DEVELOPMENT,
    });
  }

  /**
   * Strict rate limiter for sensitive endpoints
   */
  public createStrictRateLimiter() {
    return this.createRateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 10, // Very strict limit
      message: "Too many requests to this sensitive endpoint. Please try again later.",
      skipSuccessfulRequests: true,
    });
  }

  /**
   * Add security headers to prevent indexing
   */
  public addSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    // Prevent search engines from indexing API responses
    res.setHeader("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive, notranslate");

    // Additional security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Cache control to prevent caching of API responses
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    next();
  }

  /**
   * Serve robots.txt to guide crawlers
   */
  public serveRobotsTxt(req: Request, res: Response): void {
    const robotsTxt = `User-agent: *
Disallow: /

# This API is not intended for crawling or indexing
# All endpoints are protected against automated access
`;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.send(robotsTxt);
  }

  /**
   * Log truly suspicious activity
   */
  public logSuspiciousActivity(req: Request, res: Response, next: NextFunction): void {
    if (isTrulySuspicious(req)) {
      const userAgent = req.get("User-Agent") || "";
      const ip = req.ip || req.connection.remoteAddress || "Unknown";
      const path = req.path;
      const method = req.method;
      const referer = req.get("Referer") || "None";
      const acceptLanguage = req.get("Accept-Language") || "None";

      const message = `Suspicious activity detected: ${method} ${path} from ${ip}
User-Agent: ${userAgent}
Referer: ${referer}
Accept-Language: ${acceptLanguage}`;

      serverConfig.DEBUG(message);
    }

    next();
  }
}

export default new BotProtectionMiddleware();
