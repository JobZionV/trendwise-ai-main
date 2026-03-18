import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import analysisRoutes from './src/routes/analysisRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', analysisRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Node.js Gateway running on http://localhost:${PORT}`);
});