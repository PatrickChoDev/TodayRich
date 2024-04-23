import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import router from "./internal/route.js";
import { connect } from "./database/mongoose.js";

dotenv.config();

connect();

const app = express();

app.use(
  express.static("public", {
    extensions: ["html", "htm"],
    index: "index.html",
  }),
);

app.use(express.json());
app.use(cors());

app.use("/api", router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
});
