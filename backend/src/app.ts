import express from "express";
import cors from "cors";
import { apiRouter } from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok", service: "matyab-backend" }));

  app.use("/api/v1", apiRouter);

  app.use(errorHandler);

  return app;
}
