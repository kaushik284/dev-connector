//register / add user
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
//importing express-validator and check
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const config = require('config');


// @route   GET api/users
// @desc    Test route
// @access  Public [--> whether access token is required or not]
// router.get('/', (req, res) => {
//     res.send('User router');
// });

// @route   POST api/users
// @desc    Test route
// @access  Public [--> whether access token is required or not]
router.post('/', [
    check('name', 'Name is required!').not().isEmpty(),
    check('email', 'Enter a valid email!').isEmail(),
    check('password', 'Enter a password with 6 or more characters').isLength(6)
], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error.array());
        return res.status(400).json({ errors: error.array() });
    }
    //console.log(req.body);
    const { name, email, password } = req.body;

    try {
        //see if user exists
        let user = await User.findOne({ email });
        if (user) {
            //user already exists send error
            return res.status(400).json({ errors: [{ msg: "User already exists" }] });
        }
        //get user's gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        });
        //encrypt password using bcrypt
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);

        await user.save();
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