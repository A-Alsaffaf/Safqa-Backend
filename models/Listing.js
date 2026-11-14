const mongoose  = require('mongoose')

const listingSchema = new mongoose.Schema({
    title: {
        type: String, 
        trim: true,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 20,
        maxLength: 100
    },
    type: {
        type: String,
        enum: ['Fixed', 'Auction'],
        default: 'Fixed',
    },
    condition: {
        type: String,
        enum: ['New', 'Used', 'Damaged'],
        required: true,
    }, 
    status: {
        type: String,
        enum: ['Active', 'Sold', 'Closed', 'Removed'],
        default: 'Active'
    },
    seller: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    price: {
        type: Number,
        min: 1
    },
    buyNowPrice: {
        type: Number,
        min: 1
    },
    startingBid: {
        type: Number,
        min: 1
    },
    currentBid: {
        type: Number,
        min: 1
    },
    currentBidder: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    startsAt: {
        type: Date
    },
    endsAt: {
        type: Date
    },
    category: {
        type: [mongoose.Types.ObjectId],
        ref: 'Category',
        validate: {
            validator: (categories) => categories.length <= 5,
            message: 'A listing can have at most 5 categories'
        }
    },
    winner: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    images: {
        type: [String],
        trim: true
    }
}, {timestamps: true})

const Listing = mongoose.model('Listing', listingSchema)

module.exports = Listing