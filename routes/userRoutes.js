import express from 'express';
import {signup, login, updatePassword, protect, restrictTo} from '../controllers/authControllers.js';
import { getAllUsers, updateMe, updateUser, deleteMe, deleteUser, getUser, followUnfollow } from '../controllers/userControllers.js';
import { getMyNotification } from '../controllers/notificationControllers.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/notifications', getMyNotification);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.patch('/:id/follow', followUnfollow);

router.use(restrictTo('admin'));

router
    .route('/')
    .get(getAllUsers);
router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);



export default router;