import multer from "multer";
import sharp from "sharp";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import ApiFeatures from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const multerStorage = multer.memoryStorage();

const multerFillter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image'), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFillter,
});

export const uploadPostImages = upload.fields([
    { name: 'images', maxCount: 10},
]);

export const resizePostsImage = catchAsync(async (req, res, next) => {
    if (!req.files || !req.files.images) return next();

    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const fileName = `post-${req.params.id}-${Date.now()}-${ i + 1 }.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333, { fit: 'inside' })
                .toFormat('jpeg')
                .jpeg( { quality: 70 } )
                .toFile(`public/img/posts/${fileName}`);
            
            req.body.images[i] = fileName;
        })
    );
    
    next();
});

export const getAllPosts = catchAsync(async(req, res, next) => {
    const posts = await Post.find().populate('author', 'firstName lastName profilePic').select('-__v -likes');

    res.status(200).json({
        status: 'succes',
        data: {
            result: posts.length,
            posts,
        },
    });
});

export const createPost = catchAsync(async (req, res, next) => {
    const { title, content, tags, category, published, images } = req.body;

    const post = await Post.create({
        title,
        content,
        tags,
        category,
        published,
        images,
        author: req.user,
    });

    res.status(200).json({
        status: 'succes',
        data: {
            post,
        },
    });
});

export const getPost = catchAsync(async(req, res, next) => {
    const post = await Post.findById(req.params.id);
    
    if(!post) {
        return new AppError(404, 'Could not find post with this id');
    }


    let populatedCommonLikes = [];

    if(req.user){
        const currentUser = await User.findById(req.user.id).select('followings');

        const commonLikesWithFollowings = post.likes.filter(likeUser => 
            currentUser.followings.some(followingId => followingId.toString() === likeUser.toString())
        );

        populatedCommonLikes = await User.find({ _id: { $in: commonLikesWithFollowings } })
            .select('firstName lastName profilePic');
        
    } 
    
    const populatedPost = await post.populate('author', 'firstName lastName profilePic');
    
    return res.status(200).json({
        status: 'success',
        data: {
            post: populatedPost,
            commonLikesWithFollowings: populatedCommonLikes,
        },
    });
});

export const updatePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if(!post) {
        return new AppError(404, 'Could not find post with this id');
    }

    if(!(req.user.id === post.author.toString())){
        return new AppError(403, 'You do not have a permission');   
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            updatedPost,
        },
    });
});

export const deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if(!post) {
        return new AppError(404, 'Could not find post with this id');
    }

    if(!(req.user.id === post.author.toString())){
        return res.status(403).json({
                status: 'failed',
                message: 'You do not have a permission',
            });    
    }
    post.active = false;
    await post.save();

    return res.status(200).json({
        status: 'success',
        data: null
    });
});

export const deletePostAdmin = catchAsync(async (req, res, next) => {
    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
        status: 'success',
        data: null
    });
    
});

export const likePost = catchAsync(async(req, res, next) => {
    const post = await Post.findById(req.params.id);

    if(!post) {
        return new AppError(404, 'Could not find post with this id');
    }

    const index = post.likes.findIndex(like =>
        (like._id ? like._id.toString() : like.toString()) === req.user.id
    );

    if(index === -1 ){
        post.likes.push(req.user.id);
    } else {
        post.likes.splice(index, 1);
    }

    await post.save();

    const populatedPost = await post.populate('likes', 'firstName lastName profilePic');

    await Notification.create({
        toUser: populatedPost.author,
        fromUser: req.user.id,
        type: 'like',
        post: post.id,
    });

    res.status(200).json({
        status: 'success',
        data: {
            likesCount: populatedPost.likes.length,
            likes: populatedPost.likes,
        },
    });
});

export const repost = catchAsync(async (req, res, next) => {
    const originalPost = await Post.findById(req.params.id);

    if(!originalPost) {
        return new AppError(404, 'Could not find post with this id');
    }

    const existingRepost = await Post.findOne({
        author: req.user.id,
        repostOf: req.params.id
    });

    if(existingRepost) {
        await Post.findByIdAndDelete(existingRepost._id)

        return res.status(200).json({
            status: 'success',
            message: 'Unreposted',
        });
    }

    const repostedOne = await Post.create({
            content: originalPost.content,
            category: originalPost.category,
            tags: originalPost.tags,
            title: originalPost.title,
            likes: originalPost.likes,
            author: req.user.id,
            repostOf: originalPost.id
        });

        await Notification.create({
            toUser: originalPost.author,
            fromUser: req.user.id,
            type: 'repost',
            post: originalPost.id,
        });

    res.status(200).json({
        status: 'success',
        message: 'Reposted',
        repostedOne
    });
});

export const GetTrendingPosts = catchAsync(async (req, res, next) => {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const trendings = await Post.aggregate([
        {
            $match: {repostOf: null, active: { $ne: false } },
        },
        {
            $addFields: {
                recentLikes: {
                    $filter: {
                        input: "$likes",
                        as: "like",
                        cond: { $gte: ["$$like.createdAt", since]},
                    },
                }
            }
        },
        { $addFields: { likesCount: { $size: "$recentLikes" } } },
        {
            $lookup: {
                from:'comments',
                let: {postId: '$_id'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: [ "$post", "$$postId" ] },
                                    { $gte: [ "$createdAt", since ] }
                                ]
                            }
                        }
                    }
                ],
                as: "recentComments",
            }
        },
        { $addFields: { commentsCount: { $size: "$recentComments" } } },
        {
            $lookup: {
                from:'posts',
                let: {postId: '$_id'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: [ "$repostOf", "$$postId" ] },
                                    { $gte: [ "$createdAt", since ] }
                                ]
                            }
                        }
                    }
                ],
                as: "recentReposts",
            }
        },
        { $addFields: { repostsCount: { $size: "$recentReposts" } } },
        {
            $addFields: {
                score: {
                    $add: [
                        { $multiply: [ "$likesCount", 2 ]},
                        { $multiply: [ "$commentsCount", 3 ]},
                        { $multiply: [ "$repostsCount", 4 ]},
                    ]
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'authorInfo'
            }
        },
        { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
        { $sort: { score: -1, createdAt: -1 } },
        { $limit: 30 },
        {
            $project: {
                recentLikes: 0,
                recentReposts: 0,
                recentComments: 0,
                author: "$authorInfo",
            },
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            trendings,
        },
    });
});