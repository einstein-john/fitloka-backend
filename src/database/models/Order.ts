import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";
import type { OrderStatus } from "../../types/catalog.types";
import type { OrderItemInstance } from "./OrderItem";

export type { OrderStatus };

export interface OrderAttributes {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderInstance extends Model<OrderAttributes>, OrderAttributes {
  items?: import("./OrderItem").OrderItemInstance[];
}

class Order extends Model<OrderAttributes> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare status: OrderStatus;
  declare totalAmount: string;
  declare items?: OrderItemInstance[];
}

export function init(sequelize: Sequelize) {
  Order.init(
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
        type: DataTypes.ENUM("PENDING", "PAID", "SHIPPED", "CANCELLED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "orders",
      paranoid: false,
    }
  );
}

export default Order;
