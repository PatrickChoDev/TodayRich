import mongoose from "mongoose";
import { hashPassword, comparePasswords } from "../../utils/passwordUtil.js";
import { sign } from "../../utils/tokenUtil.js";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  bestScore: {
    type: mongoose.SchemaTypes.Number,
    default: 0,
  },
  money: {
    type: mongoose.SchemaTypes.Number,
    default: 100.0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (this.password)
    this.password = await new Promise((resolve, reject) => {
      hashPassword(this.password, 16, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });
});

UserSchema.methods.matchPassword = async function (password) {
  return await new Promise((resolve, reject) => {
    comparePasswords(password, this.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};

UserSchema.methods.getSignedToken = function () {
  return sign({ id: this._id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE,
  });
};

export const User = mongoose.model("User", UserSchema);
