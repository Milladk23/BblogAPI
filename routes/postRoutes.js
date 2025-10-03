import express from 'express';
import { createPost, deletePost, deletePostAdmin, getAllPosts, getPost, GetTrendingPosts, likePost, repost, resizePostsImage, updatePost, uploadPostImages } from "../controllers/postControllers.js";
import { optionalProtect, protect, restrictTo } from '../controllers/authControllers.js';

const router = express.Router();

router
    .route('/')
    .get(optionalProtect, getAllPosts)
    .post(
        protect,
        uploadPostImages,
        resizePostsImage,
        createPost,
    );
router
    .route('/:id')
    .get(optionalProtect, getPost)
    .patch(
        protect,
        uploadPostImages,
        resizePostsImage,
        updatePost
    )
    .delete(protect, deletePost);

router.use(protect);

router.route('/:id/force').delete(restrictTo('admin'), deletePostAdmin);

router.route('/:id/like').patch(likePost);

router.route('/:id/repost').post(repost);

router.route('/trending').get(GetTrendingPosts);

export default router;