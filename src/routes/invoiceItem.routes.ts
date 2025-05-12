import { Router } from "express";
import InvoiceItemContoller from "../controllers/invoiceItem.controller";

const router = Router();

router.get("/", InvoiceItemContoller.getAllItems);
router.get("/sales", InvoiceItemContoller.getSalesOverview)

export default router;