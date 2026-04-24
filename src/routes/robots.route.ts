import { Router } from "express";
import botProtectionMiddleware from "../middlewares/bot-protection.middleware";

class RobotsRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.get("/", botProtectionMiddleware.serveRobotsTxt);
  }
}

export default new RobotsRoute().router;
