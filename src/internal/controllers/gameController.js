import { levelMultiplier, validLevels } from "../../utils/gameUtil.js";
import { GameHistory } from "../models/gameHistoryModel.js";
import { User } from "../models/userModel.js";

export const getGameHistory = async (req, res) => {
  try {
    const game = await GameHistory.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: game.length, game });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const startGame = async (req, res) => {
  try {
    if (!req.body.bet || !req.body.level) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (
      (await GameHistory.countDocuments({ user: req.user._id, ended: false })) >
      0
    ) {
      return res.status(400).json({ error: "Game already in progress" });
    }

    const user = await User.findById(req.user._id);
    if (user.money < req.body.bet) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    if (!validLevels.includes(req.body.level)) {
      return res.status(400).json({ error: "Invalid level" });
    }

    if (req.body.bet < 0) {
      return res.status(400).json({ error: "Invalid bet" });
    }

    const penalty =
      (await GameHistory.find({
        user: req.user._id,
        win: true,
      }).countDocuments()) ||
      0 / (await GameHistory.find({ user: req.user._id }).countDocuments()) ||
      1 * (1 / levelMultiplier[req.body.level]);
    const endStepCalc = Math.round(Math.random() * 16 * penalty);
    const game = await GameHistory.create({
      user: req.user._id,
      score: 0,
      bet: req.body.bet,
      multiplier: levelMultiplier[req.body.level],
      level: req.body.level,
      won: false,
      ended: false,
      step: 0,
      endStep: Math.max(0, Math.random() * 16),
    });

    user.money -= req.body.bet;
    await user.save();

    res.status(201).json({ success: true, gameID: game._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const playGame = async (req, res) => {
  try {
    const game = await GameHistory.findOne({
      user: req.user._id,
      ended: false,
    });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    const user = await User.findById(game.user);

    if (game.ended) {
      return res.status(400).json({ error: "Game already ended" });
    }

    if (game.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    game.step += 1;

    if (game.step > 15) {
      // Game Finished with won
      game.ended = true;
      game.won = true;
      game.score += game.bet * game.multiplier * game.step;
      user.money += game.bet * (1 + game.multiplier * game.step);
      user.bestScore = Math.max(user.bestScore, game.score) || 0;
      await user.save();
      await game.save();
      return res.status(200).json({ success: true, game });
    }

    if (game.step >= game.endStep) {
      // Game Finished with lose
      game.ended = true;
      game.won = false;
      user.bestScore = Math.max(user.bestScore, game.score) || 0;
      await user.save();
      await game.save();
      return res.status(200).json({ success: true, game });
    }

    game.score += game.bet * game.multiplier * game.step;

    await game.save(); // Game continues
    res
      .status(200)
      .json({
        success: true,
        game: { step: game.step, score: game.score, ended: false },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const stopGame = async (req, res) => {
  try {
    const game = await GameHistory.findOne({
      user: req.user._id,
      ended: false,
    });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game.ended) {
      return res.status(400).json({ error: "Game already ended" });
    }

    if (game.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    game.ended = true;
    game.won = false;
    const user = await User.findById(game.user);
    user.money += game.bet * (1 + game.multiplier * game.step);
    user.bestScore = Math.max(user.bestScore, game.score);
    await user.save();
    await game.save();

    res.status(200).json({ success: true, game });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const loadGame = async (req, res) => {
  try {
    const game = await GameHistory.findOne({
      user: req.user._id,
      ended: false,
    });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res
      .status(200)
      .json({
        success: true,
        gameID: game._id,
        step: game.step,
        level: game.level,
        bet: game.bet,
        multiplier: game.multiplier,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
