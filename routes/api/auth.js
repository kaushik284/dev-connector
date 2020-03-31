//register / add user
const express = require('express');
const router = express.Router();


// @route   GET api/auth
// @desc    Test route
// @access  Public [--> whether access token is required or not]
router.get('/', (req, res) => {
    res.send('Auth router');
});


module.exports = router;