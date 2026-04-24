import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export interface InventoryAttributes {
  id: number;
  productId: number;
  stock: number;
  reservedStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InventoryInstance extends Model<InventoryAttributes>, InventoryAttributes {}

class Inventory extends Model<InventoryAttributes> {
  declare id: CreationOptional<number>;
  declare productId: number;
  declare stock: number;
  declare reservedStock: number;
}

export function init(sequelize: Sequelize) {
  Inventory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reservedStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "inventories",
      paranoid: false,
    }
  );
}

export default Inventory;
