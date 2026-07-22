import express, { Express } from "express";
import authRouter from "./routes/auth.route.js";
import roomRouter from "./routes/room.route.js";
import chatRouter from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors";

const app: Express = express();

app.use(cors({
  origin: "*"
}))
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server running healthy",
    status: "success"
  })
})
app.use("/auth", authRouter);
app.use("/rooms", roomRouter);
app.use("/chats", chatRouter);

app.use(errorHandler);

export default app;
