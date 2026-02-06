// src/controllers/productController.js
const { Product, Category, Brand, ProductImage, ProductVariant, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper function to build where clause
const buildWhereClause = (filters) => {
  const where = { is_active: true };
  
  if (filters.category) {
    where.category_id = filters.category;
  }
  
  if (filters.brand) {
    where.brand_id = filters.brand;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    where.final_price = {};
    if (filters.minPrice) {
      where.final_price[Op.gte] = filters.minPrice;
    }
    if (filters.maxPrice) {
      where.final_price[Op.lte] = filters.maxPrice;
    }
  }
  
  if (filters.rating) {
    where.rating = { [Op.gte]: filters.rating };
  }
  
  if (filters.inStock) {
    where.stock_quantity = { [Op.gt]: 0 };
  }
  
  if (filters.onSale) {
    where.discount_percent = { [Op.gt]: 0 };
  }
  
  if (filters.featured) {
    where.is_featured = true;
  }
  
  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${filters.search}%` } },
      { description: { [Op.iLike]: `%${filters.search}%` } },
      { '$brand.name$': { [Op.iLike]: `%${filters.search}%` } }
    ];
  }
  
  return where;
};

// Get all products with filtering and pagination
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    const filters = {
      category: req.query.category,
      brand: req.query.brand,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      rating: req.query.rating ? parseFloat(req.query.rating) : null,
      inStock: req.query.inStock === 'true',
      onSale: req.query.onSale === 'true',
      featured: req.query.featured === 'true',
      search: req.query.search
    };
    
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    
    const where = buildWhereClause(filters);
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Brand,
          attributes: ['id', 'name', 'slug', 'logo_url']
        },
        {
          model: ProductImage,
          attributes: ['id', 'url', 'alt_text', 'sort_order'],
          limit: 3
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`
              CASE 
                WHEN discount_percent > 0 
                THEN price - (price * discount_percent / 100)
                ELSE price
              END
            `),
            'final_price'
          ]
        ]
      },
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true
    });
    
    // Calculate final price for each product
    const productsWithFinalPrice = products.map(product => {
      const productData = product.toJSON();
      if (productData.discount_percent > 0) {
        productData.final_price = Math.round(
          productData.price * (1 - productData.discount_percent / 100)
        );
      } else {
        productData.final_price = productData.price;
      }
      return productData;
    });
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      products: productsWithFinalPrice
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Brand,
          attributes: ['id', 'name', 'slug', 'logo_url']
        },
        {
          model: ProductImage,
          attributes: ['id', 'url', 'alt_text', 'sort_order'],
          order: [['sort_order', 'ASC'], ['is_primary', 'DESC']]
        },
        {
          model: ProductVariant,
          attributes: ['id', 'sku', 'name', 'value', 'price_adjustment', 'stock_quantity', 'image_url'],
          order: [['sort_order', 'ASC']]
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Increment view count
    await product.increment('view_count', { by: 1 });
    
    // Calculate final price
    const productData = product.toJSON();
    if (productData.discount_percent > 0) {
      productData.final_price = Math.round(
        productData.price * (1 - productData.discount_percent / 100)
      );
    } else {
      productData.final_price = productData.price;
    }
    
    // Calculate variant prices
    if (productData.product_variants) {
      productData.product_variants = productData.product_variants.map(variant => ({
        ...variant,
        final_price: productData.final_price + (variant.price_adjustment || 0)
      }));
    }
    
    res.status(200).json({
      success: true,
      product: productData
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        is_featured: true,
        is_active: true,
        stock_quantity: { [Op.gt]: 0 }
      },
      include: [
        {
          model: ProductImage,
          attributes: ['url'],
          where: { is_primary: true },
          required: false
        }
      ],
      limit: 8,
      order: [['created_at', 'DESC']]
    });
    
    // Calculate final prices
    const productsWithPrices = products.map(product => {
      const productData = product.toJSON();
      if (productData.discount_percent > 0) {
        productData.final_price = Math.round(
          productData.price * (1 - productData.discount_percent / 100)
        );
      } else {
        productData.final_price = productData.price;
      }
      return productData;
    });
    
    res.status(200).json({
      success: true,
      products: productsWithPrices
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'slug', 'image_url', 'parent_id'],
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'slug', 'logo_url'],
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: false,
      brands
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Create product
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.update(req.body);
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Soft delete
    await product.update({ is_active: false });
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};