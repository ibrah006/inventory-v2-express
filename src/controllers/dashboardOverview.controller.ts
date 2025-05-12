import { Between, LessThan } from "typeorm";
import { AppDataSource } from "../data-source";
import { Invoice } from "../entities/Invoice";
import { Product } from "../entities/Product";
import { Stock } from "../entities/Stock";
import { Request, Response } from "express";

const productRepo = AppDataSource.getRepository(Product);
const stockRepo = AppDataSource.getRepository(Stock);
const invoiceRepo = AppDataSource.getRepository(Invoice);

export default {
    async dashboardStatistics(req: Request, res: Response) {
        try {
            // Use days from query param, default to 5
            const days = parseInt(req.query.days as string) || 5;
        
            const now = new Date();
            const since = new Date();
            since.setDate(now.getDate() - days);
        
            // 1. Total products
            const totalProducts = await productRepo.count();
        
            // 2. Total individual items in stock
            const allStock = await stockRepo.find();
            const totalItemsInStock = allStock.reduce((sum, stock) => sum + stock.measure, 0);
        
            // 3. Low stock items (you can define your own threshold, e.g. < 10)
            const lowStockItems = await stockRepo.find({
              where: {
                measure: LessThan(10)
              },
              relations: ["product"]
            });
        
            // 4. Recent purchase invoices (last N days)
            const recentPurchases = await invoiceRepo.find({
              where: {
                type: "purchase",
                issueDate: Between(since, now)
              },
              relations: ["items", "party", "delivery"]
            });
        
            // 5. Recent sales invoices (last N days)
            const recentSales = await invoiceRepo.find({
                where: {
                    type: "sales",
                    issueDate: Between(since, now)
                },
                relations: ["items", "party", "delivery"]
            });
        
            // Final JSON response
            res.json({
                products_count: totalProducts,
                items_in_stock: totalItemsInStock,
                low_stock_items: lowStockItems,
                recent_purchases: recentPurchases,
                recent_sales: recentSales
            });
        
        } catch (error) {
            console.error("Error in inventory dashboard:", error);
            res.status(500).json({
                message: "Failed to load inventory dashboard",
                error
            });
        }
    }
}