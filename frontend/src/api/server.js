import { create, router as _router, defaults, bodyParser } from 'json-server'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = create()
const router = _router(join(__dirname, 'db.json'))

// Middleware
server.use(defaults())
server.use(bodyParser)

// Custom middleware untuk log
server.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  next()
})

// Custom routes
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const users = router.db.get('users').value()
  const user = users.find(u => u.email === email && u.password === password)
  
  if (user) {
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    res.json({
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: userWithoutPassword
    })
  } else {
    res.status(401).json({
      success: false,
      message: 'Email atau password salah'
    })
  }
})

server.get('/api/products/featured', (req, res) => {
  const products = router.db.get('products').value()
  const featured = products.filter(p => p.featured).slice(0, 8)
  res.json(featured)
})

server.get('/api/products/search', (req, res) => {
  const { q, category, minPrice, maxPrice, sort = 'newest' } = req.query
  let products = router.db.get('products').value()
  
  // Filter by search query
  if (q) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.description.toLowerCase().includes(q.toLowerCase()) ||
      p.brand.toLowerCase().includes(q.toLowerCase())
    )
  }
  
  // Filter by category
  if (category && category !== 'all') {
    products = products.filter(p => p.category === category)
  }
  
  // Filter by price range
  if (minPrice) {
    products = products.filter(p => p.finalPrice >= parseInt(minPrice))
  }
  if (maxPrice) {
    products = products.filter(p => p.finalPrice <= parseInt(maxPrice))
  }
  
  // Sort
  if (sort === 'price-asc') {
    products.sort((a, b) => a.finalPrice - b.finalPrice)
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.finalPrice - a.finalPrice)
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating)
  } else {
    // newest first (by id)
    products.sort((a, b) => b.id - a.id)
  }
  
  res.json(products)
})

// Use router
server.use('/api', router)

// Start server
const PORT = 3001
server.listen(PORT, () => {
  console.log(`
  🚀 Mock API Server running at:
  🌐 http://localhost:${PORT}
  
  📚 Available Endpoints:
  GET    /api/products          # All products
  GET    /api/products/1        # Single product
  GET    /api/products/featured # Featured products
  GET    /api/products/search   # Search with filters
  GET    /api/categories        # All categories
  
  POST   /api/auth/login        # Login
  POST   /api/carts             # Add to cart
  GET    /api/carts?userId=1    # Get user cart
  
  POST   /api/orders            # Create order
  GET    /api/orders?userId=1   # User orders
  `)
})