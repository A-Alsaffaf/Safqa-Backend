const router = require('express').Router()
const mongoose = require('mongoose')
const Bid = require('../models/Bid')
const Listing = require('../models/Listing')
const verifyToken = require('../middleware/verifyToken')

router.get('/listings/:listingId/bids', async (req,res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.listingId)) {
            return res.status(400).json({message: 'Invalid listing id'})
        }

        // Highest bid first. Only expose the bidder's username
        const allBidsOnListing = await Bid.find({auction: req.params.listingId})
            .populate('bidder', 'username')
            .sort({amount: -1, createdAt: 1})

        res.status(200).json(allBidsOnListing)
    }
    catch(err){
        console.log(err);
        res.status(400).json({message: err.message})
    }
})

router.post('/listings/:listingId/bids', verifyToken, async(req,res) => {
    try{
        const { listingId } = req.params
        const amount = Number(req.body.amount)

        if (!mongoose.isValidObjectId(listingId)) {
            return res.status(400).json({message: 'Invalid listing id'})
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({message: 'Bid amount must be a positive number'})
        }

        const listing = await Listing.findById(listingId)

        if (!listing) {
            return res.status(404).json({message: 'Listing not found'})
        }

        if (listing.type !== 'Auction') {
            return res.status(400).json({message: 'Bids can only be placed on auctions'})
        }

        if (listing.status !== 'Active') {
            return res.status(400).json({message: 'This auction is not active'})
        }

        if (listing.seller && listing.seller.toString() === req.user._id) {
            return res.status(403).json({message: 'You cannot bid on your own listing'})
        }

        const now = new Date()

        if (listing.startsAt && now < listing.startsAt) {
            return res.status(400).json({message: 'This auction has not started yet'})
        }

        if (listing.endsAt && now >= listing.endsAt) {
            return res.status(400).json({message: 'This auction has ended'})
        }

        // First bid must meet the starting bid, later bids must beat the current bid
        const hasBids = listing.currentBid != null

        if (hasBids && amount <= listing.currentBid) {
            return res.status(400).json({message: `Your bid must be higher than the current bid (BD ${listing.currentBid})`})
        }

        if (!hasBids && listing.startingBid != null && amount < listing.startingBid) {
            return res.status(400).json({message: `Your bid must be at least the starting bid (BD ${listing.startingBid})`})
        }

        // Update the listing only if currentBid is still what we validated against.
        // If someone else bid in the meantime, nothing matches and we reject this bid.
        const updatedListing = await Listing.findOneAndUpdate(
            {
                _id: listingId,
                status: 'Active',
                currentBid: hasBids ? listing.currentBid : null,
            },
            {
                currentBid: amount,
                currentBidder: req.user._id,
            },
            { new: true, runValidators: true }
        )

        if (!updatedListing) {
            return res.status(409).json({message: 'Another bid was placed first. Please bid again'})
        }

        const createdBid = await Bid.create({
            auction: listingId,
            bidder: req.user._id,
            amount,
            placedAt: now
        })

        res.status(201).json(createdBid)
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: err.message})
    }
})
module.exports = router

// localhost:3000/listings?q=Fixed
