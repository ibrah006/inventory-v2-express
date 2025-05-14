import { Entity, Column, OneToMany, PrimaryColumn } from "typeorm";
import { JournalEntry } from "./JournalEntry";


@Entity()
export class Account {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  type!: 'ASSET' | 'REVENUE' | 'COGS' | 'VARIANCE' | 'EXPENSE' | 'CASH';

  @OneToMany(() => JournalEntry, (entry) => entry.account)
  entries!: JournalEntry[];
}
