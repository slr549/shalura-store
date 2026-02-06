import { storage } from '../utils/storage.js'

class CartStore {
  constructor() {
    this.cart = storage.get('cart') || { items: [], total: 0 }
    this.listeners = []
  }

  // Get cart
  getCart() {
    return this.cart
  }

  // Add item to cart
  addItem(product, variant = null, quantity = 1) {
    const existingItem = this.cart.items.find(item => 
      item.productId === product.id && 
      (!variant || item.variantId === variant?.id)
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.cart.items.push({
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        variantId: variant?.id || null,
        variantName: variant ? `${variant.color} - ${variant.size}` : null,
        price: variant?.price || product.finalPrice,
        originalPrice: variant?.price || product.price,
        quantity,
        addedAt: new Date().toISOString()
      })
    }

    this.updateTotal()
    this.save()
    this.notify()
    
    return this.cart
  }

  // Update quantity
  updateQuantity(itemId, quantity) {
    const item = this.cart.items.find(item => item.id === itemId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      this.updateTotal()
      this.save()
      this.notify()
    }
  }

  // Remove item
  removeItem(itemId) {
    this.cart.items = this.cart.items.filter(item => item.id !== itemId)
    this.updateTotal()
    this.save()
    this.notify()
  }

  // Clear cart
  clearCart() {
    this.cart = { items: [], total: 0 }
    this.save()
    this.notify()
  }

  // Calculate total
  updateTotal() {
    this.cart.total = this.cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0)
  }

  // Get item count
  getItemCount() {
    return this.cart.items.reduce((count, item) => count + item.quantity, 0)
  }

  // Save to storage
  save() {
    storage.set('cart', this.cart)
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify listeners
  notify() {
    this.listeners.forEach(listener => listener(this.cart))
  }
}

// Singleton instance
export const cartStore = new CartStore()