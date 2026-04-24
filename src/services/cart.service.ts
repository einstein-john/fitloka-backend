import { BadRequestError, NotFoundError } from "../errors";
import { cartRepository, productRepository } from "../repositories";

class CartService {
  public async getMyCart(userId: number) {
    const cart = await cartRepository.getOrCreateActiveCart(userId);
    return cartRepository.findCartWithItems(cart.id, userId);
  }

  public async addItem(userId: number, productId: number, quantity: number) {
    if (quantity < 1) throw new BadRequestError("Quantity must be at least 1");
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");
    if (product.status !== "ACTIVE") throw new BadRequestError("Product is not available");
    const cart = await cartRepository.getOrCreateActiveCart(userId);
    return cartRepository.addItem(cart.id, productId, quantity);
  }

  public async updateItem(userId: number, cartItemId: number, quantity: number) {
    if (quantity < 1) throw new BadRequestError("Quantity must be at least 1");
    const cart = await cartRepository.getOrCreateActiveCart(userId);
    const full = await cartRepository.findCartWithItems(cart.id, userId);
    const item = full?.items?.find((i) => i.id === cartItemId);
    if (!item) throw new NotFoundError("Cart item not found");
    await cartRepository.updateItemQuantity(cartItemId, cart.id, quantity);
    return cartRepository.findCartWithItems(cart.id, userId);
  }

  public async removeItem(userId: number, cartItemId: number) {
    const cart = await cartRepository.getOrCreateActiveCart(userId);
    const removed = await cartRepository.removeItem(cartItemId, cart.id);
    if (!removed) throw new NotFoundError("Cart item not found");
    return cartRepository.findCartWithItems(cart.id, userId);
  }
}

export default new CartService();
