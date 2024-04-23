import express from "express";
import { getLeaderboard } from "./controllers/leaderboardController.js";
import {
  getMe,
  login,
  logout,
  register,
} from "./controllers/authController.js";
import {
  startGame,
  stopGame,
  loadGame,
  getGameHistory,
  playGame,
} from "./controllers/gameController.js";
import { protectedRoute } from "./middlewares/auth.js";

const route = express.Router();

route.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

route.get("/leaderboard/:type", getLeaderboard);

route.post("/login", login);
route.post("/register", register);
route.get("/me", protectedRoute, getMe);
route.get("/logout", protectedRoute, logout);

route.post("/game/start", protectedRoute, startGame);
route.post("/game/stop", protectedRoute, stopGame);
route.get("/game", protectedRoute, loadGame);
route.get("/game/history", protectedRoute, getGameHistory);
route.get("/game/play", protectedRoute, playGame);

export default route;
