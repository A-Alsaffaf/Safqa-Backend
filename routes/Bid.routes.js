const router = require('express').Router()
const mongoose = require('mongoose')
const Listing = require('../models/Listing')
const Category = require('../models/Category')
const Order = require('../models/Order')
const Bid = require('../models/Bid')
const verifyToken = require('../middleware/verifyToken')

router.get('/listings/')
module.exports = router

// localhost:3000/listings?q=Fixed