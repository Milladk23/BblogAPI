import User from "../models/userModel.js";

const fillterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

export const getAllUsers = async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        data: {
            result: users.length,
            users,
        },
    });
}

export const getUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return res.status(404).json({
            status: 'failed',
            message: 'Could not find user with this id',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
}



export const updateMe = async (req, res, next) => {
    if(req.body.password || req.body.passwordConfirm) {
        return res.status(400).json({
            status: 'failed',
            message: 'If you wanna change your pass use /updateMyPassword route',
        });
    }

    const fillterBody = fillterObj(req.body, 'firstName', 'lastName', 'birthday', 'email', 'photo');

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
}

export const deleteMe = async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success', 
        data: null,
    });
}

export const deleteUser = async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if(!user) {
        return res.status(404).json({
            status: 'failed',
            message: 'Could not find user with this id',
        });
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
}

export const updateUser = async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if(!user) {
        return res.status(404).json({
            status: 'failed',
            message: 'Could not find user with this id',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
}

