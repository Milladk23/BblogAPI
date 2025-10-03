import mongoose from "mongoose";
import { types } from "util";

const notificationSchema = new mongoose.Schema({
    toUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    fromUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['follow', 'like', 'repost', 'comment', mention],
        required: true,
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
    },
    comment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
    },
    isRead: {
        type: Boolean,
        default: false,
    }
    }, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
