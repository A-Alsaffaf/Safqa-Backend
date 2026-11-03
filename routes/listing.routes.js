const router = require('express').Router()
const mongoose = require('mongoose')
const Listing = require('../models/Listing')
const Category = require('../models/Category')
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


router.post('/', async(req,res) => {

    try {

        const {
            title,
            description,
            type,
            condition,
            status,
            seller,
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
            seller,
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
    }

})



module.exports = router

// localhost:3000/listings?q=Fixed