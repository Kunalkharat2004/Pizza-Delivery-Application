import "reflect-metadata";
import express, { Request, Response, Express } from "express";
import authRoute from "./routes/authRoute";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import tenantRoute from "./routes/tenantRoute";

const app: Express = express(); // Removed explicit type annotation

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello SnowBell, This message is coming from the server",
  });
});

app.use("/auth", authRoute);
app.use("/tenant", tenantRoute);

app.use(globalErrorHandler);

export default app;
