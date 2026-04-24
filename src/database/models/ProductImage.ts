import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export interface ProductImageAttributes {
  id: number;
  productId: number;
  imageId: number;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductImageInstance
  extends Model<ProductImageAttributes>, ProductImageAttributes {}

class ProductImage extends Model<ProductImageAttributes> {
  declare id: CreationOptional<number>;
  declare productId: number;
  declare imageId: number;
  declare sortOrder: number;
  declare isPrimary: boolean;
}

export function init(sequelize: Sequelize) {
  ProductImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      imageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "product_images",
      paranoid: false,
    }
  );
}

export default ProductImage;
