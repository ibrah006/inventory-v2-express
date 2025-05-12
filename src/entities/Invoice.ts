import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { Delivery } from "./Devliery";
import { Party } from "./Party";
import { InvoiceItem } from "./InvoiceItem";

@Entity()
export class Invoice {

  // Invoice number
  @PrimaryColumn()
  id!: number;

  // Invoice type (purchase/sales)
  @Column()
  type!: string;

  @Column({ nullable: true })
  poSoNumber?: string;
  
  @Column({ nullable: true })
  paymentMethod?: string;

  // Payment due date
  @Column({ nullable: true })
  dueDate?: string;

  // @Column()
  // projectDetail!: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({
    type: 'date',
    transformer: {
      to: (value: string | Date): Date | null => {
        if (!value) return null;
  
        if (value instanceof Date) return value;
  
        // Handle "dd/MM/yyyy"
        const [day, month, year] = value.split('/');
        return new Date(+year, +month - 1, +day);
      },
      from: (value: Date): Date => {
        // Return as Date so it's typed properly in your app
        return new Date(value);
      }
    }
  })
  issueDate!: Date;
  

  // Put proper precision and scale
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
  tax!: number;

  // Put proper precision and scale
  @Column(
    'decimal',
    {
      precision: 10,
      scale: 2,
      transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
      },
      nullable: true
    }
  )
  discount?: number;

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
  subTotal!: number;

  // @ManyToMany(()=> Product, (product)=> product.invoices)
  // products!: Product[];

  @OneToOne(()=> Delivery, (delivery)=> delivery.invoice, { nullable: true })
  @JoinColumn()
  delivery?: Delivery;

  // Party
  @ManyToOne(()=> Party, (party)=> party.id)
  party!: string;

  // Invoice items
  @OneToMany(()=> InvoiceItem, (invoiceItem)=> invoiceItem.invoice)
  items!: InvoiceItem[];

}