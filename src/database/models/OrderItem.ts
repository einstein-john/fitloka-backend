import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  productName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItemInstance extends Model<OrderItemAttributes>, OrderItemAttributes {}

class OrderItem extends Model<OrderItemAttributes> {
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare productId: number;
  declare quantity: number;
  declare unitPrice: string;
  declare productName: string;
}

export function init(sequelize: Sequelize) {
  OrderItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
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
      unitPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "order_items",
      paranoid: false,
    }
  );
}

export default OrderItem;
