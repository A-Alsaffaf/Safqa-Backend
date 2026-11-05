const router = require('express').Router()
const mongoose = require('mongoose')
const Bid = require('../models/Bid')
const verifyToken = require('../middleware/verifyToken')

router.get('/listings/:listingId/bids', async (req,res) => {
    try {
        const allBidsOnListing = await Bid.find({auction: req.params.listingId})
        res.status(200).json(allBidsOnListing)
    }
    catch(err){
        console.log(err);
        res.status(400).json({message: err.message})
    }
})

router.post('/listings/:listingId/bids', verifyToken, async(req,res) => {
    try{
        const createdBid = await Bid.create({
            auction: req.params.listingId,
            bidder: req.user._id,
            amount: req.body.amount
        })

        res.status(200).json(createdBid)
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: err.message})
    }
})
module.exports = router

// localhost:3000/listings?q=Fixed