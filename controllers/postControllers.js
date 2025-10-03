import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import ApiFeatures from "../utils/apiFeatures.js";

export const getAllPosts = async(req, res, next) => {
    const posts = await Post.find().populate('author', 'firstName lastName profilePic').select('-__v -likes');

    res.status(200).json({
        status: 'succes',
        data: {
            result: posts.length,
            posts,
        },
    });
};

export const createPost = async (req, res, next) => {
    const { title, content, tags, category, published } = req.body;

    const post = await Post.create({
        title,
        content,
        tags,
        category,
        published,
        author: req.user,
    });

    res.status(200).json({
        status: 'succes',
        data: {
            post,
        },
    });
};

export const getPost = async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    
    if(!post) {
        return res.status(404).json({
            status: 'failed',
            message: 'Could not find post with this id',
        });
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
}

export const updatePost = async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if(!post) {
        return res.status(404).json({
            status: 'failed',
            message: 'Could not find post with this id',
        });
    }

    if(!(req.user.id === post.author.toString())){
        return res.status(403).json({
                status: 'failed',
                message: 'You do not have a permission',
            });    
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
}

export const deletePost = async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if(!post) {
        return res.status(404).json({
            status: 'failed',
            message: 'Could not find post with this id',
        });
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
}

export const deletePostAdmin = async (req, res, next) => {
    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
        status: 'success',
        data: null
    });
    
}

export const likePost = async(req, res, next) => {
    const post = await Post.findById(req.params.id);

    if(!post) {
        return res.status(404).json({
            status: 'failed',
            message: 'Could not find post with this id',
        });
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
}

export const repost = async (req, res, next) => {
    const originalPost = await Post.findById(req.params.id);

    if(!originalPost) {
        return res.status(404).json({
            status: 'failed',
            message: 'Could not find post with this id',
        }); 
    }

    const existingRepost = await Post.findOne({
        author: req.user.id,
        repostOf: req.params.id
    });

    if(existingRepost) {
        await Post.findByIdAndUpdate(existingRepost._id, {
            active: false,
        });

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
}

export const GetTrendingPosts = async (req, res, next) => {
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
}