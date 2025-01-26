import "reflect-metadata";
import express, { Request, Response, Express } from "express";
import authRoute from "./routes/authRoute";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app: Express = express(); // Removed explicit type annotation

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello SnowBell, This message is coming from the server",
  });
});

app.use("/auth", authRoute);

app.use(globalErrorHandler);

export default app;
