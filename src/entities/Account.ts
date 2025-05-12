import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { JournalEntry } from "./JournalEntry";

export enum AccountType {
  ASSET = "Asset",
  REVENUE = "Revenue",
  COGS = "COGS",
  VARIANCE = "Variance"
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: AccountType
  })
  type!: AccountType;

  @OneToMany(() => JournalEntry, (entry) => entry.account)
  entries!: JournalEntry[];
}
