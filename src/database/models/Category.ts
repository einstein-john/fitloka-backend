import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export interface CategoryAttributes {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CategoryInstance extends Model<CategoryAttributes>, CategoryAttributes {}

class Category extends Model<CategoryAttributes> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare slug: string;
  declare description: string | null;
}

export function init(sequelize: Sequelize) {
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      tableName: "categories",
      paranoid: true,
    }
  );
}

export default Category;
