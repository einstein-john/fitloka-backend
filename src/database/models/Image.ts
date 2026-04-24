import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export interface ImageAttributes {
  id: number;
  url: string;
  altText: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ImageInstance extends Model<ImageAttributes>, ImageAttributes {}

class Image extends Model<ImageAttributes> {
  declare id: CreationOptional<number>;
  declare url: string;
  declare altText: string | null;
}

export function init(sequelize: Sequelize) {
  Image.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      altText: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "images",
      paranoid: false,
    }
  );
}

export default Image;
