const router = require('express').Router()
const mongoose = require('mongoose')
const User = require('../models/User')
const Listing = require('../models/Listing')
const verifyToken = require('../middleware/verifyToken')

// Everything here is for the logged-in user only
router.use(verifyToken)

// GET /watchlist: the listings the user is watching, newest added first
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'watchlist',
            populate: { path: 'seller', select: 'username' }
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // A listing that was deleted leaves null behind, and removed listings should not show up
        const listings = user.watchlist
            .filter((listing) => listing && listing.status !== 'Removed')
            .reverse()

        res.status(200).json(listings)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

// POST /watchlist/:listingId: add a listing ($addToSet means adding twice does nothing)
router.post('/:listingId', async (req, res) => {
    try {
        const { listingId } = req.params

        if (!mongoose.isValidObjectId(listingId)) {
            return res.status(400).json({ message: 'Invalid listing id' })
        }

        const listing = await Listing.findById(listingId)
        if (!listing || listing.status === 'Removed') {
            return res.status(404).json({ message: 'Listing not found' })
        }

        if (String(listing.seller) === String(req.user._id)) {
            return res.status(403).json({ message: 'You cannot watch your own listing' })
        }

        await User.findByIdAndUpdate(req.user._id, { $addToSet: { watchlist: listingId } })

        res.status(200).json({ message: 'Added to watchlist' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

// DELETE /watchlist/:listingId: remove a listing (removing one that is not there does nothing)
router.delete('/:listingId', async (req, res) => {
    try {
        const { listingId } = req.params

        if (!mongoose.isValidObjectId(listingId)) {
            return res.status(400).json({ message: 'Invalid listing id' })
        }

        await User.findByIdAndUpdate(req.user._id, { $pull: { watchlist: listingId } })

        res.status(200).json({ message: 'Removed from watchlist' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
