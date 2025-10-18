import AppError from "../utils/appError";

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const message = `Duplicate field value. Please use another.`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJwtErrorDB = () =>
    new AppError('Invalid token. Please login again, 401');

const handleTokenExpiredErrorDB = () => 
    new AppError('Expired token. Please login again');

const sendErrorDev = (err) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err) => {
    if(err.isOperational) {
        return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        });
    }
};

const globalErrorHandler = (req, res, err, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') error = handleJwtErrorDB();
        if (err.name === 'TokenExpiredError') error = handleTokenExpiredErrorDB();

        sendErrorProd(error, req, res);
    }
}

export default globalErrorHandler;

