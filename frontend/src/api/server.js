import jsonServer from 'json-server'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = jsonServer.create()
const router = jsonServer.router(join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

// Middleware
server.use(middlewares)
server.use(jsonServer.bodyParser)

// Custom middleware untuk log
server.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`)
  next()
})

// Custom routes
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  // Baca data users dari db.json
  const db = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf8'))
  const users = db.users
  const user = users.find(u => u.email === email && u.password === password)
  
  if (user) {
    // Remove password dari response
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

// Featured products endpoint
server.get('/api/products/featured', (req, res) => {
  const db = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf8'))
  const featured = db.products.filter(p => p.featured).slice(0, 8)
  res.json(featured)
})

// Categories endpoint
server.get('/api/categories', (req, res) => {
  const db = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf8'))
  res.json(db.categories || [])
})

// Gunakan router
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
  GET    /api/categories        # All categories
  POST   /api/auth/login        # Login
  
  📁 Database: ${join(__dirname, 'db.json')}
  `)
})