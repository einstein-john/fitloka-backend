import { Model } from "sequelize";

export interface ReqQueryOptions {
  page?: number;
  limit?: number;
  offset?: number;
  search?: string | undefined | null;
}

export interface PaginatedResponse<T> {
  result: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  previousPage: number | null;
  nextPage: number | null;
}

export interface DecodedToken {
  payload: Model | null;
  expired: boolean | string | Error;
}

export interface IBaseAttribute {
  id: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export enum IFileType {
  AVI = "avi",
  COURSE = "course",
  CERTIFICATE = "certificate",
  OTHERS = "others",
  WEBSITE_CONTENT = "website-content",
}
