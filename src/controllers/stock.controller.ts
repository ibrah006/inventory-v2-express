import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Stock } from "../entities/Stock";
import { Product } from "../entities/Product";
import { LocalResponse } from "./helpers/localResponse.helpers";

const stockRepo =  AppDataSource.getRepository(Stock);
const productRepo =  AppDataSource.getRepository(Product);

export default {

    async getStock(req: Request, res: Response) {
        res.json(await stockRepo.find({
            relations: ['product', 'product.buyingUnits', 'product.sellingUnits', 'product.pricingList']
        }));
    },

    async getStockById(req: Request, res: Response) {
        const stockItem = await stockRepo.findOneBy({ id: Number(req.params.id) })
        if (!stockItem) {
            res.status(404).json({message: `Stock item with id ${req.params.id} not found `})
            return;
        }

        res.json(stockItem);
    },

    async getStockByProductId(req: Request, res: Response) {
        const productId = req.params.productId;

        const product = await productRepo.findOneBy({ id: productId });
        if (!product) {
            res.status(404).json({message: `Failed to find stock item with product id ${productId}. Product not found`})
            return;
        }

        try {
            const stockItem = await stockRepo.findOneByOrFail({ product: product })

            res.json(stockItem);
        } catch(e) {
            res.status(404).json({message: `Stock information with product id ${productId} not found. err: ${e}`})
        }
    },

    async updateStock(req: Request, res: Response) {

        const stockData = req.body;

        console.log(`stock data raw: ${JSON.stringify(stockData)}`)

        const productId = stockData.product.id;
        const product = await productRepo.findOneBy({ id: productId });;

        if (!product) {
            res.status(404).json({message: `Product with id ${productId} not found for updating stock`});
            return;
        }
        // if product != null
        stockData.product = product;

        var response: LocalResponse;
        
        try {
            var stock = await stockRepo.findOneByOrFail({ product: product });

            // TODO: make changes before the actual parameters before
            await stockRepo.save(stock!);

            response = new LocalResponse(200, {
                id: 0,
                message: "Stock updated successfully"
            });
        } catch(e) {
            // .create() -> type List of type Entity, in this case it's Stock[]
            // Because we can pass in multiple stock rows, we'll need to explicitly select the first Stock,
            // assuming we don't update multiple stock data rows at the same time using this function (updateStock)
            const stock = stockRepo.create(stockData);

            console.log(`stock data before details: ${JSON.stringify(stockData)}`);

            await stockRepo.save(stock);

            response = new LocalResponse(201, {
                id: 0,
                message: "Stock profile successfully created for product "
            });
        }

        res.status(response.statusCode).json({
            message: response.body.message
        });
        
    }
};