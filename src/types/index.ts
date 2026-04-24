import { Request } from "express";
import { Model } from "sequelize";
import { ApplicationInstance } from "../database/models/Application";

export interface AuthenticatedRequest extends Request {
  application?: ApplicationInstance;
  headers: {
    [key: string]: string | string[] | undefined;
    "x-api-key"?: string;
  };
}

export interface BaseModel extends Model {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export * from "./application.interface";
export * from "./api.interface";
export * from "./auth.interface";
export * from "./catalog.types";
