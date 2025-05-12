import { Router } from "express";
import { AppDataSource } from "../data-source";
import { SellingUnits } from "../entities/SelingUnits";
import unitsController from "../controllers/units.controller";
import { LocalResponse } from "../controllers/helpers/localResponse.helpers";

const router = Router();

const sellingUnitsRepo = AppDataSource.getRepository(SellingUnits);


router.get("/", (req, res) => {
    unitsController.getAll<SellingUnits>(sellingUnitsRepo, req, res);
});


router.get("/:id", (req, res) => {
    unitsController.getUnitsById<SellingUnits>(sellingUnitsRepo, req, res);
});

router.post("/", async (req, res) => {
    const localResponse: LocalResponse = await unitsController.createUnits<SellingUnits>(sellingUnitsRepo, req, res);

    res.status(localResponse.statusCode).json(localResponse.body);
});

export default router;