import { Router } from "express";
import PartyController from "../controllers/party.controller";

const router = Router();

router.get("/", PartyController.getParties);
router.get("/:id", PartyController.getPartyById);
router.post("/", PartyController.createParty);
router.put("/", PartyController.updateParty);

export default router;