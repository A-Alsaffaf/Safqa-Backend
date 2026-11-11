const router = require('express').Router()
const mongoose = require('mongoose')
const Listing = require('../models/Listing')
const Category = require('../models/Category')
const Order = require('../models/Order')
const verifyToken = require('../middleware/verifyToken')


router.get('/', async (req,res) => {

    try {

        const filter = {}

        if(req.query.filter)filter.type = req.query.filter

        const allListings = await Listing.find(filter).populate('seller currentBidder category winner')

        res.status(200).json(allListings)

    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }
})


router.get('/enums', (req,res) => {
    res.status(200).json({
        type: Listing.schema.path('type').enumValues,
        condition: Listing.schema.path('condition').enumValues,
    })
})


router.post('/',verifyToken, async(req,res) => {

    try {

        const {
            title,
            description,
            type,
            condition,
            status,
            price,
            buyNowPrice,
            startingBid,
            currentBid,
            currentBidder,
            startsAt,
            endsAt,
            category,
            winner,
            images,

        } = req.body

        const createdListing = await Listing.create({
            title,
            description,
            type,
            condition,
            status,
            seller: req.user._id,
            price,
            buyNowPrice,
            startingBid,
            currentBid,
            currentBidder,
            startsAt,
            endsAt,
            category,
            winner,
            images,
        })

        res.status(201).json(createdListing)
    } 
    catch(err){
        console.log(err);
        res.status(404).json({message: err.message})
    }

})

router.get('/my-listings', verifyToken, async (req,res) => {
    try {
        const myListings = await Listing.find({seller: req.user._id})
        res.status(200).json(myListings)
    }
    catch(err) {
        console.log(err);
        res.status(404).json({message: err.message})
    }
})


router.get('/:listingId', async(req,res) => {

    try {
        // Only expose usernames for the seller and the current bidder
        const foundListing = await Listing.findById(req.params.listingId).populate('seller currentBidder', 'username')
        res.status(200).json(foundListing)
    }
    catch(err){
        console.log(err);
    }

})

router.put('/:listingId', async (req,res) => {

    try {

        const {
            title,
            description,
            condition,
            price,
            buyNowPrice,
            startingBid,
            startsAt,
            endsAt,
            category,
            images,
        } = req.body

        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.listingId,
            {
                title,
                description,
                condition,
                price,
                buyNowPrice,
                startingBid,
                startsAt,
                endsAt,
                category,
                images,
            },
            { new: true, runValidators: true }
        )

        res.status(200).json(updatedListing)
    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }

})


router.delete('/:listingId', async (req,res) => {

    try {

        const removedListing = await Listing.findByIdAndUpdate(
            req.params.listingId,
            { status: 'removed' },
            { new: true }
        )

        res.status(200).json(removedListing)
    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }

})


router.post('/:listingId/buy-now', verifyToken, async (req,res) => {

    try {

        const soldListing = await Listing.findOneAndUpdate(
            {
                _id: req.params.listingId,
                type: 'fixed',
                status: 'active',
                seller: { $ne: req.user.id },
            },
            {
                status: 'sold',
                winner: req.user.id,
            },
            { new: true }
        )

        if (!soldListing) {
            return res.status(400).json({message: 'Listing is not available to buy now'})
        }

        const createdOrder = await Order.create({
            listing: soldListing._id,
            buyer: req.user.id,
            seller: soldListing.seller,
            finalPrice: soldListing.price,
            status: 'pending',
        })

        res.status(201).json(createdOrder)
    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }

})


module.exports = router

// localhost:3000/listings?q=Fixed