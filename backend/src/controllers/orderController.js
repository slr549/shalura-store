// src/controllers/orderController.js
const { 
  Order, 
  OrderItem, 
  Cart, 
  CartItem, 
  Product, 
  ProductVariant, 
  UserAddress,
  sequelize 
} = require('../models');
const { v4: uuidv4 } = require('uuid');

// Create order from cart
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      shippingAddressId, 
      billingAddressId, 
      paymentMethod, 
      notes 
    } = req.body;
    
    // Get user cart
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        include: [Product, ProductVariant]
      }],
      transaction
    });
    
    if (!cart || cart.cart_items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Validate addresses
    const shippingAddress = await UserAddress.findOne({
      where: { id: shippingAddressId, user_id: req.user.id },
      transaction
    });
    
    if (!shippingAddress) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping address'
      });
    }
    
    const billingAddress = billingAddressId 
      ? await UserAddress.findOne({
          where: { id: billingAddressId, user_id: req.user.id },
          transaction
        })
      : shippingAddress;
    
    // Calculate totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const cartItem of cart.cart_items) {
      // Check stock
      const stock = cartItem.variant_id 
        ? cartItem.product_variant.stock_quantity 
        : cartItem.product.stock_quantity;
      
      if (stock < cartItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${cartItem.product.name}`
        });
      }
      
      // Calculate item total
      const itemTotal = cartItem.price * cartItem.quantity;
      subtotal += itemTotal;
      
      // Prepare order item
      orderItems.push({
        product_id: cartItem.product_id,
        variant_id: cartItem.variant_id,
        product_name: cartItem.product.name,
        variant_name: cartItem.product_variant?.value,
        quantity: cartItem.quantity,
        unit_price: cartItem.price,
        total_price: itemTotal,
        image_url: cartItem.product.product_images?.[0]?.url
      });
      
      // Update stock
      if (cartItem.variant_id) {
        await ProductVariant.decrement('stock_quantity', {
          by: cartItem.quantity,
          where: { id: cartItem.variant_id },
          transaction
        });
        
        await Product.decrement('stock_quantity', {
          by: cartItem.quantity,
          where: { id: cartItem.product_id },
          transaction
        });
      } else {
        await Product.decrement('stock_quantity', {
          by: cartItem.quantity,
          where: { id: cartItem.product_id },
          transaction
        });
      }
    }
    
    // Calculate shipping (simplified)
    const shippingCost = subtotal > 300000 ? 0 : 15000;
    
    // Calculate total
    const taxAmount = subtotal * 0.11; // 11% PPN
    const totalAmount = subtotal + shippingCost + taxAmount;
    
    // Create order
    const order = await Order.create({
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      user_id: req.user.id,
      status: 'pending',
      subtotal,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: 'pending',
      shipping_address_id: shippingAddressId,
      billing_address_id: billingAddressId || shippingAddressId,
      notes,
      estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    }, { transaction });
    
    // Create order items
    for (const itemData of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...itemData
      }, { transaction });
    }
    
    // Clear cart
    await CartItem.destroy({
      where: { cart_id: cart.id },
      transaction
    });
    
    await transaction.commit();
    
    // Get full order details
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: UserAddress,
          as: 'shipping_address'
        },
        {
          model: UserAddress,
          as: 'billing_address'
        }
      ]
    });
    
    // TODO: Send order confirmation email
    
    res.status(201).json({
      success: true,
      order: fullOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where: { user_id: req.user.id },
      include: [{
        model: OrderItem,
        limit: 2 // Show only 2 items in list view
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: UserAddress,
          as: 'shipping_address'
        },
        {
          model: UserAddress,
          as: 'billing_address'
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
        status: ['pending', 'confirmed', 'processing']
      },
      include: [OrderItem],
      transaction
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }
    
    // Restock items
    for (const orderItem of order.order_items) {
      if (orderItem.variant_id) {
        await ProductVariant.increment('stock_quantity', {
          by: orderItem.quantity,
          where: { id: orderItem.variant_id },
          transaction
        });
      }
      
      await Product.increment('stock_quantity', {
        by: orderItem.quantity,
        where: { id: orderItem.product_id },
        transaction
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    order.cancelled_at = new Date();
    await order.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};