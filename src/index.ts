import express from 'express';
import * as dotenv from 'dotenv';

import { AppDataSource } from './data-source';

// routes
import productRoutes from './routes/product.routes';
import invoiceRoutes from './routes/invoice.routes';
import invoiceItemRoutes from './routes/invoiceItem.routes';
import stockRoutes from './routes/stock.routes';
import partyRoutes from './routes/party.routes';
import pricingListRoutes from './routes/pricingList.routes';
import buyingUnitsRoutes from './routes/buyingUnits.routes';
import sellingUnitsRoutes from './routes/sellingUnits.routes';
import dashboardOverviewRoutes from './routes/dashboardOverview.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Server of inventory v2');
});

// Initialize Database
AppDataSource.initialize()
  .then(() => {
    console.log("Connected to PostgreSQL Database");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });    
  })
  .catch((error) => console.error("Database connection error:", error));

// Routes
app.use("/products", productRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/invoiceItems", invoiceItemRoutes);
app.use("/stock", stockRoutes);
app.use("/party", partyRoutes);
app.use("/pricinglist", pricingListRoutes);
app.use("/units/buying", buyingUnitsRoutes);
app.use("/units/selling", sellingUnitsRoutes);
app.use("/dashboard", dashboardOverviewRoutes);