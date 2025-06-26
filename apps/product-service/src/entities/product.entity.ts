import { UUID } from "crypto";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @Column()
    name: string;

    @Column()
    basePrice: number;

    @Column({ unique: true })
    cost: string;

    @ManyToOne(() => Category, (category) => category.products)
    category: Category;

    // @OneToMany(() => Variant, (variant) => variant.product)
    // variants: Variant[];
}