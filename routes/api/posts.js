//register / add user
const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    POST a comment
// @access  Private
router.post('/', [auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    try {
        //get user details from db
        const user = await User.findById(req.user.id).select('-password');

        //create new post object containing the comment and user details
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        //save the comment posted
        const post = await newPost.save();
        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route   GET api/posts
// @desc    GET all posts
// @access  Private
router.get('/', auth, async (req, res) => {
    try {

        // sort by most recent
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');

    }
});

// @route   GET api/posts/:id
// @desc    GET posts by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {

        // sort by most recent
        const posts = await Post.findById(req.params.id);
        if (!posts)
            return res.status(404).json({ msg: 'Post not found ' });

        res.json(posts);

    } catch (err) {
        console.error(err.message);
        if (err.message.includes('ObjectId'))
            return res.status(404).json({ msg: 'Post not found ' });

        res.status(500).send('Server Error');

    }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post by id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {

        // sort by most recent
        const post = await Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ msg: 'Post not found ' });

        if (req.user.id !== post.user.toString()) {
            console.log(req.user.id)
            console.log(post.user);
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const remPost = await post.remove();

        res.json({ msg: 'post removed' });

    } catch (err) {
        console.error(err.message);
        if (err.message.includes('ObjectId'))
            return res.status(404).json({ msg: 'Post not found ' });

        res.status(500).send('Server Error');

    }
});

// @route   PUT api/posts/like/:id
// @desc    like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {

        // sort by most recent
        const post = await Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ msg: 'Post not found ' });

        //check if post is already like by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        //add to start of likes array
        post.likes.unshift({ user: req.user.id });

        //save to database
        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        if (err.message.includes('ObjectId'))
            return res.status(404).json({ msg: 'Post not found ' });

        res.status(500).send('Server Error');

    }
});

// @route   PUT api/posts/unlike/:id
// @desc    unlike a post --> removes previous like, like in FB 
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {


        const post = await Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ msg: 'Post not found ' });

        //check if post is not liked by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post not yet liked' });
        }

        //get index of unliked for removal
        const remIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(remIndex, 1);

        //save to database
        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        if (err.message.includes('ObjectId'))
            return res.status(404).json({ msg: 'Post not found ' });

        res.status(500).send('Server Error');

    }
});


module.exports = router;