//register / add user
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');


// @route   GET api/auth
// @desc    Test route
// @access  Public [--> whether access token is required or not]
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.send(user);
    }
    catch (err) {
        res.status(500).json({ errors: [{ msg: 'Server Error' }] });
    }
});


// @route   POST api/auth
// @desc    Test route
// @access  Public [--> whether access token is required or not]
router.post('/', [
    check('email', 'Enter a valid email!').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error.array());
        return res.status(400).json({ errors: error.array() });
    }
    //console.log(req.body);
    const { email, password } = req.body;

    try {
        //see if user exists
        let user = await User.findOne({ email });
        if (!user) {
            //user exists
            return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }


        //return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 3600000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

        //res.send('User Registered');

    }
    catch (err) {
        console.log(err.message);
        return res.status(500).send('Server Error');
    }


});


module.exports = router;