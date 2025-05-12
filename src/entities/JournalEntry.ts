import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn
  } from "typeorm";
  import { Account } from "./Account";
  
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
  }
  