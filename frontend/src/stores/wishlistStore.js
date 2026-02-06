import { storage } from '../utils/storage.js'

class WishlistStore {
  constructor() {
    this.wishlist = storage.get('wishlist') || { items: [] }
    this.listeners = []
  }

  // Get wishlist
  getWishlist() {
    return this.wishlist
  }

  // Check if product is in wishlist
  isInWishlist(productId) {
    return this.wishlist.items.some(item => item.productId === productId)
  }

  // Add to wishlist
  addItem(product) {
    if (this.isInWishlist(product.id)) {
      return false
    }

    this.wishlist.items.push({
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      price: product.finalPrice,
      originalPrice: product.price,
      discount: product.discount,
      addedAt: new Date().toISOString()
    })

    this.save()
    this.notify()
    return true
  }

  // Remove from wishlist
  removeItem(productId) {
    const initialLength = this.wishlist.items.length
    this.wishlist.items = this.wishlist.items.filter(item => item.productId !== productId)
    
    if (this.wishlist.items.length !== initialLength) {
      this.save()
      this.notify()
      return true
    }
    return false
  }

  // Toggle wishlist
  toggleItem(product) {
    if (this.isInWishlist(product.id)) {
      this.removeItem(product.id)
      return false
    } else {
      this.addItem(product)
      return true
    }
  }

  // Clear wishlist
  clearWishlist() {
    this.wishlist = { items: [] }
    this.save()
    this.notify()
  }

  // Get item count
  getItemCount() {
    return this.wishlist.items.length
  }

  // Save to storage
  save() {
    storage.set('wishlist', this.wishlist)
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
    this.listeners.forEach(listener => listener(this.wishlist))
  }
}

// Singleton instance
export const wishlistStore = new WishlistStore()