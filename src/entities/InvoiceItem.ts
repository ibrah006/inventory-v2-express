import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { Invoice } from "./Invoice";
import { StockEntry } from "./StockEntry";
import { Material } from "./Material";


@Entity()
export class InvoiceItem {

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(()=> Product, (product)=> product.invoiceItems, {nullable: false})
  product!: Product;

  // Pointer to the invoice number
  @ManyToOne(()=> Invoice, (invoice)=> invoice.items)
  invoice!: Invoice;

  @Column('int')
  measure!: number;

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
  cost!: number;

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
  amount!: number;

  @OneToMany(()=> Material, (material)=> material.invoiceItem)
  materials!: Material[];

}