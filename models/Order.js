const mongoose = require("mongoose")

const orderschema = new mongoose.Schema({
    id:{type:mongoose.Schema.ObjectId} ,
    listing:{type:mongoose.Schema.ObjectId , ref:"Listing"},    
    buyer:{type:mongoose.Schema.ObjectId , ref:"User"} , 
    finalPrice: {type:Number , require:true} , 
    statues:{enum:["Pendding" , "Paid" , "Shipped" , "Completed"] , default:"Pendding"} 
},{timestamps:true})

const Order = mongoose.model("Order" , orderschema)

module.exports = Order
