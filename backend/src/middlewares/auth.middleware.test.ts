import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { requireAuth, requireRole } from "./auth.middleware";
import { errorHandler } from "./error.middleware";

async function requestAdmin(token?: string) {
  const app = express();
  app.get("/admin", requireAuth, requireRole("ADMIN"), (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);
  const server = app.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as { port: number };
    return await fetch(`http://127.0.0.1:${port}/admin`, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });
  } finally {
    server.close();
  }
}

test("admin route returns 401 without a token", async () => {
  const response = await requestAdmin();
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "احراز هویت لازم است" });
});

test("admin route returns 403 for a non-admin user", async () => {
  const token = jwt.sign({ sub: "user-1", role: "SUPPLIER" }, env.jwtSecret);
  const response = await requestAdmin(token);
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "دسترسی غیرمجاز است" });
});

test("admin route accepts an admin user", async () => {
  const token = jwt.sign({ sub: "admin-1", role: "ADMIN" }, env.jwtSecret);
  const response = await requestAdmin(token);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});
