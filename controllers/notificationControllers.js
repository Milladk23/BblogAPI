import Notification from "../models/notificationModel";

export const getMyNotification = async (req, res, next) => {
    const notifications = Notification.find({ toUser: req.user.id})
        .populate('fromUser', 'firstName lastNmae profilePic')
        .populate('post', 'title')
        .populate('comment', 'content')
        .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            resault: notifications.length,
            data: {
                notifications,
            },
        });
};