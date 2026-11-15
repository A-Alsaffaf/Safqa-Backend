const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueName + path.extname(file.originalname))
    },
})

function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only image files are allowed'))
    }
}

const upload = multer({
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
})

module.exports = upload
