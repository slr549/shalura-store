import { storage } from '../utils/storage.js'

class ReviewStore {
  constructor() {
    this.reviews = storage.get('reviews') || this.getMockReviews()
    this.listeners = []
  }

  // Get reviews for a product
  getReviews(productId) {
    return this.reviews.filter(review => review.productId === productId)
  }

  // Get average rating for a product
  getAverageRating(productId) {
    const productReviews = this.getReviews(productId)
    if (productReviews.length === 0) return 0
    
    const total = productReviews.reduce((sum, review) => sum + review.rating, 0)
    return total / productReviews.length
  }

  // Get rating distribution
  getRatingDistribution(productId) {
    const productReviews = this.getReviews(productId)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    
    productReviews.forEach(review => {
      distribution[review.rating]++
    })
    
    return distribution
  }

  // Add a review
  addReview(productId, reviewData) {
    const review = {
      id: Date.now(),
      productId,
      userId: reviewData.userId,
      userName: reviewData.userName,
      userAvatar: reviewData.userAvatar,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images || [],
      likes: 0,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.reviews.push(review)
    this.save()
    this.notify()
    
    return review
  }

  // Update a review
  updateReview(reviewId, updates) {
    const index = this.reviews.findIndex(r => r.id === reviewId)
    if (index !== -1) {
      this.reviews[index] = {
        ...this.reviews[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      this.save()
      this.notify()
      return true
    }
    return false
  }

  // Like a review
  likeReview(reviewId, userId) {
    const review = this.reviews.find(r => r.id === reviewId)
    if (review) {
      if (!review.likedBy) review.likedBy = []
      
      if (review.likedBy.includes(userId)) {
        // Unlike
        review.likedBy = review.likedBy.filter(id => id !== userId)
        review.likes = Math.max(0, review.likes - 1)
      } else {
        // Like
        review.likedBy.push(userId)
        review.likes++
      }
      
      this.save()
      this.notify()
      return review.likes
    }
    return null
  }

  // Check if user has reviewed a product
  hasUserReviewed(productId, userId) {
    return this.reviews.some(review => 
      review.productId === productId && review.userId === userId
    )
  }

  // Save to storage
  save() {
    storage.set('reviews', this.reviews)
  }

  // Mock data
  getMockReviews() {
    return [
      {
        id: 1,
        productId: 1,
        userId: 2,
        userName: 'Budi Santoso',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
        rating: 5,
        title: 'Kualitas sangat bagus!',
        comment: 'Bahan flanelnya premium, jahitan rapi, dan nyaman dipakai. Ukurannya pas sesuai yang diharapkan.',
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop'
        ],
        likes: 24,
        verified: true,
        createdAt: '2024-02-15T10:30:00Z',
        updatedAt: '2024-02-15T10:30:00Z'
      },
      {
        id: 2,
        productId: 1,
        userId: 3,
        userName: 'Sari Dewi',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sari',
        rating: 4,
        title: 'Warna sedikit berbeda',
        comment: 'Produknya bagus, tapi warna yang datang sedikit lebih gelap dari foto. Overall tetap puas dengan kualitasnya.',
        images: [],
        likes: 12,
        verified: true,
        createdAt: '2024-02-10T14:20:00Z',
        updatedAt: '2024-02-10T14:20:00Z'
      }
    ]
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
    this.listeners.forEach(listener => listener(this.reviews))
  }
}

// Singleton instance
export const reviewStore = new ReviewStore()