import { AppDataSource } from "../data-source";
import { Product, ProductJson } from "../entities/Product";
import { Request, Response } from "express";
import unitsController from "./units.controller";
import { BuyingUnits } from "../entities/BuyingUnits";
import { SellingUnits } from "../entities/SelingUnits";
import { LocalResponse } from "./helpers/localResponse.helpers";
import { PricingList } from "../entities/PricingList";
import pricingListController from "./pricingList.controller";


const productRepo = AppDataSource.getRepository(Product);

const buyingUnitsRepo = AppDataSource.getRepository(BuyingUnits);
const sellingUnitsRepo = AppDataSource.getRepository(SellingUnits);

const pricingListRepo = AppDataSource.getRepository(PricingList);


export default {
    /**
     * Creates a new product by handling various associated entities (buying units, selling units, pricing list)
     * and saving the product data to the database.
     * 
     * @returns A Promise that resolves to void, sending a JSON response containing the created product if successful,
     *          or an error response with the appropriate status code if validation fails or unimplemented functionality is encountered.
     * 
     * @throws {501} - If stockEntries or invoices are provided but unimplemented functionality is detected.
     * @throws {409} - If a conflict occurs when creating a pricing list (e.g., the pricing list already exists).
     * 
     * @example
     * // Example request body format for creating a product
     * {
     *   "id": "PRD-10000",
     *   "name": "Product Name",
     *   "barcode": "0"
     *   "stockingUnit": "unit",
     *   "unitPrice": 20.5,
     *   "buyingUnits": {  buying unit details },
     *   "sellingUnits": { selling unit details },
     *   "pricingList": { pricing list details }
     * }
     */
    async createProduct(req: Request, res: Response) {

        const data = req.body;

        console.log(`product creation raw: ${JSON.stringify(data)}`);

        if (!data.stockEntries) {
            data.stockEntries = [];
        }
        else if (data.stockEntries.length > 0) {
            res.status(501).json({message: "Server Error (Unimplemented): Passed stock entries upon creating product. stockEntries of list of type Map need to be converted to their respective Entity/Model."});
            return;
        }
        if (!data.invoices) {
            data.invoices = [];
        } else if (data.invoices.length > 0) {
            res.status(501).json({message: "Server Error (Unimplemented): Passed invoices upon creating product. invoices of list of type Map need to be converted to their respective Entity/Model."});
            return;
        }

        // Create Buying and Selling Units
        const copyReqB = req;
        copyReqB.body = data.buyingUnits;
        const buyingUnitsResponse: LocalResponse = await unitsController.createUnits<BuyingUnits>(buyingUnitsRepo, copyReqB, res);
        const buyingUnitsId: number = buyingUnitsResponse.body.id;

        const copyReqS = req;
        copyReqS.body = data.sellingUnits;
        const sellingUnitsResponse: LocalResponse = await unitsController.createUnits<SellingUnits>(sellingUnitsRepo, copyReqS, res);
        const sellingUnitsId: number = sellingUnitsResponse.body.id;

        console.log(`selling units for product ${data.id}: ${JSON.stringify(data.sellingUnits)}`);

        // Assign the Buying and Selling unit Ids
        data.buyingUnits = buyingUnitsId;
        data.sellingUnits = sellingUnitsId;

        // Create or Assign to an existing PricingList
        // The LocalResponse sends a 409 status code if the pricing list already exists
        const pricingList: LocalResponse = await pricingListController.createPricingList(data.pricingList);
        data.pricingList = {
            ...data.pricingList,
            id: pricingList.body.id
        }

        console.log(`product creation raw before saving: ${JSON.stringify(data)}`);

        // Create and Save to Database
        const product = productRepo.create(data);
        await productRepo.save(product);
        res.status(201).json(product);
    },


    /**
     * Retrieves all products from the database with optional relational data, based on query parameters.
     * 
     * Query Parameters:
     * - `stockEntries` (boolean): If true, includes stock entries for each product.
     * - `invoices` (boolean): If true, includes invoice data related to each product.
     * - 'buyingUnits': LOCKED TRUE
     * - 'sellingUnits': LOCKED TRUE
     * - 'pricingList': LOCKED TRUE
     * 
     * @returns A JSON response containing the list of products, with optional related data 
     * based on the query parameters.
     * 
     * @example
     * // Request to fetch products with stock entries but no invoice data
     * GET /data?stockEntries=true&invoices=false
     * 
     * @example
     * // Request to fetch products with both stock entries and invoice data
     * GET /data?stockEntries=true&invoices=true
     */
    async getAllProducts(req: Request, res: Response) {

        const { stockEntries, invoices } = req.query;
        
        // Determine which relations to include as specefied in the query params
        let relationsToInclude = [
            'buyingUnits', 'sellingUnits', 'pricingList'
        ];
        if (stockEntries || invoices) {
            relationsToInclude = [];
            if (stockEntries) relationsToInclude.push("stockEntries");
            if (invoices) relationsToInclude.push("invoices");
        }

        var products = await productRepo.find({
            relations: relationsToInclude
        });

        res.json(products);
    },

    async getProductById(req: Request, res: Response) {
        const product = await productRepo.findOneBy({ id: req.params.id });
        if (!product) {
            res.status(404).json({"message": "Product not found"});
            return;
        }

        res.json(product);
    },

    async updateProduct(req: Request, res: Response) {
        await productRepo.update(req.params.id, req.body);
        res.json({message: "Product updated"});
    },

    async deleteProduct(res: Response, req: Request) {
        await productRepo.delete(req.params.id);
        res.json({message: "Product deleted"});
    },

    // identifier could be one of these: description, barcode, id, name
    async itemsLookup(req: Request, res: Response) {

        const searchQuery = req.body.query;
        const identifierType = req.body.identifier;

        if (!searchQuery) {
            res.status(400).json({
                message: `Bad request. Please provide search query [body.query]`
            });
            return;
        }
        console.log(`identifier type: ${identifierType}`)

        const findQuery = identifierType =="description"? {
            id: searchQuery.id,
            name: searchQuery.name,
        } : identifierType == "barcode"? {
            barcode: searchQuery.barcode
        } : identifierType == "id"? {
            id: searchQuery.id
        } : identifierType == "name"? {
            name: searchQuery.name
        } : null;

        if (findQuery) {
            const items = await productRepo.findBy(findQuery);

            if (items.length > 0) {
                res.json(items);
            } else {
                res.status(404).json({
                    message: "Item not found"
                });
            }
        } else {
            res.status(400).json({
                message: !identifierType? 'Please provide a search identifier type [body.identifierType]' : `Bad request. Search identifier type ${identifierType} not found. Available identifier types: 'description', 'barcode', 'id'`
            });
        }
    }
}