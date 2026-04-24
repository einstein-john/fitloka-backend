import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";
import type { CartStatus } from "../../types/catalog.types";
import type { CartItemInstance } from "./CartItem";

export interface CartAttributes {
  id: number;
  userId: number;
  status: CartStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartInstance extends Model<CartAttributes>, CartAttributes {
  items?: import("./CartItem").CartItemInstance[];
}

class Cart extends Model<CartAttributes> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare status: CartStatus;
  declare items?: CartItemInstance[];
}

export function init(sequelize: Sequelize) {
  Cart.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "CONVERTED"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "carts",
      paranoid: false,
    }
  );
}

export default Cart;
