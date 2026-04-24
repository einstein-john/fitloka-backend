import Cart from "../database/models/Cart";
import CartItem from "../database/models/CartItem";
import Product from "../database/models/Product";
import type { CartInstance } from "../database/models/Cart";
import type { CartItemInstance } from "../database/models/CartItem";
import type { ICartRepository } from "../interfaces/cart/cart.repository.interface";

class CartRepository implements ICartRepository {
  async findActiveCartByUserId(userId: number): Promise<CartInstance | null> {
    return Cart.findOne({ where: { userId, status: "ACTIVE" } });
  }

  async createCart(userId: number): Promise<CartInstance> {
    return Cart.create({ userId, status: "ACTIVE" });
  }

  async getOrCreateActiveCart(userId: number): Promise<CartInstance> {
    let cart = await this.findActiveCartByUserId(userId);
    if (!cart) {
      cart = await this.createCart(userId);
    }
    return cart;
  }

  async findCartWithItems(cartId: number, userId: number): Promise<CartInstance | null> {
    const row = await Cart.findOne({
      where: { id: cartId, userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product", required: false }],
        },
      ],
    });
    return row as CartInstance | null;
  }

  async addItem(cartId: number, productId: number, quantity: number): Promise<CartItemInstance> {
    const existing = await CartItem.findOne({ where: { cartId, productId } });
    if (existing) {
      await existing.update({ quantity: existing.quantity + quantity });
      return existing.reload();
    }
    return CartItem.create({ cartId, productId, quantity });
  }

  async updateItemQuantity(
    cartItemId: number,
    cartId: number,
    quantity: number
  ): Promise<[number]> {
    const [n] = await CartItem.update({ quantity }, { where: { id: cartItemId, cartId } });
    return [n];
  }

  async removeItem(cartItemId: number, cartId: number): Promise<number> {
    return CartItem.destroy({ where: { id: cartItemId, cartId } });
  }

  async clearCart(cartId: number): Promise<number> {
    return CartItem.destroy({ where: { cartId } });
  }
}

export default new CartRepository();
