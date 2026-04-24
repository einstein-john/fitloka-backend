import type { UserInstance } from "../database/models/User";
import { userRepository } from "../repositories";
import type { CreateUserInput } from "../interfaces";
import type { UserAttributes } from "../types/user.interface";

class UserService {
  public async createUser(
    user: Omit<UserAttributes, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<UserInstance> {
    return userRepository.create(user as CreateUserInput);
  }

  public async getUsers(): Promise<UserInstance[]> {
    return userRepository.findAll();
  }

  public async getUserById(id: number): Promise<UserInstance | null> {
    return userRepository.findById(id);
  }

  public async getUserByEmail(email: string): Promise<UserInstance | null> {
    return userRepository.findByEmail(email);
  }

  public async getUserByUsername(username: string): Promise<UserInstance | null> {
    return userRepository.findByUsername(username);
  }

  public async getUserByUsernameAndEmail(
    username: string,
    email: string
  ): Promise<UserInstance | null> {
    return userRepository.findByUsernameAndEmail(username, email);
  }

  public async updateUser(id: number, user: Partial<UserAttributes>): Promise<[number]> {
    return userRepository.update(id, user);
  }

  public async deleteUser(id: number): Promise<number> {
    return userRepository.delete(id);
  }
}

export default new UserService();
