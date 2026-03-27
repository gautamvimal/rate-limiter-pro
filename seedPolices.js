require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const RatePolicy = require('./models/RatePolicy');

const seed = async () => {
  await connectDB();

  await RatePolicy.deleteMany();

  await RatePolicy.insertMany([
    {
      tier: "FREE",
      endpoint: "/api/test",
      maxRequests: 5,
      windowSize: 60
    },
    {
      tier: "PRO",
      endpoint: "/api/test",
      maxRequests: 50,
      windowSize: 60
    },
    {
      tier: "ADMIN",
      endpoint: "/api/test",
      maxRequests: 1000,
      windowSize: 60
    }
  ]);

  console.log("Policies Seeded ✅");
  process.exit();
};

seed();