import express from 'express';
import { 
    createComment,
    deleteComment,
    deleteCommentAdmin,
    getAllCommentsOfPost,
    getComment,
    likeComment,
    updateComment,
} from '../controllers/commentControllers.js';
import { protect, restrictTo } from '../controllers/authControllers.js';

const router = express.Router();

router
    .route('/')
    .post(createComment);
    
router
    .route('/:id')
    .get(getAllCommentsOfPost)
    .get(getComment)
    .patch(protect, updateComment)
    .delete(protect, deleteComment);

router.use(protect)

router.route('/:id/like').patch(likeComment);

router.route('/:id/force').delete(restrictTo('admin'), deleteCommentAdmin);


export default router;