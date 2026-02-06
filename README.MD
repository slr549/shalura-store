backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── ...
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── ...
│   ├── utils/
│   │   ├── helpers.js
│   │   └── validators.js
│   └── app.js
├── uploads/
├── .env
├── .gitignore
└── server.js