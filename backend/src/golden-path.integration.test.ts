import assert from "node:assert/strict";
import { test } from "node:test";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createApp } from "./app";
import { prisma } from "./db/prisma";

function createTestDatabase() {
  let sequence = 0;
  const id = (prefix: string) => `${prefix}-${++sequence}`;
  const users: any[] = [{ id: "admin-1", fullName: "Admin", phone: "09999999999", passwordHash: "", role: "ADMIN" }];
  const projects: any[] = [];
  const categories = [{ id: "steel", name: "فولاد", slug: "steel", parentId: null }];
  const listings: any[] = [];
  const materialRequests: any[] = [];
  const matches: any[] = [];
  const notifications: any[] = [];
  const transactions: any[] = [];

  const projectFor = (projectId: string) => projects.find((project) => project.id === projectId);
  const requestFor = (requestId: string) => materialRequests.find((materialRequest) => materialRequest.id === requestId);
  const listingFor = (listingId: string) => listings.find((listing) => listing.id === listingId);

  const database = {
    user: {
      findUnique: async ({ where }: any) => users.find((user) => user.id === where.id || user.phone === where.phone) ?? null,
      create: async ({ data }: any) => {
        const user = { id: id("user"), ...data };
        users.push(user);
        return user;
      },
    },
    project: {
      create: async ({ data }: any) => {
        const project = { id: id("project"), ...data, createdAt: new Date() };
        projects.push(project);
        return project;
      },
      findUnique: async ({ where }: any) => projectFor(where.id) ?? null,
      findMany: async ({ where }: any) => projects.filter((project) => project.ownerId === where.ownerId),
    },
    materialCategory: { findMany: async () => categories },
    listing: {
      create: async ({ data }: any) => {
        const listing = { id: id("listing"), ...data, createdAt: new Date() };
        listings.push(listing);
        return listing;
      },
      findUnique: async ({ where, include }: any) => {
        const listing = listingFor(where.id);
        return listing && include?.project ? { ...listing, project: projectFor(listing.projectId) } : listing ?? null;
      },
      findUniqueOrThrow: async ({ where, include }: any) => {
        const listing = listingFor(where.id);
        if (!listing) throw new Error("not found");
        return include?.project ? { ...listing, project: projectFor(listing.projectId) } : listing;
      },
      findMany: async ({ where, include }: any) => listings
        .filter((listing) => (!where.categoryId || listing.categoryId === where.categoryId) && (!where.status || listing.status === where.status))
        .map((listing) => include?.project ? { ...listing, project: projectFor(listing.projectId) } : listing),
      update: async ({ where, data }: any) => {
        const listing = listingFor(where.id)!;
        Object.assign(listing, data);
        return listing;
      },
    },
    materialRequest: {
      create: async ({ data }: any) => {
        const materialRequest = { id: id("request"), ...data, createdAt: new Date() };
        materialRequests.push(materialRequest);
        return materialRequest;
      },
      findUnique: async ({ where, include }: any) => {
        const materialRequest = requestFor(where.id);
        return materialRequest && include?.project ? { ...materialRequest, project: projectFor(materialRequest.projectId) } : materialRequest ?? null;
      },
      findUniqueOrThrow: async ({ where, include }: any) => {
        const materialRequest = requestFor(where.id);
        if (!materialRequest) throw new Error("not found");
        return include?.project ? { ...materialRequest, project: projectFor(materialRequest.projectId) } : materialRequest;
      },
      findMany: async ({ where, include }: any) => materialRequests
        .filter((materialRequest) => (!where.categoryId || materialRequest.categoryId === where.categoryId) && (!where.status || materialRequest.status === where.status))
        .map((materialRequest) => include?.project ? { ...materialRequest, project: projectFor(materialRequest.projectId) } : materialRequest),
    },
    match: {
      create: async ({ data }: any) => {
        if (matches.some((match) => match.listingId === data.listingId && match.requestId === data.requestId)) {
          throw Object.assign(new Error("duplicate"), { code: "P2002" });
        }
        const match = { id: id("match"), ...data, createdAt: new Date() };
        matches.push(match);
        return match;
      },
      findUnique: async ({ where, include }: any) => {
        const match = matches.find((item) => item.id === where.id) ?? null;
        if (!match || !include) return match;
        const listing = listingFor(match.listingId)!;
        const materialRequest = requestFor(match.requestId)!;
        return { ...match, listing: { ...listing, project: projectFor(listing.projectId) }, request: { ...materialRequest, project: projectFor(materialRequest.projectId) } };
      },
      findUniqueOrThrow: async ({ where }: any) => {
        const match = matches.find((item) => item.id === where.id);
        if (!match) throw new Error("not found");
        return match;
      },
      findMany: async ({ where }: any) => matches.filter((match) => {
        if (where.requestId && match.requestId !== where.requestId) return false;
        if (where.listingId && match.listingId !== where.listingId) return false;
        if (where.status && match.status !== where.status) return false;
        if (!where.OR) return true;
        return where.OR.some((condition: any) => {
          const listing = listingFor(match.listingId)!;
          const materialRequest = requestFor(match.requestId)!;
          return condition.listing?.project?.ownerId === projectFor(listing.projectId)?.ownerId || condition.request?.project?.ownerId === projectFor(materialRequest.projectId)?.ownerId;
        });
      }),
      update: async ({ where, data }: any) => {
        const match = matches.find((item) => item.id === where.id)!;
        Object.assign(match, data);
        return match;
      },
    },
    shippingEstimate: { create: async ({ data }: any) => ({ id: id("shipping"), ...data }) },
    notification: {
      create: async ({ data }: any) => {
        const notification = { id: id("notification"), ...data, isRead: false, createdAt: new Date() };
        notifications.push(notification);
        return notification;
      },
      findMany: async ({ where }: any) => notifications.filter((notification) => notification.userId === where.userId && (where.isRead === undefined || notification.isRead === where.isRead)),
      count: async ({ where }: any) => notifications.filter((notification) => notification.userId === where.userId && notification.isRead === where.isRead).length,
      updateMany: async ({ where, data }: any) => {
        const affected = notifications.filter((notification) => notification.userId === where.userId && (!where.id || notification.id === where.id) && (where.isRead === undefined || notification.isRead === where.isRead));
        affected.forEach((notification) => Object.assign(notification, data));
        return { count: affected.length };
      },
    },
    transaction: {
      create: async ({ data }: any) => {
        const transaction = { id: id("transaction"), ...data };
        transactions.push(transaction);
        return transaction;
      },
      findUnique: async ({ where }: any) => transactions.find((transaction) => transaction.id === where.id) ?? null,
    },
    $transaction: async (operation: any) => operation(database),
  };

  return database;
}

test("golden MVP API flow creates a match, notification, and transaction", async () => {
  const original = Object.assign({}, prisma) as any;
  Object.assign(prisma, createTestDatabase());
  const api = request(createApp());
  const adminToken = jwt.sign({ sub: "admin-1", role: "ADMIN" }, "dev-secret");

  try {
    const contractor = await api.post("/api/v1/auth/register").send({ fullName: "خریدار", phone: "09120000001", password: "secret", role: "CONTRACTOR" }).expect(201);
    assert.equal(typeof contractor.body.token, "string");
    await api.get("/api/v1/projects").expect(401).expect({ error: "احراز هویت لازم است" });

    const contractorProject = await api.post("/api/v1/projects").set("Authorization", `Bearer ${contractor.body.token}`).send({ name: "پروژه خریدار", city: "تهران", lat: 35.7, lng: 51.4 }).expect(201);
    const categories = await api.get("/api/v1/categories").expect(200);
    assert.equal(categories.body[0].id, "steel");

    const materialRequest = await api.post("/api/v1/requests").set("Authorization", `Bearer ${contractor.body.token}`).send({ projectId: contractorProject.body.id, categoryId: "steel", quantity: 100 }).expect(201);
    await api.get(`/api/v1/requests/${materialRequest.body.id}`).set("Authorization", `Bearer ${contractor.body.token}`).expect(200);

    const supplier = await api.post("/api/v1/auth/register").send({ fullName: "فروشنده", phone: "09120000002", password: "secret", role: "SUPPLIER" }).expect(201);
    const supplierProject = await api.post("/api/v1/projects").set("Authorization", `Bearer ${supplier.body.token}`).send({ name: "پروژه فروشنده", city: "تهران", lat: 35.7, lng: 51.4 }).expect(201);
    const listing = await api.post("/api/v1/listings").set("Authorization", `Bearer ${supplier.body.token}`).send({ projectId: supplierProject.body.id, categoryId: "steel", quantity: 50, unit: "kg", photos: [], askingPrice: 100000 }).expect(201);

    await api.patch(`/api/v1/listings/${listing.body.id}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "ACTIVE" }).expect(200);
    const matches = await api.get("/api/v1/matches?status=SUGGESTED").set("Authorization", `Bearer ${contractor.body.token}`).expect(200);
    assert.equal(matches.body.length, 1);
    assert.match(matches.body[0].reason, /50٪ هم‌پوشانی مقدار/);

    await api.post(`/api/v1/matches/${matches.body[0].id}/accept`).set("Authorization", `Bearer ${contractor.body.token}`).expect(200).expect((response) => assert.equal(response.body.status, "ACCEPTED"));
    const transaction = await api.post("/api/v1/transactions").set("Authorization", `Bearer ${contractor.body.token}`).send({ matchId: matches.body[0].id, finalPrice: 5000000 }).expect(201);
    assert.equal(transaction.body.commission, 150000);

    await api.get("/api/v1/notifications/unread-count").set("Authorization", `Bearer ${contractor.body.token}`).expect(200).expect({ count: 1 });
    const notifications = await api.get("/api/v1/notifications?unreadOnly=true").set("Authorization", `Bearer ${contractor.body.token}`).expect(200);
    assert.equal(notifications.body[0].type, "MATCH_FOUND");
    await api.patch(`/api/v1/notifications/${notifications.body[0].id}/read`).set("Authorization", `Bearer ${contractor.body.token}`).expect(204);
    await api.get("/api/v1/notifications/unread-count").set("Authorization", `Bearer ${contractor.body.token}`).expect(200).expect({ count: 0 });

    await api.patch(`/api/v1/listings/${listing.body.id}/status`).set("Authorization", `Bearer ${supplier.body.token}`).send({ status: "ACTIVE" }).expect(403);
    await api.patch(`/api/v1/listings/${listing.body.id}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "UNKNOWN" }).expect(400).expect({ error: "وضعیت نامعتبر است" });
  } finally {
    Object.keys(prisma).forEach((key) => delete (prisma as any)[key]);
    Object.assign(prisma, original);
  }
});
