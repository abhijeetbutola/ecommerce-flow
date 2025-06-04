import type { CartItem } from "@/types/cart";

const CART_STORAGE_KEY = "shoppingCart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  const storedCart = sessionStorage.getItem(CART_STORAGE_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cartUpdated"));
}

export function addToCart(
  item: Omit<CartItem, "id" | "quantity"> & { quantity: number }
): CartItem[] {
  const cart = getCart();
  const cartItemId = `${item.productId}-${item.selectedSize}-${item.selectedColor}`;

  const existingItemIndex = cart.findIndex(
    (cartItem) => cartItem.id === cartItemId
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += item.quantity;
    if (item.stock && cart[existingItemIndex].quantity > item.stock) {
      cart[existingItemIndex].quantity = item.stock;
    }
  } else {
    cart.push({ ...item, id: cartItemId });
  }
  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): CartItem[] {
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === cartItemId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      const item = cart[itemIndex];
      if (item.stock && quantity > item.stock) {
        cart[itemIndex].quantity = item.stock;
      } else {
        cart[itemIndex].quantity = quantity;
      }
    }
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(cartItemId: string): CartItem[] {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== cartItemId);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("cartUpdated"));
}

export function getCartSubtotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}
