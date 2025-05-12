
import { Router } from "express";
import ProductController from "../controllers/product.controller";

const router = Router();

router.post("/", ProductController.createProduct);
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);
// Items lookup endpoint
router.post("/lookup", ProductController.itemsLookup);

export default router;
