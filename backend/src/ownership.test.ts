import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "./db/prisma";
import { HttpError } from "./middlewares/http-error";
import { getListingById } from "./modules/listings/listings.service";
import { getProjectById } from "./modules/projects/projects.service";
import { getRequestById } from "./modules/requests/requests.service";

test("resource owners cannot access another user's project, listing, or request", async () => {
  const projectFindUnique = prisma.project.findUnique;
  const listingFindUnique = prisma.listing.findUnique;
  const requestFindUnique = prisma.materialRequest.findUnique;

  prisma.project.findUnique = (async () => ({ id: "project-2", ownerId: "owner-2" })) as never;
  prisma.listing.findUnique = (async () => ({
    id: "listing-2",
    project: { ownerId: "owner-2" },
  })) as never;
  prisma.materialRequest.findUnique = (async () => ({
    id: "request-2",
    project: { ownerId: "owner-2" },
  })) as never;

  try {
    for (const operation of [
      () => getProjectById("project-2", "owner-1"),
      () => getListingById("listing-2", "owner-1"),
      () => getRequestById("request-2", "owner-1"),
    ]) {
      await assert.rejects(operation, (error: unknown) => {
        if (!(error instanceof HttpError)) return false;
        return error.status === 403;
      });
    }
  } finally {
    prisma.project.findUnique = projectFindUnique;
    prisma.listing.findUnique = listingFindUnique;
    prisma.materialRequest.findUnique = requestFindUnique;
  }
});
