const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    username: { type: String, default: ''},
    post: { type: String, default: ''},
    imgVersion: { type: String, default: ''},
    imgId: { type: String, default: ''},
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            username: { type: String, default: ''},
            comment: { type: String, default: ''},
            createdAt: { type: Date, default: Date.now()},
            imgVersion: { type: String, default: '1557732604'},
            imgId: { type: String, default: '4230238835_kcg2rh.jpg'},
        }
    ],
    totalLikes: { type: Number, default: 0},
    likes: [
        {
            username: { type: String, default: ''}
        }
    ],
    created: { type:Date, default: Date.now()}
});

module.exports = mongoose.model('Post', postSchema);