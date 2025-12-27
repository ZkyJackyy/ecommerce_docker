const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');
const { sequelize, connectWithRetry } = require('./database');

const app = express();
app.use(cors({
  origin: '*', // sementara (development)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= MODEL =================
const Product = sequelize.define('Product', {
  name: DataTypes.STRING,
  price: DataTypes.FLOAT,
  description: DataTypes.TEXT,
});

// ================= ROUTES =================
const success = (res, message, data = null) =>
  res.status(200).json({ message, data });

const error = (res, status, message) =>
  res.status(status).json({ success: false, message });

app.get('/products', async (req, res) => {
  try {
    const data = await Product.findAll();
    success(res, 'Products retrieved successfully', data);
  } catch {
    error(res, 500, 'Failed to retrieve products');
  }
});

app.get('/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return error(res, 404, 'Product not found');
  success(res, 'Product retrieved successfully', product);
});

app.post('/products', async (req, res) => {
  const { name, price, description } = req.body;
  if (!name || !price) return error(res, 400, 'Name and Price are required');

  const product = await Product.create({ name, price, description });
  success(res, 'Product created successfully', product);
});

app.put('/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return error(res, 404, 'Product not found');

  await product.update(req.body);
  success(res, 'Product updated successfully', product);
});

app.delete('/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return error(res, 404, 'Product not found');

  await product.destroy();
  success(res, 'Product deleted successfully');
});

// ================= BOOTSTRAP =================
const startServer = async () => {
  await connectWithRetry();               // ⏳ tunggu DB
  await sequelize.sync({ alter: true });  // 📦 sync table

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`🚀 Product service running on port ${PORT}`)
  );
};

startServer();
