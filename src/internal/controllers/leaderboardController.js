import { User } from "../models/userModel.js";

export const getLeaderboard = async (req, res) => {
  if (req.params.type != "bestScore" && req.params.type != "money") {
    return res.status(400).json({ error: "Invalid leaderboard type" });
  }

  const type = req.params.type === "bestScore" ? "bestScore" : "money";

  try {
    let query;

    query = User.find().select("name " + type);

    let user, index;
    if (req.query.user) {
      user = await User.findById(req.query.user);
      index = await User.find({ [type]: { $gt: user[type] } }).countDocuments();
    }

    let sort = -1;
    if (req.query.sort) {
      const sort = req.query.sort === "asc" ? 1 : -1;
    }
    query = query.sort({ [type]: sort });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const results = await query;

    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    if (user && index >= 0) {
      return res
        .status(200)
        .json({
          success: true,
          name: user.name,
          rank: index + 1,
          count: results.length,
          pagination,
          leaderboard: results,
        });
    }

    res
      .status(200)
      .json({
        success: true,
        count: results.length,
        pagination,
        leaderboard: results,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
