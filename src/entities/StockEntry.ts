import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    OneToOne
  } from "typeorm";
  import { JournalEntry } from "./JournalEntry";
import { Product } from "./Product";
import { InvoiceItem } from "./InvoiceItem";
  
  export enum StockEntryType {
    IN = "IN",       // Incoming stock (e.g., Purchase)
    OUT = "OUT"      // Outgoing stock (e.g., Sale or Write-off)
  }
  
  @Entity()
  export class StockEntry {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    productId!: string;
  
    @Column("decimal", { precision: 12, scale: 2 })
    quantity!: number;
  
    @Column("decimal", { precision: 12, scale: 2 })
    unitPrice!: number;
  
    @Column({
      type: "enum",
      enum: StockEntryType
    })
    type!: StockEntryType;
  
    @ManyToOne(() => JournalEntry, { nullable: true, eager: true })
    journalEntry?: JournalEntry;

    // link to invoice item for tracking the buying price
    @OneToOne(()=> InvoiceItem)
    invoiceItem!: InvoiceItem; 
  
    @Column({ nullable: true })
    locationId?: string;
  
    @Column({ nullable: true })
    referenceId?: string; // Purchase or Sale invoice reference
  
    @CreateDateColumn()
    date!: Date;
  
    @Column({ nullable: true })
    note?: string;
  }
  