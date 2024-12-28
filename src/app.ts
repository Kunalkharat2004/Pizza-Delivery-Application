import express, { Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
