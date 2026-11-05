const router = require('express').Router()
const Category = require('../models/Category')
const Listing = require('../models/Listing')
const verifyToken = require('../middleware/verifyToken')


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


router.post('/admin/categories', verifyToken, async (req, res) => {

    try {

        const name = req.body.name

        const createdCategory = await Category.create({
            name
        })

        res.status(201).json(createdCategory)

    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }
})


router.put('/admin/categories/:categoryId', verifyToken, async (req, res) => {

    try {

        const name = req.body.name

        const updatedCategory = await Category.findByIdAndUpdate(
           
            req.params.categoryId,
            { name },
            { new: true }
        )

        res.status(200).json(updatedCategory)

    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }
})


router.delete('/admin/categories/:categoryId', verifyToken, async (req, res) => {

    try {

        const deletedCategory = await Category.findByIdAndDelete(req.params.categoryId)

        res.status(200).json(deletedCategory)

    }
    catch (err) {
        console.log(err);
        res.json({message: err.message})
    }
})


module.exports = router