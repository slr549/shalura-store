import { faker } from '@faker-js/faker'

// Fungsi untuk generate produk fashion
function generateProducts(count = 20) {
  const categories = ['Pria', 'Wanita', 'Tas', 'Sepatu', 'Aksesoris']
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Gucci', 'Local Brand']
  
  return Array.from({ length: count }, (_, i) => {
    const hasDiscount = faker.datatype.boolean(0.3)
    const price = faker.number.int({ min: 50000, max: 1000000 })
    const discount = hasDiscount ? faker.number.int({ min: 10, max: 50 }) : 0
    const finalPrice = Math.round(price * (1 - discount / 100))
    
    return {
      id: i + 1,
      name: faker.commerce.productName(),
      price,
      discount,
      finalPrice,
      stock: faker.number.int({ min: 0, max: 100 }),
      description: faker.commerce.productDescription(),
      category: faker.helpers.arrayElement(categories),
      brand: faker.helpers.arrayElement(brands),
      tags: faker.helpers.arrayElements(['bestseller', 'new', 'trending', 'limited'], { min: 0, max: 3 }),
      variants: generateVariants(),
      images: generateImages(),
      featured: i < 5, // 5 produk pertama featured
      rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
      reviewCount: faker.number.int({ min: 0, max: 200 }),
      createdAt: faker.date.past({ years: 1 }).toISOString().split('T')[0]
    }
  })
}

function generateVariants() {
  const colors = ['Hitam', 'Putih', 'Biru Navy', 'Merah', 'Hijau Army', 'Abu-abu', 'Coklat', 'Krem']
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  
  return Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, (_, i) => ({
    id: i + 1,
    color: faker.helpers.arrayElement(colors),
    size: faker.helpers.arrayElement(sizes),
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    stock: faker.number.int({ min: 0, max: 50 })
  }))
}

function generateImages() {
  const imageIds = [
    '1596755094514-f87e34085b2c', // fashion 1
    '1591047139829-d91aecb6caea', // fashion 2
    '1544441892-794166f1e3be',    // fashion 3
    '1584917865442-7d5c98b1b9a2', // fashion 4
    '1523381210434-271e8f1f643a', // fashion 5
    '1549298916-b41d501d3772',    // shoes
    '1553062407-98eeb64c6a62',    // bag
    '1539185441755-769473a23570'  // accessories
  ]
  
  const count = faker.number.int({ min: 1, max: 4 })
  return Array.from({ length: count }, (_, i) => 
    `https://images.unsplash.com/photo-${faker.helpers.arrayElement(imageIds)}?w=800&h=800&fit=crop&auto=format`
  )
}

function generateUsers() {
  return [
    {
      id: 1,
      email: 'admin@store.com',
      password: 'admin123',
      name: 'Admin Store',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      email: 'user@mail.com',
      password: 'user123',
      name: 'Budi Santoso',
      role: 'customer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
      createdAt: '2024-02-15'
    }
  ]
}

// Generate database
const db = {
  products: generateProducts(25),
  users: generateUsers(),
  categories: ['Pria', 'Wanita', 'Tas', 'Sepatu', 'Aksesoris'],
  orders: [],
  carts: [
    {
      id: 1,
      userId: 2,
      items: [
        {
          productId: 1,
          variantId: 1,
          quantity: 2,
          addedAt: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    }
  ]
}

console.log('✅ Database generated:')
console.log(`   Products: ${db.products.length}`)
console.log(`   Users: ${db.users.length}`)
console.log(`   Categories: ${db.categories.length}`)

// Save to file
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

writeFileSync(
  join(__dirname, 'db.json'),
  JSON.stringify(db, null, 2)
)

console.log('📁 Database saved to src/api/db.json')