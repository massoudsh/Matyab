import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { projectsRouter } from "../modules/projects/projects.routes";
import { categoriesRouter } from "../modules/categories/categories.routes";
import { listingsRouter } from "../modules/listings/listings.routes";
import { requestsRouter } from "../modules/requests/requests.routes";
import { matchingRouter } from "../modules/matching/matching.routes";
import { pricingRouter } from "../modules/pricing/pricing.routes";
import { qualityRouter } from "../modules/quality/quality.routes";
import { shippingRouter } from "../modules/shipping/shipping.routes";
import { transactionsRouter } from "../modules/transactions/transactions.routes";
import { procurementRouter } from "../modules/procurement/procurement.routes";
import { notificationsRouter } from "../modules/notifications/notifications.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/listings", listingsRouter);
apiRouter.use("/listings", pricingRouter); // /listings/:id/price-suggestion
apiRouter.use("/listings", qualityRouter); // /listings/:id/quality-score
apiRouter.use("/requests", requestsRouter);
apiRouter.use("/matches", matchingRouter);
apiRouter.use("/shipping", shippingRouter);
apiRouter.use("/transactions", transactionsRouter);
apiRouter.use("/procurement", procurementRouter);
apiRouter.use("/notifications", notificationsRouter);
