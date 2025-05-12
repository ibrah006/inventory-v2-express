import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";

@Entity()
export class PricingList {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column(
    'decimal',
    {
      nullable: true,
      precision: 10,
      scale: 2,
      transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
      }
    }
  )
  web?: number;

  @Column(
    'decimal',
    {
      nullable: true,
      precision: 10,
      scale: 2,
      transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
      }
    }
  )
  premium?: number;

  @Column(
    'decimal',
    {
      nullable: true,
      precision: 10,
      scale: 2,
      transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
      }
    }
  )
  retail?: number;

  @Column(
    'decimal',
    {
      nullable: true,
      precision: 10,
      scale: 2,
      transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
      }
    }
  )
  wholesale?: number;

  @Column(
    'decimal',
    {
      nullable: true,
      precision: 10,
      scale: 2,
      transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
      }
    }
  )
  referral?: number;

  @OneToMany(()=> Product, (product)=> product.pricingList)
  products!: Product[];
}