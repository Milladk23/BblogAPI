import multer from "multer";
import sharp from "sharp";
import User from "../models/userModel.js";
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

export const uploadUserProfile = upload.single('profilePic');

export const resizeUserProfile = catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.body.profilePic = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg( { quality: 70 } )
        .toFile(`public/img/users/${req.body.profilePic}`);
            
        next();
});
    

const fillterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

export const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        data: {
            result: users.length,
            users,
        },
    });
});

export const getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return new AppError(404, 'Could not find user with this id');
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});


export const updateMe = catchAsync(async (req, res, next) => {
    if(req.body.password || req.body.passwordConfirm) {
        return new AppError(400, 'If you wanna change your pass use /updateMyPassword route');
    }

    const fillterBody = fillterObj(req.body, 'firstName', 'lastName', 'birthday', 'email', 'profilePic');

    const user = await User.findByIdAndUpdate(req.user.id, fillterBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success', 
        data: {
            user,
        },
    });
});

export const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success', 
        data: null,
    });
});

export const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if(!user) {
        return new AppError(404, 'Could not find user with this id');
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

export const updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if(!user) {
        return new AppError(404, 'Could not find user with this id');
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

export const followUnfollow = catchAsync(async (req, res, next) => {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if(!targetUser) {
        return new AppError(404, 'Could not find post with this id');
    }
    const indexTarget = targetUser.followers.findIndex(id => id.toString() === currentUser.id);

    const mineIndex = currentUser.followings.findIndex(id => id.toString() === targetUser.id);

    if(indexTarget === -1 ){
        targetUser.followers.push(currentUser.id);
        currentUser.followings.push(targetUser.id);
    } else {
        targetUser.followers.splice(indexTarget, 1);
        currentUser.followings.splice(mineIndex, 1);
    }

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({
        status: 'success',
        data: {
            targetUser,
            followersCount: targetUser.followers.length,
            followers: targetUser.followers,
        },
    });
});