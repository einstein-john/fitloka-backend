import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";
import { ApplicationAttributes } from "../../types/application.interface";

export interface ApplicationInstance extends Model<ApplicationAttributes>, ApplicationAttributes {}

class Application extends Model<ApplicationAttributes> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare apiKey: string;
  declare isActive: boolean;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
  declare readonly deletedAt?: Date;
}

export function init(sequelize: Sequelize) {
  Application.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      apiKey: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "applications",
      paranoid: true,
    }
  );
}

export default Application;
