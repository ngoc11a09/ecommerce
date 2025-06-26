import { UUID } from "crypto";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @Column()
    name: string;

    @Column({ type: 'uuid' })
    categoryId: UUID;

    @ManyToOne(() => Category, (category) => category.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    // @OneToMany(() => Variant, (variant) => variant.product)
    // variants: Variant[];
}