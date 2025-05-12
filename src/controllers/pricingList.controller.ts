import { LocalResponse } from "../controllers/helpers/localResponse.helpers";
import { AppDataSource } from "../data-source";
import { PricingList } from "../entities/PricingList";

import { Request, Response } from "express";

const pricingListRepo = AppDataSource.getRepository(PricingList);

export default {

    async getAll(req: Request, res: Response) {
        const pricingLists = await pricingListRepo.find();

        res.json(pricingLists);
    },

    /**
     * 
     * @param data : is te pricing list details. Takes the properties of PricingList model in JSON format
     * @returns {Promise<LocalResponse>}
     */
    async createPricingList(data: any) : Promise<LocalResponse> {

        delete data.id;

        var pricingListId: number;

        var responseCode: number;
        try {
            const pricingList = await pricingListRepo.findOneByOrFail(data);
            responseCode = 409;

            pricingListId = pricingList.id;

            console.log(`pricing list ${pricingListId} already exists, aborting creation...`)
        } catch(e) {
            console.log(`creating new pricing list`);

            // Only create new Pricing List if one doesn't exist
            const pricingList = pricingListRepo.create(data);

            await pricingListRepo.save(pricingList);

            pricingListId = (await pricingListRepo.findOneBy(data))!.id;
            
            responseCode = 201;
        }

        const message = responseCode == 201? "PricingList successfully created" : "PricingList with provided details already exists";

        return new LocalResponse(
            responseCode,
            {
                id: pricingListId,
                message: message,
            }
        );
    }
};
