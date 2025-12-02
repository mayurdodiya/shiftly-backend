const message = require("../json/message.json");
const { NotificationModel } = require("../models");
const apiResponse = require("../utils/api.response");
const { getPagination, pagingData } = require("../utils/utils");

module.exports = {
    notificationList: async (req, res) => {
        try {
            const { search, page, limit } = req.query;
            const { user } = req

            const { skip, limit: pageLimit } = getPagination(page, limit);

            let DataObj = [{ deletedAt: null, userId: user._id }];

            if (search) {
                const regSearch = new RegExp(search, "i");
                DataObj = [
                    ...DataObj,
                    {
                        $or: [{ name: regSearch }, { email: regSearch }, { phone: regSearch }],
                    },
                ];
            }

            const filterQuery = DataObj.length > 0 ? { $and: DataObj } : { deletedAt: null };

            const data = await NotificationModel.find(filterQuery).skip(skip).limit(pageLimit).sort({ createdAt: -1 });
            const response = pagingData({ data: data, total: data?.length, page, limit: pageLimit });

            await NotificationModel.updateMany({ userId: user._id }, { isRead: true })

            return apiResponse.OK({ res, message: `Notification list ${message.data_get}`, data: response });
        } catch (err) {
            console.log(err);
            return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
        }
    },
};
