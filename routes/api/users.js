//register / add user
const express = require('express');
const router = express.Router();


// @route   GET api/users
// @desc    Test route
// @access  Public [--> whether access token is required or not]
router.get('/', (req, res) => {
    res.send('User router');
});


module.exports = router;