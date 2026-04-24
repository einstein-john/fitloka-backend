import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";
import type { PaymentStatus } from "../../types/catalog.types";

export type { PaymentStatus };

export interface PaymentAttributes {
  id: number;
  orderId: number;
  provider: string;
  amount: string;
  status: PaymentStatus;
  transactionReference: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentInstance extends Model<PaymentAttributes>, PaymentAttributes {}

class Payment extends Model<PaymentAttributes> {
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare provider: string;
  declare amount: string;
  declare status: PaymentStatus;
  declare transactionReference: string | null;
}

export function init(sequelize: Sequelize) {
  Payment.init(
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
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      transactionReference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "payments",
      paranoid: false,
    }
  );
}

export default Payment;
