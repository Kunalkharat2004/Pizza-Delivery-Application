import "reflect-metadata";
import express, { Request, Response } from "express";
import authRoute from "./routes/authRoute";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import tenantRoute from "./routes/tenantRoute";
import userRoute from "./routes/userRoute";
import cors from "cors";
import config from "./config/config";
import { requestLogger } from "./middlewares/requestLogger";

// This comment is just for testing the CI pipeline - #10

const app = express();

app.use(
  cors({
    origin: [config.CLIENT_URL as string],
    credentials: true,
  })
);

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello SnowBell, This message is coming from the K8s server with ArgoCD image updater",
  });
});

app.use("/auth", authRoute);
app.use("/tenant", tenantRoute);
app.use("/users", userRoute);

app.use(globalErrorHandler);

export default app;
