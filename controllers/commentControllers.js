import Comment from "../models/commentModel.js";
import catchAsync from "../utils/catchAsync.js";
import Post from "../models/postModel.js";
import AppError from "../utils/appError.js";

export const createComment = catchAsync(async (req, res, next) => {
    const { content } = req.body;

    const comment = await Comment.create({
        content,
        post: req.params.id,
        author: req.user,
    });

    const post = await Post.findById(req.params.id);

    await Notification.create({
        toUser: post.author,
        fromUser: req.user.id,
        type: 'comment',
        post: post.id,
    });

    res.status(200).json({
        status: 'succes',
        data: {
            comment,
        },
    });
});

export const getAllCommentsOfPost = catchAsync(async(req, res, next) => {
    const postId = req.body.post;
    const comments = await Comment.find({ post: postId }).populate('author', 'firstName lastName profilePic').populate('post');

    res.status(200).json({
        status: 'succes',
        data: {
            result: comments.length,
            comments,
        },
    });
});

export const getComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id).populate('author', 'firstName lastName profilePic').populate('post');
    
    if(!comment) {
        return new AppError(404, 'Could not find comment with this id');
    }

    res.status(200).json({
        status: 'succes',
        data: {
            comment,
        },
    });
});

export const updateComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if(!comment) {
        return new AppError(404, 'Could not find comment with this id');
    }

    if(!(req.user.id === comment.author.toString())){
        return new AppError(403, 'You do not have a permission');   
    }

    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('author', 'firstName lastName profilePic').populate('post');

    res.status(200).json({
        status: 'success',
        data: {
            updatedComment,
        },
    });
});

export const deleteComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if(!comment) {
        return new AppError(404, 'Could not find comment with this id');
    }

    if(!(req.user.id === comment.author.toString())){
        return new AppError(403, 'You do not have a permission');   
    }

    comment.active = false;
    await comment.save();

    return res.status(200).json({
        status: 'success',
        data: null
    });
    
});

export const deleteCommentAdmin = catchAsync(async (req, res, next) => {
    await Comment.findByIdAndDelete(req.params.id);

    return res.status(200).json({
        status: 'success',
        data: null
    });
    
});

export const likeComment = catchAsync(async(req, res, next) => {
    const comment = await Comment.findById(req.params.id);

    if(!comment) {
        return new AppError(404, 'Could not find comment with this id');
    }

    const index = comment.likes.findIndex(like =>
        (like._id ? like._id.toString() : like.toString()) === req.user.id
    );

    if(index === -1 ){
        comment.likes.push(req.user.id);
    } else {
        comment.likes.splice(index, 1);
    }

    comment.likesCount = comment.likes.length;

    await comment.save();

    await Notification.create({
        toUser: comment.author,
        fromUser: req.user.id,
        type: 'like',
        comment: comment.id,
    });

    res.status(200).json({
        status: 'success',
        data: {
            likesCount: comment.likes.length,
            post: comment.post,
            author: comment.author,
            createdAt: comment.createdAt,
        },
    });
});