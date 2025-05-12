import { get } from "http";
import { AppDataSource } from "../data-source"
import { Invoice } from "../entities/Invoice"

import { Request, Response } from "express";
import { Product } from "../entities/Product";
import { Delivery } from "../entities/Devliery";
import invoiceItemController from "./invoiceItem.controller";
import partyController from "./party.controller";
import { Party } from "../entities/Party";
import { InvoiceItem } from "../entities/InvoiceItem";

const invoiceRepo = AppDataSource.getRepository(Invoice);
const productRepo = AppDataSource.getRepository(Product);
const deliveryRepo = AppDataSource.getRepository(Delivery);
const invoiceItemRepo = AppDataSource.getRepository(InvoiceItem);

export default {
    async createInvoice(req: Request, res: Response) {
        try {
            const data = req.body;
            const invoiceId = data.id;
        
            console.log(`invoice body received: ${JSON.stringify(data)}`);
        
            // Save the delivery entity
            const delivery = deliveryRepo.create(data.delivery);
            const savedDelivery = await deliveryRepo.save(delivery);
            data.delivery = savedDelivery;

            console.log("delivery complete");
        
            // Get the Party (vendor or customer)
            // const partyId = data.party.id;
        
            // const party = await partyController.getParty(partyId); // throws if not found
            // data.party = party;

            console.log(`about to create invoice, data: ${JSON.stringify({
                ...data,
                // items: [], // explicitly empty for now
            })}`)
        
            // Create the invoice (without items yet)
            const invoice: Invoice = invoiceRepo.create({
                id: data.id,
                poSoNumber: data.poSoNumber,
                paymentMethod: data.paymentMethod,
                dueDate: data.dueDate,
                notes: data.notes,
                issueDate: data.issueDate,
                tax: data.tax,
                discount: data.discount,
                subTotal: data.subTotal,
                delivery: data.delivery,
                party: data.party,
                items: data.items
            });
            
            console.log('invoice created entity before save:', invoice);
            console.log(`invoice items [0], product: `, invoice.items[0].product);
    
            // await invoiceRepo.save(invoice);
            await invoiceRepo
                .createQueryBuilder()
                .insert()
                .into(Invoice)
                .values(invoice)
                .execute();
                
            console.log(`invoice saved`);
        
            // Now attach the saved invoice to each item and save them
            // const invoiceItems: InvoiceItem[] = await Promise.all(data.items.map(async (item: Partial<InvoiceItem>) => {
            //     return new InvoiceItem(item);
            // }));

            // console.log(`invoice items format complete `, JSON.stringify(data.items));

            const invoiceItemsCreate: InvoiceItem[] = invoiceItemRepo.create(data.items);

            console.log("invoice items created: ", invoiceItemsCreate);
        
            // await invoiceItemRepo.save(invoiceItemsCreate);

            await invoiceItemRepo
                .createQueryBuilder()
                .insert()
                .into(InvoiceItem)
                .values(invoiceItemsCreate)
                .execute();

            console.log("formatted invoice items saved\ninvoice creatiion successfully completed");
        
            res.status(201).json({
                message: `Invoice created ${invoiceId}`,
            });
        } catch (error) {
            console.error("Invoice creation error:", error);
            res.status(500).json({
                message: "Failed to create invoice",
                error: error,
            });
        }
    },

    async getAllInvoices(req: Request, res: Response) {
        const invoices = await invoiceRepo.find({
            relations: ['items']
        });
        res.json(invoices);
    },

    async getInvoiceById(req: Request, res: Response) {
        const invoice = await invoiceRepo.findBy({ id: Number(req.params.id) });
        if (!invoice) {
            res.status(404).json({message: "Invoice not found"})
            return;
        }

        res.json(invoice);
    },


    async updateInvoice(req: Request, res: Response) {
        try {
            await invoiceRepo.update(req.params.id, req.body);
            
            res.json({message: `Invoice updated ${req.params.id}`});
        } catch(e) {
            res.status(404).json({message: "Invoice not found"});
        }
    },

    async deleteInvoice(req: Request, res: Response) {
        await invoiceRepo.delete(req.params.id);
        res.json({message: `Invoice deleted ${req.params.id}`});
    } 
}