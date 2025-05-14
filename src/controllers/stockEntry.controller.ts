
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { StockEntry, StockEntryType } from "../entities/StockEntry";
import { EntryType, JournalEntry } from "../entities/JournalEntry";
import { Product } from "../entities/Product";
import { Material } from "../entities/Material";
import { Account } from "../entities/Account";

const stockEntryRepo = AppDataSource.getRepository(StockEntry);
const journalEntryRepo = AppDataSource.getRepository(JournalEntry);
const productRepo = AppDataSource.getRepository(Product);
const accountRepo = AppDataSource.getRepository(Account);

export default {
    async add(req: Request, res: Response) {
        
        var { expenseAccountNumber, cashAccountNumber, ...body } = req.body;
        try {
            body = body as Partial<StockEntry>;
        } catch(err) {
            return res.status(400).json({
                error: err,
                message: "Invalid StockEntry body passed in"
            });
        }
        
        var stockEntry: StockEntry;
        try {
            stockEntry = stockEntryRepo.create(body as Partial<StockEntry>);
            
            // Amount of the Stock entry
            // This is the amount that is going to be either crediting/debiting the asset/revenue accounts
            const amount = stockEntry.unitPrice * stockEntry.quantity;
            
            // Fetch the product associated with the Stock entry using productId reference
            const product = (await productRepo.findOne({
                where: {
                    id: stockEntry.productId
                },
                relations: ["asset", "revenue", "cogs", "variance", "expenseCategory"]
            }))!;

            const isStockIn = stockEntry.type == StockEntryType.IN
            
            // Add Journal entries for the product's Asset, Revenue and COGS accounts

            // Add Journal entry for debiting/crediting Asset account
            product.asset?.entries.push(journalEntryRepo.create({
                amount: amount,
                entryType: isStockIn? EntryType.DEBIT : EntryType.CREDIT
            }));

            // Add Journal entries for debiting COGS and Revenue account, if Stock entry is cash out (Stock in)
            if (isStockIn) {
                // Get the expense account associated with this product or get one passed in along the body
                var expenseAccount: Account | null;
                if (product.expenseCategory) {
                    expenseAccount = product.expenseCategory!.defaultExpenseAccount;
                } else {
                    expenseAccount = await accountRepo.findOne({
                        where: { id: expenseAccountNumber }
                    });
                }

                // Check if Expense account is there
                if (!expenseAccount) {
                    return res.status(400).json({
                        entry: null,
                        message: "Stock in (Purchase) entry Error - Expense account not found",
                        error: "Make sure there is an expense account associated with this account, using the product category or pass an expense account number in the body. {expenseAccountNumber}",
                    });
                }

                // Debit Expense account
                expenseAccount!.entries.push(journalEntryRepo.create({
                    amount: amount,
                    entryType: EntryType.DEBIT
                }));

                // Credit Cash account

                cashAccountNumber = Number(cashAccountNumber);

                if (!cashAccountNumber) {
                    return res.status(400).json({
                        entry: null,
                        message: "Stock in (Purchase) entry Error - Cash account not found",
                        error: "Make sure to pass in a cash account number in the body. { cashAccountNumber }",
                    });
                }

                const cashAccount = await accountRepo.findOne({
                    where: { id: cashAccountNumber }
                });

                if (!cashAccount) {
                    return res.status(400).json({
                        entry: null,
                        message: "Stock in (Purchase) entry Error - Cash account not found",
                        error: `crediting Cash account ${cashAccountNumber} not found. Invalid Cash account.`,
                    });
                }

                // Add new journal entry for the cash account
                cashAccount.entries.push(journalEntryRepo.create({
                    amount: amount,
                    entryType: EntryType.DEBIT
                }))

                // Update the Cash account with the new journal entry for stock in
                await accountRepo.save(cashAccount);
            } else {
                // input for: Selling or Buying
                // get average cost of materials (won't be needed in most cases)
                // meaning we could just take the first material's cost 
                // Material cost for selling (Stock out) or buying (Stock in)
                const materialCost = Material.getAverageCostOfMaterials(stockEntry.invoiceItem.materials, isStockIn);

                product.cogs?.entries.push(journalEntryRepo.create({
                    amount: materialCost,
                    entryType: EntryType.DEBIT
                }));

                 // Add Journal entry for debiting/crediting Revenue account
                product.revenue?.entries.push(journalEntryRepo.create({
                    amount: amount,
                    entryType: EntryType.DEBIT
                }));
            }
            
            // Save the updated changes on the product
            await productRepo.save(product);

            // Add the new Stock entry
            await stockEntryRepo.save(stockEntry);

            res.status(201).json({
                entry: stockEntry,
                message: "Successfully added stock entry"
            });
        } catch(err) {
            res.status(500).json({
                entry: null,
                message: "Server error: Unhandled error",
                error: err
            });
        }
    },

    // required id as parameter
    async getById(req: Request, res: Response) {
        const id = Number(req.params.id)

        const stockEntry = await stockEntryRepo.findOne({
            where: {
                id: id
            },
            relations: ["journalEntry"]
        });

        if (stockEntry) {
            return res.json({
                entry: stockEntry,
                message: "Success"
            });
        }
        return res.status(404).json({
            entry: null,
            message: `Stock entry with id ${id} not found`
        })
    },

    async getAll(req: Request, res: Response) {
        const entries = stockEntryRepo.find({
            relations: ["journalEntry"]
        });

        return res.json(entries);
    } 
};