const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const cloudinary = require('cloudinary');
const moment = require('moment');
const request = require('request');

cloudinary.config({ 
    cloud_name: 'dq7cbxcr3', 
    api_key: '689675644787379', 
    api_secret: '8bU6_23GfV5i4dkqdaIgilSr9VQ' 
  });

const Post = require('../models/postModels');
const User = require('../models/userModels');

module.exports = {

    AddPost(req, res) {
        const schema = Joi.object().keys({
            post: Joi.string().required()
        });
        const bodyForSchema = {
            post: req.body.post
        }
        const { error } = Joi.validate(bodyForSchema, schema);
        if(error && error.details) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ msg: error.details });
        }
        const body = {
            user: req.user._id,
            username: req.user.username,
            post: req.body.post,
            created: new Date()
        }

        if(req.body.post && !req.body.image) {
            Post.create(body)
            .then( async (post) => {
                await User.updateOne({
                    _id: req.user._id
                }, 
                {
                    $push: { 
                        posts: {
                            postId: post._id,
                            post: req.body.post,
                            created: new Date()
                        } 
                    }
                });
                res
                    .status(HttpStatus.OK)
                    .json({message: 'post created', post});
                })
                .catch(err => {
                res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({message: 'Error occured'})
            });
        }

        if(req.body.post && req.body.image) {
            cloudinary.uploader.upload(req.body.image, async (result) => {
            const reqBody = {
                user: req.user._id,
                username: req.user.username,
                post: req.body.post,
                imgVersion: result.version,
                imgId: result.public_id,
                created: new Date()
            }
            Post.create(reqBody)
            .then( async (post) => {
                await User.updateOne({
                    _id: req.user._id
                }, 
                {
                    $push: { 
                        posts: {
                            postId: post._id,
                            post: req.body.post,
                            created: new Date()
                        } 
                    }
                });
                res
                    .status(HttpStatus.OK)
                    .json({message: 'post created', post});
                })
                .catch(err => {
                res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({message: 'Error occured'})
                });
            });
        }
    },

    async GetAllPosts(req, res) {
        try {
            const today = moment().startOf('day');
            const tomorrow = moment(today).add(1, 'days')

            const posts = await Post.find({
                created: {$gte: today.toDate(), $lt: tomorrow.toDate()}
            })
                .populate('user')
                .sort({created: -1});

            const user = await User.findOne({_id: req.user._id});
            if(user.city === '' && user.country === '') {
                request(
                    'http://api.ipstack.com/check?access_key=f9343552815423dc19cff9d86e83aea1&format=1', 
                    {json:true},
                    async(err, res, body) => {
                        await User.updateOne({
                            _id: req.user._id
                        },{
                            city: body.city,
                            country: body.country_name
                        });
                    }
                );
            }

            const top = await Post.find({
                totalLikes: {$gte: 2},
                created: {$gte: today.toDate(), $lt: tomorrow.toDate()}
            })
                .populate('user')
                .sort({created: -1});
            
            return res
                .status(HttpStatus.OK)
                .json({message: 'All posts', posts, top});
        } catch(err) {
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message: 'Error occured'});
        }
    },

    async AddLike(req, res) {
        const postId = req.body._id;
        await Post.updateOne({
            _id: postId,
            "likes.username": { $ne: req.user.username }
        }, {
            $push: { 
                likes: {
                username: req.user.username
                }
            },
            $inc: { totalLikes: 1},
        })
        .then(() => {
            res
            .status(HttpStatus.OK)
            .json({message: 'You liked the post'});
        })
        .catch(err => {
            res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message: 'Error occured'});
        });
    },

    async AddComment(req, res) {
        const postId = req.body.postId;
        await Post.updateOne({
            _id: postId
        }, {
            $push: { 
                comments: {
                    userId: req.user._id,
                    username: req.user.username,
                    comment: req.body.comment,
                    createdAt: new Date(),
                    imgVersion: req.body.picVersion,
                    imgId: req.body.picId
                }
            }
        })
        .then(() => {
            res
            .status(HttpStatus.OK)
            .json({message: 'Commetn added to post'});
        })
        .catch(err => {
            res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message: 'Error occured'});
        });
    },

    async GetPost(req, res) {
        await Post.findOne({_id: req.params.id})
            .populate('user')
            .populate('commets.userId')
            .then((post) => {
                res.
                status(HttpStatus.OK)
                .json({message: 'Post found', post})
            }).catch(err => res
                .status(HttpStatus.NOT_FOUND).json({message: 'Post not found', post}))
    },

    EditPost(req, res) {
        const schema = Joi.object().keys({
            post: Joi.string().required(),
            id: Joi.string().optional()
        });
        
        const { error } = Joi.validate(req.body, schema);
        if(error && error.details) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ msg: error.details });
        }

        const body = {
            post: req.body.post,
            created: new Date()
        }

        Post.findOneAndUpdate({_id: req.body.id}, body, {new: true})
            .then(post => {
                res
                    .status(HttpStatus.OK)
                    .json({message: 'Post updated successfully', post})
        }).catch(err => {
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ msg: err });
        })
    },

    async DeletePost(req, res) {
        try {
            const { id } = req.params;
            const result = await Post.findByIdAndRemove(id);
            if(!result) {
                return res.status(HttpStatus.NOT_FOUND).json({message: 'Could not delete post'})
            } else {
                await User.updateOne({
                    _id: req.user._id
                }, {
                    $pull: {posts: {
                        postId: result._id
                    }}
                });
                return res.status(HttpStatus.OK).json({message: 'Post deleted successfully'});
            }
        } catch(err) {
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ msg: err });
        }
    }
}