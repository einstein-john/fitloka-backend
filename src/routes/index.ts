import { Router, Request, Response } from "express";
import { NotFoundError } from "../errors/index";
import serverConfig from "../config/server.config";

import systemMiddleware from "../middlewares/system.middleware";
import apiKeyAuthMiddleware from "../middlewares/api-key-auth.middleware";
import jwtAuthMiddleware from "../middlewares/jwt-auth.middleware";

import applicationRoute from "./application.route";
import robotsRoute from "./robots.route";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import categoryRoute from "./category.route";
import productRoute from "./product.route";
import inventoryRoute from "./inventory.route";
import cartRoute from "./cart.route";
import orderRoute from "./order.route";
import paymentRoute from "./payment.route";

class Routes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes(): void {
    this.router.get("/", (req: Request, res: Response) => {
      res.status(200).json({
        message: "Welcome to Fitlokal Clothing Store API.",
        data: {
          service: serverConfig.NODE.SERVICE,
          environment: serverConfig.NODE.ENV,
          version: serverConfig.NODE.VERSION,
        },
      });
    });

    this.router.get("/favicon.ico", (_req: Request, res: Response) => {
      res.status(204).end();
    });

    this.router.use(systemMiddleware.formatRequestQuery);

    this.router.use("/robots.txt", robotsRoute);

    this.router.use("/auth", authRoute);

    this.router.use("/applications", apiKeyAuthMiddleware.validateApiKey, applicationRoute);

    const protectedChain = [apiKeyAuthMiddleware.validateApiKey, jwtAuthMiddleware.validateToken];

    this.router.use("/users", ...protectedChain, userRoute);
    this.router.use("/categories", ...protectedChain, categoryRoute);
    this.router.use("/products", ...protectedChain, productRoute);
    this.router.use("/inventory", ...protectedChain, inventoryRoute);
    this.router.use("/cart", ...protectedChain, cartRoute);
    this.router.use("/orders", ...protectedChain, orderRoute);
    this.router.use("/payments", apiKeyAuthMiddleware.validateApiKey, paymentRoute);

    this.router.use("*", () => {
      throw new NotFoundError();
    });
  }
}

export default new Routes().router;
