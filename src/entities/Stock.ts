
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";

import { Product } from "./Product";

@Entity()
export class Stock {

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(()=> Product, (product)=> product.stockEntries, { onDelete: "CASCADE" })
  product!: Product;

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
  value!: number;
}