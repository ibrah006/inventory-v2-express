import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    OneToMany
  } from "typeorm";
  import { Account } from "./Account";
import { StockEntry } from "./StockEntry";
  
  export enum EntryType {
    DEBIT = "Debit",
    CREDIT = "Credit"
  }
  
  @Entity()
  export class JournalEntry {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @ManyToOne(() => Account, (account) => account.entries, { eager: true })
    account!: Account;
  
    @Column("decimal", { precision: 12, scale: 2 })
    amount!: number;
  
    @Column({
      type: "enum",
      enum: EntryType
    })
    entryType!: EntryType;
  
    @Column({ nullable: true })
    description!: string;
  
    @CreateDateColumn()
    date!: Date;

    @OneToMany(()=> StockEntry, (entry)=> entry.journalEntry)
    stockEntries!: StockEntry[];
  }
  