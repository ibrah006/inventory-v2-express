import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Invoice } from "./Invoice";

@Entity()
export class Party {

    @PrimaryColumn()
    id!: string;

    @Column()
    name!: string;

    @Column()
    type!: string;

    @Column({ nullable: true })
    location?: string;

    // TODO: fix this later
    @OneToMany(()=> Invoice, (invoice)=> invoice.party, { nullable: true })
    invoices?: Invoice[];

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            location: this.location,
            // You could include invoice IDs if needed, but generally keep it shallow
            // invoices: this.invoices?.map(inv => inv.id) ?? [],
        };
    }    
}