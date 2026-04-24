import { Sequelize } from "sequelize";
import Application, { init as initApplication } from "./Application";

import User, { init as initUser } from "./User";
import Category, { init as initCategory } from "./Category";
import Product, { init as initProduct } from "./Product";
import Inventory, { init as initInventory } from "./Inventory";
import Cart, { init as initCart } from "./Cart";
import CartItem, { init as initCartItem } from "./CartItem";
import Order, { init as initOrder } from "./Order";
import OrderItem, { init as initOrderItem } from "./OrderItem";
import Payment, { init as initPayment } from "./Payment";
import Image, { init as initImage } from "./Image";
import ProductImage, { init as initProductImage } from "./ProductImage";

export {
  Application,
  User,
  Category,
  Product,
  Image,
  ProductImage,
  Inventory,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
};

export function init(sequelize: Sequelize) {
  initApplication(sequelize);
  initUser(sequelize);
  initCategory(sequelize);
  initProduct(sequelize);
  initInventory(sequelize);
  initCart(sequelize);
  initCartItem(sequelize);
  initOrder(sequelize);
  initOrderItem(sequelize);
  initPayment(sequelize);
  initImage(sequelize);
  initProductImage(sequelize);

  Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
  Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  Product.hasOne(Inventory, { foreignKey: "productId", as: "inventory" });
  Inventory.belongsTo(Product, { foreignKey: "productId", as: "product" });

  User.hasMany(Cart, { foreignKey: "userId", as: "carts" });
  Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

  Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items" });
  CartItem.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });
  CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
  Product.hasMany(CartItem, { foreignKey: "productId", as: "cartItems" });

  User.hasMany(Order, { foreignKey: "userId", as: "orders" });
  Order.belongsTo(User, { foreignKey: "userId", as: "user" });

  Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
  OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

  Order.hasMany(Payment, { foreignKey: "orderId", as: "payments" });
  Payment.belongsTo(Order, { foreignKey: "orderId", as: "order" });

  Product.belongsToMany(Image, {
    through: ProductImage,
    foreignKey: "productId",
    otherKey: "imageId",
    as: "images",
  });
  Image.belongsToMany(Product, {
    through: ProductImage,
    foreignKey: "imageId",
    otherKey: "productId",
    as: "products",
  });
}
