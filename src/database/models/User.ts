import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";
import { UserAttributes } from "../../types/user.interface";

export interface UserInstance extends Model<UserAttributes>, UserAttributes {}

class User extends Model<UserAttributes> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare firstName: string | null;
  declare lastName: string | null;
  declare email: string;
  declare password: string | null;
  declare enabled: boolean | null;
  declare isAdmin: boolean | null;
  declare profilePicture: string | null;
  declare lastLogin: Date | null;
}

export function init(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "users",
      paranoid: true,
    }
  );
}

export default User;
