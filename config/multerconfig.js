const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Define storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images/uploads')); // Correct path
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(16, (err, buffer) => { // Correct usage of randomBytes
            if (err) return cb(err);
            const filename = buffer.toString('hex') + path.extname(file.originalname);
            cb(null, filename);
        });
    }
});

// Create multer instance
const upload = multer({ storage: storage });

module.exports = upload;
