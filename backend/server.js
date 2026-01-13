const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Product = require("./models/Product");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/smartcheckout")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// API: Get product by barcode
app.get("/product/:barcode", async (req, res) => {
  const product = await Product.findOne({
    barcode: req.params.barcode
  });
  res.json(product || null);
});

app.listen(3000, () => {
  console.log("🚀 Backend running on port 3000");
});
