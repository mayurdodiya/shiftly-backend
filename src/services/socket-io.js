const utils = require("../utils/utils");
const DB = require("../models");
const messages = require("../json/message.json");

const setSocket = (io) => {
  global.io = io;

  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.headers["x-auth-token"];
      if (token) {
        let _user = await utils.decodeToken({ token });

        if (!_user) {
          next(null, false);
        }
        _user = await DB.UserModel.findOne({ _id: _user?.userId, isActive: true });

        if (!_user) return next(new Error(messages.invalid_token));

        socket.authUser = _user;

        return next();
      } else {
        next(new Error(messages.token_required));
      }
    } catch (error) {
      console.log(error, ">>>>>>>>>>>>>");
    }
  });

  io.on("connection", async (socket) => {
    console.log(socket.authUser._id.toString(), "<<<<< user connected successfully.🚀");
    try {
      //* join user in socket
      socket.join(socket?.authUser?._id.toString());
      checkNotification();

      // give list of notification to the connected user
      async function checkNotification() {
        let unreadNotification = await DB.NotificationModel.countDocuments({ userId: socket.authUser._id, isRead: false });
        console.log("check-notification", unreadNotification);
        socket.emit("check-notification", {
          success: true,
          message: "total notification",
          data: unreadNotification,
        });
      }

      //* unread notification count
      socket.on("check-notification", async () => {
        checkNotification();
      });

      //* update-view-notification
      socket.on("view-notification", async (dataObj) => {
        await DB.NotificationModel.updateMany({ userId: socket.authUser._id }, { isRead: true });
        // let unreadNotification = await DB.NotificationModel.countDocuments({ userId: socket.authUser._id, isRead: false });

        const { page = 1, limit = 10 } = dataObj;
        const { skip, limit: pageLimit } = utils.getPagination(page, limit);

        let DataObj = [{ deletedAt: null, userId: socket.authUser._id }];
        const filterQuery = DataObj.length > 0 ? { $and: DataObj } : { deletedAt: null };

        const data = await DB.NotificationModel.find(filterQuery).skip(skip).limit(pageLimit).sort({ createdAt: -1 });
        const response = utils.pagingData({ data: data, total: data?.length, page, limit: pageLimit });

        console.log("view-notification", response);
        socket.emit("notification-list", {
          success: true,
          message: "Notification read",
          data: response,
        });
      });

    } catch (error) {
      console.log("error : ", error);
      socket.emit("error", {
        success: false,
        message: "Something went wrong",
      });
    }
  });

  io.on("error", (err) => {
    console.log("socket err", err);
  });
};

module.exports = setSocket;
