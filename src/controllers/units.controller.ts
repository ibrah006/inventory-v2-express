// import { where } from "sequelize";
import { AppDataSource } from "../data-source"
import { Units } from "../entities/Units"
import { Request, Response } from "express";
import { Repository } from "typeorm";
import { IncomingMessage, ServerResponse } from "http";
import { LocalResponse } from "./helpers/localResponse.helpers";



/**
 * This funciton checks to see if the provided Units in the form of the body kof this request is found in the database
 * 
 * @returns {Units | undefined} - Units nullable, Returns Units if a corressponding Units datum is found otherwise undefined
 * 
 */
async function getUnitsDetails(unitsRepo: Repository<Units>, req: Request) : Promise<Units | undefined> {
    const details = req.body;
    try {
        const unitsDetails = await unitsRepo.findOneByOrFail(details);
        return unitsDetails;
    } catch(e) {
        return undefined;
    }
}

export default {

    async getAll<T>(repo: Repository<Units>, req: Request, res: Response) {

        // Check the base URL or the original URL to determine which route is being hit
        const fullRoute = req.baseUrl;  // This will give you the part of the URL matched by the route
        
        // Use the base URL to figure out if it's 'buying' or 'selling'
        const isBuyingUnits = fullRoute.includes('buying') ? true : fullRoute.includes('selling') ? false : undefined;

        if (isBuyingUnits == undefined) {
            throw "CANNOT FIND UNITS TYPE IN ROUTE. Cannot identify the type of units (buying or selling)";
        }

        const units = await repo.findBy({ "isBuyingUnits": isBuyingUnits });

        if (units) {
            res.json(units);
        } else {
            res.status(404).json({
                message: `No ${isBuyingUnits? "Buying" : "Selling"} units found`
            })
        }
    },

    async getUnitsById<T>(repo: Repository<Units>, req: Request, res: Response) {

        const id = Number(req.params.id);
        try {
            const unitsInfo = await repo.findOneByOrFail({ id: id })
            res.json(unitsInfo);
        } catch(e) {
            res.status(404).json({
                message: `Units info ${id} not found`
            })
        }
    },

    
    /**
     * This function checks and makes sure the requested product to be creaated does not exist before its creation.
     * @returns {Promise<LocalResponse>}
     * @attrib statusCode - either 409 meaning already exists (creation failed) or 201 meaning successfully created
     * @attrib body - a body response with warnings (if any), api call response message and id of the concerned Units datum
     */
    async createUnits<T>(repo: Repository<Units>, req: Request, res: Response) : Promise<LocalResponse> {

        // Warning message
        var warning = "";

        // Units Details
        const unitsDetailsRaw = req.body;

        if (unitsDetailsRaw.id) {
            warning += "Don't mention id parameter when creating Units\n";
            // Remove the id parameter as it's `PrimaryGeneratedColumn`, meaning it is automaticalling generated ID
            delete unitsDetailsRaw.id;
        }

        // const unitsDetails = await getUnitsDetails(repo, unitsDetailsRaw);
        // // check if the Units datum exists
        // const exists = unitsDetails != undefined;

        const warningMessage = warning? {
            warnings: warning
        } : {};

        // Create new Units
        const units = repo.create(unitsDetailsRaw); 
        await repo.save(units);

        const unitsId = (await repo.findOneBy(units))!.id;

        return new LocalResponse(
            201,
            {
                message: "Units created!",
                ...warningMessage,
                id: unitsId
            }
        )
    }
}