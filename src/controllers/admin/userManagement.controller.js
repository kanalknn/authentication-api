const userStatsService = require('../../services/admin/userStats.service');
const response = require("../../responses/responses");
const responseStatus = require("../../constants/httpCodes");
const Joi = require('joi');
const { validate } = require('../../validators/authValidator');


exports.getTotalUsersCount = async (req, res) => {
  try {
    const result = await userStatsService.getAllUsersCount();

    if (!result.success) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, result.error);
    }

    return res.json({
      success: true,
      totalUsers: result.allUsers,
      activeUsers: result.activeUsers,
      inactiveUsers: result.inactiveUsers,
      message: "Users count retrieved successfully"
    });
  } catch (error) {
    console.error('Get users count error:', error);
    return res.status(500).json({ success: false, message: "Failed to get users count" });
  }
};


exports.getUsersListWithSubscriptions = async (req, res) => {
  try {
    const schema = {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10)
    };

    const { error, value } = Joi.object(schema).validate(req.query);
    if (error) {
      return response.joiCustomError(req, res, error);
    }

    const { page, limit } = value;
    const result = await userStatsService.getUsersListWithSubscriptions(page, limit);

    if (!result.success) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, result.error);
    }

    return res.json({
      success: true,
      users: result.data.users,
      pagination: result.data.pagination,
      message: "Users list retrieved successfully"
    });
  } catch (error) {
    console.error('Get users list error:', error);
    return res.status(500).json({ success: false, message: "Failed to get users list" });
  }
};


exports.getUserSubscriptionSummary = async (req, res) => {
  try {
    const result = await userStatsService.getUserSubscriptionSummary();

    if (!result.success) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, result.error);
    }

    return res.json({
      success: true,
      summary: result.summary,
      message: "Subscription summary retrieved successfully"
    });
  } catch (error) {
    console.error('Get subscription summary error:', error);
    return res.status(500).json({ success: false, message: "Failed to get subscription summary" });
  }
};

exports.getUserDetailedInfo = async (req, res) => {
  try {
    const schema = {
      userId: Joi.string().required()
    };

    const { error } = validate(req.params, schema);
    if (error) {
      return response.joiCustomError(req, res, error);
    }

    const { userId } = req.params;
    const result = await userStatsService.getUserDetailedInfo(userId);

    if (!result.success) {
      return response.fail(req, res, responseStatus.HTTP_BAD_REQUEST, result.error);
    }

    return res.json({
      success: true,
      user: result.user,
      message: "User details retrieved successfully"
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return res.status(500).json({ success: false, message: "Failed to get user details" });
  }
};