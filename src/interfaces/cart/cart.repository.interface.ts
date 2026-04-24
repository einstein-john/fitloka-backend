import type { CartInstance } from "../../database/models/Cart";
import type { CartItemInstance } from "../../database/models/CartItem";

export interface ICartRepository {
  findActiveCartByUserId(userId: number): Promise<CartInstance | null>;
  createCart(userId: number): Promise<CartInstance>;
  getOrCreateActiveCart(userId: number): Promise<CartInstance>;
  findCartWithItems(cartId: number, userId: number): Promise<CartInstance | null>;
  addItem(cartId: number, productId: number, quantity: number): Promise<CartItemInstance>;
  updateItemQuantity(cartItemId: number, cartId: number, quantity: number): Promise<[number]>;
  removeItem(cartItemId: number, cartId: number): Promise<number>;
  clearCart(cartId: number): Promise<number>;
}
