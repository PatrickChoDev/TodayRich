import { User } from "../models/userModel.js";
import { verify } from "../../utils/tokenUtil.js";

export const protectedRoute = async (req, res, next) => {
  let token;

  if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.token;
  }

  if (!token || token === "null") {
    return res
      .status(401)
      .json({ error: "Not authorized to access this route" });
  }

  try {
    const decoded = verify(token, process.env.TOKEN_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    // console.error(error);
    return res
      .status(401)
      .json({ error: "Not authorized to access this route" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Not authorized to access this route" });
  }

  next();
};

function parseCookies(cookieString) {
  const cookies = {};
  cookieString.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts[0].trim();
    const value = parts[1].trim();
    cookies[key] = value;
  });
  return cookies;
}
