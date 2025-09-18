import express from 'express';
import {signup, login, updatePassword, protect, restrictTo} from '../controllers/authControllers.js';
import { getAllUsers, updateMe, updateUser, deleteMe, deleteUser, getUser } from '../controllers/userControllers.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

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