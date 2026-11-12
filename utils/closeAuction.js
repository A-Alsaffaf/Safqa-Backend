const Listing = require('../models/Listing')
const Order = require('../models/Order')

// When looking for Sold auctions that are missing an Order, skip ones changed in the last minute
// (their Order may still be on its way) and ones older than a week.
const REPAIR_MIN_AGE_MS = 60 * 1000
const REPAIR_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

async function createOrderForListing(listing) {
    return Order.create({
        listing: listing._id,
        buyer: listing.winner,
        seller: listing.seller,
        finalPrice: listing.currentBid,
    })
}

// Closes one auction if it is still Active and its end time has passed.
// - With a winning bid: status becomes Sold, the winner is set, and an Order is created for the winner.
// - With no bids: status becomes Closed.
// Returns the closed listing, or null if nothing was closed.
async function closeAuctionIfEnded(listing) {
    if (!listing || listing.type !== 'Auction' || listing.status !== 'Active') return null
    if (!listing.endsAt || listing.endsAt > new Date()) return null

    const hasWinner = listing.currentBidder != null && listing.currentBid != null

    // The filter only matches if the auction is still Active and currentBid has not changed
    // since we read it, so only one caller can close it (and create the Order).
    const closedListing = await Listing.findOneAndUpdate(
        {
            _id: listing._id,
            type: 'Auction',
            status: 'Active',
            endsAt: { $lte: new Date() },
            currentBid: listing.currentBid ?? null,
        },
        hasWinner
            ? { status: 'Sold', winner: listing.currentBidder }
            : { status: 'Closed' },
        { new: true }
    )

    if (!closedListing) return null

    if (hasWinner && closedListing.seller) {
        try {
            await createOrderForListing(closedListing)
        } catch (err) {
            // The listing is already Sold. createMissingOrders() will retry this on the next sweep.
            console.log(`Failed to create order for closed auction ${closedListing._id}:`, err)
        }
    }

    return closedListing
}

// Repairs auctions that were closed as Sold but never got an Order (for example if Order.create failed).
async function createMissingOrders() {
    const now = Date.now()

    const soldAuctions = await Listing.find({
        type: 'Auction',
        status: 'Sold',
        winner: { $ne: null },
        seller: { $ne: null },
        updatedAt: {
            $lte: new Date(now - REPAIR_MIN_AGE_MS),
            $gte: new Date(now - REPAIR_MAX_AGE_MS),
        },
    })

    for (const listing of soldAuctions) {
        try {
            const hasOrder = await Order.exists({ listing: listing._id })

            if (!hasOrder) {
                await createOrderForListing(listing)
                console.log(`Created missing order for sold auction ${listing._id}`)
            }
        } catch (err) {
            console.log(`Failed to create missing order for auction ${listing._id}:`, err)
        }
    }
}

// Closes every Active auction whose end time has passed, then repairs missing Orders.
// Run on a timer by server.js.
async function closeEndedAuctions() {
    try {
        const endedAuctions = await Listing.find({
            type: 'Auction',
            status: 'Active',
            endsAt: { $lte: new Date() },
        })

        for (const listing of endedAuctions) {
            try {
                await closeAuctionIfEnded(listing)
            } catch (err) {
                console.log(`Failed to close auction ${listing._id}:`, err)
            }
        }

        await createMissingOrders()
    } catch (err) {
        console.log('Auction sweep failed:', err)
    }
}

module.exports = { closeAuctionIfEnded, closeEndedAuctions }
