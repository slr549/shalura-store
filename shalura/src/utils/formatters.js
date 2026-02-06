export const formatters = {
  currency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  },

  date(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  },

  rating(stars) {
    return stars.toFixed(1)
  },

  discountPercentage(original, discounted) {
    return Math.round(((original - discounted) / original) * 100)
  },
}