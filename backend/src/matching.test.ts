import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "./db/prisma";
import { createMatchIfNew, scoreMatch } from "./modules/matching/matching.service";

const request = {
  id: "request-1",
  categoryId: "steel",
  quantity: 100,
  project: { ownerId: "owner-1", lat: 35.7, lng: 51.4 },
};

const listing = {
  id: "listing-1",
  categoryId: "steel",
  quantity: 50,
  project: { lat: 35.7, lng: 51.4 },
};

test("matching score requires category and quantity overlap and accounts for distance", () => {
  assert.deepEqual(scoreMatch(request, { ...listing, categoryId: "cement" }), {
    score: 0,
    reason: "دسته مصالح متفاوت است",
  });
  assert.deepEqual(scoreMatch(request, { ...listing, quantity: 0 }), {
    score: 0,
    reason: "مقدار قابل تطبیق نیست",
  });

  const nearby = scoreMatch(request, listing);
  assert.equal(nearby.score, 70);
  assert.match(nearby.reason, /50٪ هم‌پوشانی مقدار/);
  assert.equal(nearby.distanceKm, 0);

  const distant = scoreMatch(request, {
    ...listing,
    quantity: 100,
    project: { lat: 37.7, lng: 51.4 },
  });
  assert.ok(distant.score < 100);
  assert.match(distant.reason, /فاصله/);
});

test("duplicate match constraint is treated as an existing match", async () => {
  const transaction = prisma.$transaction;
  prisma.$transaction = (async (operation: (client: unknown) => Promise<unknown>) => {
    const error = Object.assign(new Error("duplicate"), { code: "P2002" });
    return operation({ match: { create: async () => Promise.reject(error) } });
  }) as never;

  try {
    const result = await createMatchIfNew("request-1", "listing-1", scoreMatch(request, listing));
    assert.equal(result, undefined);
  } finally {
    prisma.$transaction = transaction;
  }
});
