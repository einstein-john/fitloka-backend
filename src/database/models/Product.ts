import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";
import type { ProductStatus } from "../../types/catalog.types";
import type { ImageInstance } from "./Image";

export type { ProductStatus };

export interface ProductAttributes {
  id: number;
  categoryId: number;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  status: ProductStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ProductInstance extends Model<ProductAttributes>, ProductAttributes {}

class Product extends Model<ProductAttributes> {
  declare id: CreationOptional<number>;
  declare categoryId: number;
  declare name: string;
  declare sku: string;
  declare description: string | null;
  declare price: string;
  declare status: ProductStatus;
  declare images?: ImageInstance[];
}

export function init(sequelize: Sequelize) {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "products",
      paranoid: true,
    }
  );
}

export default Product;
