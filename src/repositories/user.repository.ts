import User from "../database/models/User";
import type { UserInstance } from "../database/models/User";
import type {
  CreateUserInput,
  IUserRepository,
} from "../interfaces/user/user.repository.interface";
import type { UserAttributes } from "../types/user.interface";

class UserRepository implements IUserRepository {
  async create(data: CreateUserInput): Promise<UserInstance> {
    return User.create(data);
  }

  async findById(id: number): Promise<UserInstance | null> {
    return User.findByPk(id);
  }

  async findByEmail(email: string): Promise<UserInstance | null> {
    return User.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserInstance | null> {
    return User.findOne({ where: { username } });
  }

  async findByUsernameAndEmail(username: string, email: string): Promise<UserInstance | null> {
    return User.findOne({ where: { username, email } });
  }

  async update(id: number, data: Partial<UserAttributes>): Promise<[number]> {
    return User.update(data, { where: { id } });
  }

  async delete(id: number): Promise<number> {
    return User.destroy({ where: { id } });
  }

  async findAll(): Promise<UserInstance[]> {
    return User.findAll();
  }
}

export default new UserRepository();
