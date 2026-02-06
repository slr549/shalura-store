// server.js
const app = require('./src/app');
const env = require('./src/config/env');
const sequelize = require('./src/config/database');

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    // Sync models (in development)
    if (env.NODE_ENV === 'development') {
      sequelize.sync({ alter: true })
        .then(() => console.log('✅ Database synced'))
        .catch(err => console.error('❌ Database sync error:', err));
    }
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}${env.API_PREFIX}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});