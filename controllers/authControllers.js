import User from "../models/userModel.js";
import  jwt  from "jsonwebtoken";
import util from 'util';

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
    });
};

export const signup = async (req, res, next) => {
    const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

    createSendToken(newUser, 201, req, res);
};

export const login = async (req, res, next ) => {
    const { email, password } = req.body;
    
    if(!email || !password) {
        return res.status(400).json({
            status: 'failed',
            message: 'Please enter fill both fields',
        });
    }

    const user = await User.findOne({ email }).select('+password');

    if(!user) {
        return res.status(401).json({
            status: 'failed',
            message: 'Email is incorrect',
        });
    }
    if(!(await user.correctPassword(password, user.password))){
        return res.status(401).json({
            status: 'failed',
            message: 'Password is incorrect',
        });
    }

    createSendToken(user, 200, req, res);
};

export const protect = async (req, res, next) => {
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }


    if(!token) {
        return res.status(401).json({
            status: 'failed',
            message: 'You are not logged in',
        });
    }

    const decodedUser = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedUser.id);

    if(!user) {
        return res.status(401).json({
            status: 'failed',
            message: "The user blonging to this token does't exist anymore",
        });
    }
    if(user.changedPasswordAfter(decodedUser.iat)) {
        return res.status(401).json({
            status: 'failed',
            message: 'The user has changed password recently please login again',
        });
    }

    req.user = user;
    next();
}

export const restrictTo = function (...roles) {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                status: 'failed',
                message: 'You do not have a permission',
            });
        }
        next();
    }
}

export const updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if(!user.correctPassword(req.body.passwordCurrent, user.password)) {
        return res.status(401).json({
                status: 'failed',
                message: 'Wrong pass',
        });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, req, res);
};

export const optionalProtect = async (req, res, next) => {
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    const decodedUser = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedUser.id);

    req.user = user;
    next();
}
