import mongoose from "mongoose";

const GameHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  score: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
  bet: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
  multiplier: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
  level: {
    type: String,
    enum: ["easy", "medium", "hard", "daredevil"],
    required: true,
  },
  won: {
    type: mongoose.SchemaTypes.Boolean,
    required: true,
  },
  step: {
    type: mongoose.SchemaTypes.Number, // User's current step
    required: true,
  },
  endStep: {
    type: mongoose.SchemaTypes.Number, // User's end step if < 15 = lose
    required: true,
  },
  ended: {
    type: mongoose.SchemaTypes.Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
  },
  updatedAt: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
  },
});

GameHistorySchema.pre("save", (next) => {
  if (this) this.updatedAt = Date.now();
  next();
});

export const GameHistory = mongoose.model("GameHistory", GameHistorySchema);
