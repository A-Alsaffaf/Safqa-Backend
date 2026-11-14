const router = require('express').Router()
const mongoose = require('mongoose')
const Listing = require('../models/Listing')
const Category = require('../models/Category')
const Order = require('../models/Order')
const verifyToken = require('../middleware/verifyToken')
const { closeAuctionIfEnded } = require('../utils/closeAuction')


router.get('/', async (req,res) => {

    try {

        const filter = {}

        // Only filter by a real listing type ("Fixed" or "Auction"), ignore anything else
        if (Listing.schema.path('type').enumValues.includes(req.query.filter)) {
            filter.type = req.query.filter
        }

        // People are populated with their username only, so emails are not sent to visitors
        const allListings = await Listing.find(filter)
            .populate('seller currentBidder winner', 'username')
            .populate('category')

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
            price,
            buyNowPrice,
            startingBid,
            startsAt,
            endsAt,
            category,
            images,

        } = req.body

        // status, currentBid, currentBidder and winner are set by the server, never by the request,
        // so a new listing always starts Active with no bids and no winner
        const createdListing = await Listing.create({
            title,
            description,
            type,
            condition,
            seller: req.user._id,
            price,
            buyNowPrice,
            startingBid,
            startsAt,
            endsAt,
            category,
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
        // If this auction's end time has passed, close it first so the page shows the final state
        await closeAuctionIfEnded(await Listing.findById(req.params.listingId))

        // Only expose usernames for the seller, the current bidder and the winner
        const foundListing = await Listing.findById(req.params.listingId).populate('seller currentBidder winner', 'username')
        res.status(200).json(foundListing)
    }
    catch(err){
        console.log(err);
    }

})

router.put('/:listingId', verifyToken, async (req,res) => {

    try {

        const { listingId } = req.params

        if (!mongoose.isValidObjectId(listingId)) {
            return res.status(400).json({message: 'Invalid listing id'})
        }

        const listing = await Listing.findById(listingId)

        if (!listing) {
            return res.status(404).json({message: 'Listing not found'})
        }

        if (!listing.seller || listing.seller.toString() !== req.user._id) {
            return res.status(403).json({message: 'Only the seller can edit this listing'})
        }

        if (listing.status !== 'Active') {
            return res.status(400).json({message: 'Only active listings can be edited'})
        }

        // Only these fields can be edited. type, status and seller are never read from the body.
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

        const changes = { title, description, condition, category, images }

        // Fixed listings change their price. Auctions can change their bidding terms until the first bid.
        // Fields left undefined are ignored by Mongoose, so they keep their saved value.
        const hasBids = listing.type === 'Auction' && listing.currentBid != null

        if (listing.type === 'Fixed') {
            changes.price = price
        } else if (!hasBids) {
            Object.assign(changes, { buyNowPrice, startingBid, startsAt, endsAt })
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            listingId,
            changes,
            { new: true, runValidators: true }
        )

        res.status(200).json(updatedListing)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({message: err.message})
    }

})


router.delete('/:listingId', verifyToken, async (req,res) => {

    try {

        const { listingId } = req.params

        if (!mongoose.isValidObjectId(listingId)) {
            return res.status(400).json({message: 'Invalid listing id'})
        }

        const listing = await Listing.findById(listingId)

        if (!listing) {
            return res.status(404).json({message: 'Listing not found'})
        }

        if (!listing.seller || listing.seller.toString() !== req.user._id) {
            return res.status(403).json({message: 'Only the seller can remove this listing'})
        }

        if (listing.status !== 'Active') {
            return res.status(400).json({message: 'Only active listings can be removed'})
        }

        // Removing an auction that has bids would strand the bidders
        if (listing.type === 'Auction' && listing.currentBid != null) {
            return res.status(400).json({message: 'An auction that has bids cannot be removed'})
        }

        listing.status = 'Removed'
        await listing.save()

        res.status(200).json(listing)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({message: err.message})
    }

})


router.post('/:listingId/buy-now', verifyToken, async (req,res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.listingId)) {
            return res.status(400).json({message: 'Invalid listing id'})
        }

        const { listingId } = req.params
        const listing = await Listing.findById(listingId)

        if (!listing) {
            return res.status(404).json({message: 'Listing not found'})
        }

        if (listing.seller && listing.seller.toString() === req.user._id) {
            return res.status(403).json({message: 'You cannot buy your own listing'})
        }

        if (listing.status !== 'Active') {
            return res.status(400).json({message: 'Listing is not available to buy now'})
        }

        // What the buyer pays, which listing it must still match, and what the sale changes
        let finalPrice, filter, update

        if (listing.type === 'Fixed') {
            finalPrice = listing.price
            filter = { _id: listingId, type: 'Fixed', status: 'Active', seller: { $ne: req.user._id } }
            update = { status: 'Sold', winner: req.user._id }
        }
        else {
            const now = new Date()

            if (listing.buyNowPrice == null) {
                return res.status(400).json({message: 'This auction has no buy now price'})
            }

            if (listing.startsAt && now < listing.startsAt) {
                return res.status(400).json({message: 'This auction has not started yet'})
            }

            if (listing.endsAt && now >= listing.endsAt) {
                return res.status(400).json({message: 'This auction has ended'})
            }

            if (listing.currentBid != null && listing.currentBid >= listing.buyNowPrice) {
                return res.status(400).json({message: 'A bid has already reached the buy now price'})
            }

            // Buying now sells the auction at the buy now price. Setting currentBid and currentBidder
            // keeps the page ("Sold to ... for BD ...") and the Order repair in closeAuction.js correct.
            finalPrice = listing.buyNowPrice
            filter = {
                _id: listingId,
                type: 'Auction',
                status: 'Active',
                seller: { $ne: req.user._id },
                currentBid: listing.currentBid ?? null,
            }
            if (listing.endsAt) filter.endsAt = { $gt: now }
            update = { status: 'Sold', winner: req.user._id, currentBid: finalPrice, currentBidder: req.user._id }
        }

        // Only one buyer can win this update: it matches only while the listing is unchanged since it was read.
        // For an auction that also means no bid arrived and it did not close in the meantime.
        const soldListing = await Listing.findOneAndUpdate(filter, update, { new: true })

        if (!soldListing) {
            if (listing.type === 'Auction') {
                return res.status(409).json({message: 'The auction changed while you were buying. Please refresh and try again'})
            }
            return res.status(400).json({message: 'Listing is not available to buy now'})
        }

        // No status is set, so the Order model's default applies (same as auction closing)
        const createdOrder = await Order.create({
            listing: soldListing._id,
            buyer: req.user._id,
            seller: soldListing.seller,
            finalPrice,
        })

        res.status(201).json(createdOrder)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({message: err.message})
    }

})


module.exports = router

// localhost:3000/listings?q=Fixed