import { Router } from "express";
import PricingListController from "../controllers/pricingList.controller";

const router = Router();

router.get('/', PricingListController.getAll);

export default router;