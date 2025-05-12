import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";


@Entity()
export class Units {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('boolean')
	isBuyingUnits!: boolean;

	@Column()
	unit!: string;
	
	@Column(
		'decimal',
		{
			transformer: {
				to: (value: number)=> parseFloat(value.toFixed(5)),
				from: (value: string): number => parseFloat(value)
			}
		}
	)
	relationship!: number;

	@Column()
	relationBy!: string;
}