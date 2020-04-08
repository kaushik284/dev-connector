//register / add user
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');



// @route   GET api/profile/me
// @desc    get current profile based on user id
// @access  Private
router.get('/me', auth, async (req, res) => {
    //get 
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',
            ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile
// @desc    create/update profile for user
// @access  Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        linkedin,
        instagram
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) {
        profileFields.company = company;
    }
    if (location) {
        profileFields.location = location;
    }
    if (bio) {
        profileFields.bio = bio;
    }
    if (status) {
        profileFields.status = status;
    }
    if (githubusername) {
        profileFields.githubusername = githubusername;
    }
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    //console.log(profileFields.social.twitter);
    console.log(profileFields);

    //insert/update data

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            //update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile);
        }
        //create
        profile = new Profile(profileFields);

        await profile.save();
        return res.json(profile);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


// @route   GET api/profile
// @desc    GET all profiles
// @access  Public
router.get('/', async (req, res) => {
    //get 
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);

        res.json(profiles);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');

    }
});

// @route   GET api/profile/user/:user_id
// @desc    GET profile based on user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    //get 
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user',
            ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }

        res.json(profile);

    }
    catch (err) {
        console.error(err.message);
        if (err.message.includes('ObjectId')) {
            res.status(400).json({ msg: 'Profile not found' });
        }
        else {
            res.status(500).send('Server Error');
        }
    }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    //get 
    try {
        let message = '';
        //@todo - Remove users posts

        // Remove profile
        const delProfile = await Profile.findOneAndDelete({ user: req.user.id });
        if (delProfile) {
            message = 'Profile Deleted';
        }
        else {
            message = 'Profile is not created';
        }
        // Remove user
        const delUser = await User.findOneAndDelete({ _id: req.user.id });
        if (!delUser) {
            console.log('User does not exist');
            return res.status(400).json({ msg: 'User does not exist' });
            //throw Error('User does not exist');
        }
        else {
            message = message + ' User deleted';
        }

        res.json({ msg: message });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Put/Add/Update experience 
// @access  Private
router.put('/experience', [auth,
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };
    console.log(newExp);
    try {

        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);
        console.log(profile);
        await profile.save();

        res.json(profile);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        //get profile
        const profile = await Profile.findOne({ user: req.user.id });

        //get index for removal
        const remIndex = profile.experience.map(exp => exp.id)
            .indexOf(req.params.exp_id);
        console.log(remIndex);
        if (remIndex >= 0) {
            /*splice(<start Index; 
                negative indicates pos from end of array>, 
            <no. of elems to be removed; 0 for no removal>,
            <optional: new items to be added to array>
            )
            */
            profile.experience.splice(remIndex, 1);

            await profile.save();

            res.json(profile);
        }
        else {
            res.status(400).json({ msg: 'Experience does not exist' });
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT api/profile/education
// @desc    Put/Add/Update education 
// @access  Private
router.put('/education', [auth,
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study date is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };
    console.log(newEdu);
    try {

        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);
        console.log(profile);
        await profile.save();

        res.json(profile);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        //get profile
        const profile = await Profile.findOne({ user: req.user.id });

        //get index for removal
        const remIndex = profile.education.map(edu => edu.id)
            .indexOf(req.params.edu_id);
        console.log(remIndex);
        if (remIndex >= 0) {
            /*splice(<start Index; 
                negative indicates pos from end of array>, 
            <no. of elems to be removed; 0 for no removal>,
            <optional: new items to be added to array>
            )
            */
            profile.education.splice(remIndex, 1);

            await profile.save();

            res.json(profile);
        }
        else {
            res.status(400).json({ msg: 'Education does not exist' });
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;