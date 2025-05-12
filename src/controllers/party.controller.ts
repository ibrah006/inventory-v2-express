import { AppDataSource } from "../data-source"
import { Party } from "../entities/Party"

import { Request, Response } from "express";

const partyRepo = AppDataSource.getRepository(Party);

export default {

    async getParties(req: Request, res: Response) {
        try {
            const parties = await partyRepo.find();

            res.json(parties);
        } catch(e) {
            res.status(500).json({message: "Failed to get parties"})
        }
    },

    async getParty(id: string) {
        const party = await partyRepo.findOneByOrFail({ id: id });

        return party;
    },

    async getPartyById(req: Request, res: Response) {
        const id = req.params.id;

        try {
            const party = await this.getParty(id);

            res.json(party);
        } catch(e) {
            res.status(404).json({message: `Failed to get party with id ${id}`})
        }
    },

    async createParty(req: Request, res: Response) {
        try {
            const party = partyRepo.create(req.body);
            await partyRepo.save(party);

            res.status(201).json({message: "Party created"})
        } catch(e) {
            res.status(400).json({message: "Please provide a valid request with the required body"})
            return;
        }
    },

    async updateParty(req: Request, res: Response) {
        const id = req.params.id;

        try {
            await partyRepo.update(id, req.body);

            res.status(201).json({message: `Party ${id} updated`})
        } catch(e) {
            res.status(400).json({message: `Party ${id} not found for updating or invalid body provided`})
            return;
        }
    }

}