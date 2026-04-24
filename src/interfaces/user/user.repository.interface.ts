import type { UserInstance } from "../../database/models/User";
import type { UserAttributes } from "../../types/user.interface";

export type CreateUserInput = Omit<UserAttributes, "id" | "createdAt" | "updatedAt" | "deletedAt">;

export interface IUserRepository {
  create(data: CreateUserInput): Promise<UserInstance>;
  findById(id: number): Promise<UserInstance | null>;
  findByEmail(email: string): Promise<UserInstance | null>;
  findByUsername(username: string): Promise<UserInstance | null>;
  findByUsernameAndEmail(username: string, email: string): Promise<UserInstance | null>;
  update(id: number, data: Partial<UserAttributes>): Promise<[number]>;
  delete(id: number): Promise<number>;
  findAll(): Promise<UserInstance[]>;
}
