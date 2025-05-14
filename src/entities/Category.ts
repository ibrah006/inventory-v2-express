import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./Account";
import { Product } from "./Product";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @ManyToOne(() => Account, { nullable: true })
    defaultExpenseAccount!: Account;

    // Products with this category
    @OneToMany(()=> Product, (product)=> product.expenseCategory)
    products!: Product[];
}
