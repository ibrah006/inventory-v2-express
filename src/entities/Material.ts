import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Product } from "./Product";
import { InvoiceItem } from "./InvoiceItem";


@Entity()
export class Material {
    @PrimaryColumn()
    barcode!: number;

    @Column()
    productId!: string;

    @ManyToOne(()=> InvoiceItem, (invoiceItem)=> invoiceItem.materials)
    invoiceItem!: InvoiceItem;

    // quantity / roll meter
    @Column(
    'decimal',
    {
        precision: 10,
        scale: 2,
        transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
        },
        nullable: true
    }
    )
    measure!: number;

    // The cost at which this item has been purchased
    @Column(
    'decimal',
    {
        precision: 10,
        scale: 2,
        transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
        },
        nullable: false
    }
    )
    buyingCost!: number;

    // The cost at which the item is sold
    @Column(
    'decimal',
    {
        precision: 10,
        scale: 2,
        transformer: {
        to: (value: number) => value, // store as is
        from: (value: string): number => parseFloat(value), // convert to number when reading
        },
        nullable: true
    }
    )
    sellingCost?: number;

    static getAverageCostOfMaterials(materials: Material[], isBuyingCost: boolean) : number {
        const sum = materials.reduce((prevValue: number, curr: Material)=> {
            return prevValue + (isBuyingCost? curr.buyingCost : (curr.sellingCost?? 0));
        }, 0);

        return sum / materials.length;
    }

}