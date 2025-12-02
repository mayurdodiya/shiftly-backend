const Joi = require("joi");

const getNotificationsList = {
    query: Joi.object({
        page: Joi.number(),
        limit: Joi.number(),
    }),
};

module.exports = {
    getNotificationsList
};
