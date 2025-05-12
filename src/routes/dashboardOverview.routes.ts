import { Router } from "express";
import DashboardOverviewController from "../controllers/dashboardOverview.controller";

const router = Router();

router.get("/stats", DashboardOverviewController.dashboardStatistics);

export default router;
