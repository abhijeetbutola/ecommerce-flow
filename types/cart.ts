export type CartItem = {
  id: string // Unique identifier for the cart item, e.g., `${productId}-${selectedSize}-${selectedColor}`
  productId: string
  productName: string
  productImage: string
  price: number // Price per unit at the time of adding to cart
  quantity: number
  selectedSize: string
  selectedColor: string
  // Add any other product-specific details you want to store per cart item
  stock?: number // To check against when updating quantity
  minimumOrderQuantity?: number
}
