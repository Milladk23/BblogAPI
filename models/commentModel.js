import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A comment must have an author'],
        },
        post: {
            type: mongoose.Schema.ObjectId,
            ref: 'Post',
            required: [true, 'A comment must belonging to a post'],
        },
        content: {
            type: String,
            required: [true, 'A comment should have a content'],
        },
        likes: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        }],
        likesCount: {
            type: Number,
            default: 0,
        },
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    }, { timestamps: true },
);

commentSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next(); 
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;