import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";
import type { ProductInstance } from "./Product";

export interface CartItemAttributes {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItemInstance extends Model<CartItemAttributes>, CartItemAttributes {
  product?: ProductInstance;
}

class CartItem extends Model<CartItemAttributes> {
  declare id: CreationOptional<number>;
  declare cartId: number;
  declare productId: number;
  declare quantity: number;
  declare product?: ProductInstance;
}

export function init(sequelize: Sequelize) {
  CartItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "cart_items",
      paranoid: false,
    }
  );
}

export default CartItem;
