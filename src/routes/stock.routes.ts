import { Router } from "express";
import StockController from "../controllers/stock.controller";


const router = Router();

router.get("/", StockController.getStock);
router.get("/:id", StockController.getStockById);
router.get("/products/:productId", StockController.getStockByProductId);
router.put("/", StockController.updateStock);

export default router;