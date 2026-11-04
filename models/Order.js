const mongoose = require("mongoose")

const orderschema = new mongoose.Schema({
    listing: { type: mongoose.Types.ObjectId, ref: "Listing", required: true },
    buyer: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    finalPrice: { type: Number, required: true },
    statues: { type: String, enum: ["Pendding", "Paid", "Shipped", "Completed"], default: "Pendding" }
}, { timestamps: true })

const Order = mongoose.model("Order", orderschema)

module.exports = Order
