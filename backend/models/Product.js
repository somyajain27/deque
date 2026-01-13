const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  barcode: String,
  name: String,
  price: Number
});

module.exports = mongoose.model("Product", ProductSchema);
