const router = require('express').Router()
const Category = require('../models/Category')
const Listing = require('../models/Listing')
const mongoose = require('mongoose')
const verifyToken = require('../middleware/verifyToken')
const verifyAdmin = require('../middleware/verifyAdmin')


router.get('/categories', async (req, res) => {

    try {

        const allCategories = await Category.find()

        res.status(200).json(allCategories)

    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }
})


router.get('/categories/:categoryId', async (req, res) => {

    try {

        const foundListings = await Listing.find({ category: req.params.categoryId }).populate('category seller')

        res.status(200).json(foundListings)

    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }
})


// Admin only: create, rename and delete categories
router.post('/admin/categories', verifyToken, verifyAdmin, async (req, res) => {

    try {

        const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''

        if (!name) {
            return res.status(400).json({message: 'Category name is required'})
        }

        const createdCategory = await Category.create({
            name
        })

        res.status(201).json(createdCategory)

    }
    catch (err) {
        console.log(err);
        res.status(500).json({message: err.message})
    }
})


router.put('/admin/categories/:categoryId', verifyToken, verifyAdmin, async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.categoryId)) {
            return res.status(400).json({message: 'Invalid category id'})
        }

        const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''

        if (!name) {
            return res.status(400).json({message: 'Category name is required'})
        }

        const updatedCategory = await Category.findByIdAndUpdate(

            req.params.categoryId,
            { name },
            { new: true }
        )

        if (!updatedCategory) {
            return res.status(404).json({message: 'Category not found'})
        }

        res.status(200).json(updatedCategory)

    }
    catch (err) {
        console.log(err);
        res.status(500).json({message: err.message})
    }
})


router.delete('/admin/categories/:categoryId', verifyToken, verifyAdmin, async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.categoryId)) {
            return res.status(400).json({message: 'Invalid category id'})
        }

        const deletedCategory = await Category.findByIdAndDelete(req.params.categoryId)

        if (!deletedCategory) {
            return res.status(404).json({message: 'Category not found'})
        }

        res.status(200).json(deletedCategory)

    }
    catch (err) {
        console.log(err);
        res.status(500).json({message: err.message})
    }
})


module.exports = router