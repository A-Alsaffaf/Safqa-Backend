const mongoose = require("mongoose")

const ReportSchema = new mongoose.Schema({

    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    targetType: {
        type: String,
        enum: ["Auction", "Fixed"]
    },
    targetId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    },
    status: {
        type: String,
        enum: ["open", "reviewed", "dismessed"]
    },
    createdAt: {
        type: Date
    }
}, {timestamps:true})

const Report = mongoose.model("Report", ReportSchema)
module.exports = Report;