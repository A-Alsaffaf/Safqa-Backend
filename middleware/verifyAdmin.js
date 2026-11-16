const User = require('../models/User')

// Runs after verifyToken. The role is read from the database, not the token,
// so a user who stopped being an Admin loses access straight away.
async function verifyAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user._id)

    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin only' })
    }

    next()
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message })
  }
}

module.exports = verifyAdmin
