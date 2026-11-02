const mongoose = require("mongoose");


const BidSchema = new mongoose.Schema({

    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"

    },


    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    amount: {
        type: Number

    } , 
    placedAt:{

        type:Date
    }

})

const Bid = mongoose.model("Bid" , BidSchema)

module.exports = Bid;