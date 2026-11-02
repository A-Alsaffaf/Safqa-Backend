const mongoose = require("mongoose")

const categoryschema = new mongoose.Schema({
    id:{type:mongoose.Schema.ObjectId} , 
    name:{type:String , require:true} 
})

const Category = mongoose.model("Category" , categoryschema)

module.exports = Category