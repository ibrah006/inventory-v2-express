import { AppDataSource } from "../data-source"
import { InvoiceItem } from "../entities/InvoiceItem"

import { Request, Response } from "express";
import { Product } from "../entities/Product";
import { Invoice } from "../entities/Invoice";

const invoiceItemRepo = AppDataSource.getRepository(InvoiceItem);
const productRepo = AppDataSource.getRepository(Product);

export default {

    async getAllItems(req: Request, res: Response) {
        const invoiceItems = await invoiceItemRepo.find({
            relations: ['invoice', 'product']
        })
        res.json(invoiceItems);
    },  

    /* For now thi function only calculates sales for the last 7 days.
     **/
    async getSalesOverview(req: Request, res: Response) {

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const rawItems = await invoiceItemRepo
            .createQueryBuilder("item")
            .innerJoinAndSelect("item.product", "product")
            .innerJoinAndSelect("item.invoice", "invoice")
            .where("invoice.issueDate BETWEEN :start AND :end", {
                start: sevenDaysAgo,
                end: now,
            })
            .getMany();

        // Add 'type' field and group by category
        const groupedByCategory: { [category: string]: any[] } = {};

        for (const item of rawItems) {
        const category = item.product.category ?? "Uncategorized";

        const plainItem = {
            ...item,
            type: item.invoice.type, // Add the 'type' field based on the invoice
        };

        if (!groupedByCategory[category]) {
            groupedByCategory[category] = [];
        }

        groupedByCategory[category].push(plainItem);
        }

        const categories: any[][] = Object.values(groupedByCategory);

        res.json(categories);
    },

    async createInvoiceItems(items: []) {
        // const invoiceItemsFromatted = data.items.map(async (item: Partial<InvoiceItem>) => {
        //     return new InvoiceItem({
        //         cost: item.cost,
        //         amount: item.amount,
        //         measure: item.measure,
        //         product: item.product,
        //         invoice: savedInvoice[0], // ✅ now the invoice exists
        //     });
        // });

        // const invoiceItems = invoiceItemRepo.create(invoiceItemsFormatted);
        // await invoiceItemRepo.save(invoiceItems);
    }
}