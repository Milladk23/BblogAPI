import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            minLength: [3, 'The title shoul be 3 charracters or more'],
            required: [true, 'A post must have a title'],
            trim: true,
        },
        slug: String,
        content: {
            type: String,
            minLength: [3, 'The title shoul be 3 charracters or more'],
            required: [true, 'A post must have a content'],
            trim: true,
        },
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required:[true, 'A post must have an author'],
        },
        tags: [String],
        category: [String],
        likes: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            createdAt: {
                type: Date,
                default: Date.now,
            }
        }],
        published: {
            type: Boolean,
            default: true,
        },
        repostOf: {
            type: mongoose.Schema.ObjectId,
            ref: 'Post',
        },
        active: {
            type: Boolean,
            default: true,
        },
        images: [ String ],
    }, { timestamps: true }
);

postSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next(); 
});

const Post = mongoose.model('Post', postSchema);

export default Post;