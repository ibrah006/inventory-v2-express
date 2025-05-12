
import { Router } from "express";

import UnitsController from "../controllers/units.controller";

const router = Router();

router.get("/:id", UnitsController.getUnitsById);
router.post("/", UnitsController.createUnits);
