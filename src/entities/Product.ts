import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, ManyToOne } from 'typeorm';
import { Stock } from './Stock';
import { Invoice } from './Invoice';
import { Units } from './Units';
import { PricingList } from './PricingList';
import { BuyingUnits } from './BuyingUnits';
import { SellingUnits } from './SelingUnits';
import { AppDataSource } from '../data-source';
import { InvoiceItem } from './InvoiceItem';
import { Account } from './Account';
import { StockEntry } from './StockEntry';
import { Material } from './Material';
import { Category } from './Category';
import { deprecate } from 'util';

interface ProductInterface {
  id: string;
  name: string;
  barcode: number;
  category?: string;
  stockingUnit: string;
  unitPrice: number;
  stockEntries: Stock[] | undefined;
  invoices: Invoice[] | undefined;
  pricingList: PricingList,
  buyingUnits: BuyingUnits | undefined;
  sellingUnits: SellingUnits | undefined;
}

export class ProductJson {
  constructor(product: ProductInterface) {
    this.id = product.id;
    this.name = product.name;
    this.barcode = product.barcode;
    this.category = product.category;
    this.stockingUnit = product.stockingUnit;
    this.unitPrice = product.unitPrice;
    this.stockEntries = product.stockEntries;
    this.invoices = product.invoices;
    this.pricingList = product.pricingList;
    this.buyingUnits = product.buyingUnits;
    this.sellingUnits = product.sellingUnits;
  }
  id: string;
  name: string;
  barcode: number;
  category?: string;
  stockingUnit: string;
  unitPrice: number;
  stockEntries: Stock[] | undefined;
  invoices: Invoice[] | undefined;
  pricingList: PricingList;
  buyingUnits: BuyingUnits | undefined;
  sellingUnits: SellingUnits | undefined;
}

@Entity()
export class Product {

  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @PrimaryGeneratedColumn()
  barcode!: number;

  /**
 * @deprecated Use `ExpenseCategory` instead.
 */
  @Column({ nullable: true })
  category?: string;

  @Column()
  stockingUnit!: string;

  /**
   * @deprecated unitPrice is deprecated and will be replaced with PricingList entity
   */
  @Column(
    'decimal',
    {
      precision: 10,
      scale: 2,
      transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
      }
    }
  )
  unitPrice!: number;

  @OneToMany(()=> Stock, (stock)=> stock.product)
  stockEntries!: Stock[];

  @OneToMany(()=> Invoice, (invoice)=> invoice.id)
  invoices!: Invoice[];

  @OneToMany(()=> InvoiceItem, (item)=> item.product)
  invoiceItems!: Invoice[];

  @ManyToOne(()=> BuyingUnits, (units)=> units.id)
  /**
   * This attribute holds the id of the buying units (Units entity)
   */
  buyingUnits!: number;

  @ManyToOne(()=> SellingUnits, (units)=> units.id)
  /**
   * This attribute holds the id of the buying units (Units entity)
   */
  sellingUnits!: number;

  @ManyToOne(()=> PricingList, (pricingList)=> pricingList.products)
  pricingList!: PricingList;

  // Accounts

  @ManyToOne(()=> Account, (account)=> account)
  asset?: Account;

  @ManyToOne(()=> Account, (account)=> account)
  revenue?: Account;

  @ManyToOne(()=> Account, (account)=> account)
  cogs?: Account;

  @ManyToOne(()=> Account, (account)=> account)
  variance?: Account;

  // Category
  @ManyToOne(()=> Category, (category)=> category.products)
  expenseCategory?: Category;

  toJson() {
    return new ProductJson({
      id: this.id,
      name: this.name,
      barcode: this.barcode,
      category: this.category,
      stockingUnit: this.stockingUnit,
      unitPrice: this.unitPrice,
      stockEntries: this.stockEntries,
      invoices: this.invoices,
      pricingList: this.pricingList,
      buyingUnits: undefined,
      sellingUnits: undefined
    });
  }

  // other relations
}

