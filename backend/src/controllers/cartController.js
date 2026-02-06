// src/controllers/cartController.js
const { Cart, CartItem, Product, ProductVariant, sequelize } = require('../models');

// Get or create cart for user
const getOrCreateCart = async (userId, sessionId = null) => {
  let cart;
  
  if (userId) {
    // User is logged in
    cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{
        model: CartItem,
        include: [Product, ProductVariant]
      }]
    });
    
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }
  } else if (sessionId) {
    // User is guest (has session)
    cart = await Cart.findOne({
      where: { session_id: sessionId },
      include: [{
        model: CartItem,
        include: [Product, ProductVariant]
      }]
    });
    
    if (!cart) {
      cart = await Cart.create({ session_id: sessionId });
    }
  } else {
    // Create new session cart
    const sessionId = require('uuid').v4();
    cart = await Cart.create({ session_id: sessionId });
  }
  
  return cart;
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user?.id, req.cookies?.sessionId);
    
    // Set session cookie if not set
    if (!req.cookies?.sessionId && cart.session_id) {
      res.cookie('sessionId', cart.session_id, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true
      });
    }
    
    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    
    // Validate product
    const product = await Product.findByPk(productId);
    if (!product || !product.is_active) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Validate variant if provided
    let variant = null;
    if (variantId) {
      variant = await ProductVariant.findByPk(variantId);
      if (!variant || variant.product_id !== productId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid variant'
        });
      }
      
      // Check variant stock
      if (variant.stock_quantity < quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for selected variant'
        });
      }
    } else {
      // Check product stock
      if (product.stock_quantity < quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    }
    
    // Get or create cart
    const cart = await getOrCreateCart(req.user?.id, req.cookies?.sessionId);
    
    // Calculate price
    let price = product.price;
    if (product.discount_percent > 0) {
      price = price * (1 - product.discount_percent / 100);
    }
    if (variant?.price_adjustment) {
      price += variant.price_adjustment;
    }
    
    // Check if item already in cart
    const existingItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id: productId,
        variant_id: variantId || null
      },
      transaction
    });
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
      existingItem.price = price;
      await existingItem.save({ transaction });
    } else {
      // Create new cart item
      await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        variant_id: variantId,
        quantity,
        price
      }, { transaction });
    }
    
    await transaction.commit();
    
    // Get updated cart
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [{
        model: CartItem,
        include: [Product, ProductVariant]
      }]
    });
    
    res.status(200).json({
      success: true,
      cart: updatedCart,
      message: 'Item added to cart'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;
    
    // Find cart item
    const cartItem = await CartItem.findByPk(cartItemId, {
      include: [Product, ProductVariant],
      transaction
    });
    
    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }
    
    // Check stock
    const stock = cartItem.variant_id 
      ? cartItem.product_variant.stock_quantity 
      : cartItem.product.stock_quantity;
    
    if (stock < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }
    
    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      cartItem,
      message: 'Cart updated'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    
    const cartItem = await CartItem.findByPk(cartItemId);
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }
    
    await cartItem.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user?.id, req.cookies?.sessionId);
    
    await CartItem.destroy({
      where: { cart_id: cart.id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};