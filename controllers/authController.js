import User from "../models/userModel.js";
import  jwt  from "jsonwebtoken";

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
    const newUser = await User.create(req.body);

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