const router = require('express').Router()
const Order = require('../models/Order')
const verifyToken = require('../middleware/verifyToken')
const validateObjectId = require('../middleware/validateObjectId')

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id

    const orders = await Order.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
      .populate('listing')
      .populate('buyer')
      .populate('seller')

    res.status(200).json(orders)
  } catch (err) {
    console.log(err)
    res.json({ message: err.message })
  }
})

router.get('/:id', verifyToken, validateObjectId, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('listing')
      .populate('buyer')
      .populate('seller')

    if (!order) return res.status(404).json({ message: 'Order not found' })

    const userId = req.user._id || req.user.id

    const buyerId = order.buyer._id || order.buyer
    const sellerId = order.seller._id || order.seller

    if (!buyerId.equals(userId) && !sellerId.equals(userId))
      return res.status(403).json({ error: 'Not A seller or buyer' })

    res.status(200).json(order)
  } catch (err) {
    console.log(err)
    res.json({ message: err.message })
  }
})

router.put('/:id/status', verifyToken, validateObjectId, async (req, res) => {
  try {
    const { status } = req.body

    const valid = ['Paid', 'Shipped', 'Completed']

    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' })

    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ error: 'Order not found' })

    const userId = req.user._id || req.user.id

    const buyerId = order.buyer._id || order.buyer
    const sellerId = order.seller._id || order.seller

    if (!buyerId.equals(userId) && !sellerId.equals(userId))
      return res.status(403).json({ error: 'Not a buyer or seller' })

    order.statues = status

    await order.save()
    res.status(200).json({ message: 'Order status updated', order })
  } catch (err) {
    console.log(err)
    res.json({ message: err.message })
  }
})

module.exports = router