import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Invoice } from "./Invoice";


@Entity()
export class Delivery {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    status?: string;

    @Column({ nullable: true })
    dueDate?: string;

    @OneToOne(()=> Invoice, (invoice)=> invoice.delivery)
    invoice!: Invoice;

    toJSON() {
        return {
            id: this.id,
            status: this.status,
            dueDate: this.dueDate,
            invoiceId: this.invoice?.id, // just return the ID to avoid circular reference
        };
    }
}