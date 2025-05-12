import { Router } from "express";
import { AppDataSource } from "../data-source";
import { BuyingUnits } from "../entities/BuyingUnits";
import unitsController from "../controllers/units.controller";
import { LocalResponse } from "../controllers/helpers/localResponse.helpers";

const router = Router();

const buyingUnitsRepo = AppDataSource.getRepository(BuyingUnits);

router.get("/", (req, res) => {
    unitsController.getAll<BuyingUnits>(buyingUnitsRepo, req, res);
});

router.get("/:id", (req, res) => {
    unitsController.getUnitsById<BuyingUnits>(buyingUnitsRepo, req, res);
});

router.post("/", async (req, res) => {
    const localResponse: LocalResponse = await unitsController.createUnits<BuyingUnits>(buyingUnitsRepo, req, res);

    res.status(localResponse.statusCode).json(localResponse.body);
});

export default router;