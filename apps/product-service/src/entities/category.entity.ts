import { UUID } from "crypto";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('category')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @Column()
    name: string;

    @Column({ type: 'uuid', nullable: true })
    parentId: UUID | null;

    @Column({ type: 'uuid', nullable: true })
    shopId: UUID | null;

    @ManyToOne(() => Category, (category) => category.children, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'parentId' })
    parent: Category;

    @OneToMany(() => Category, (category) => category.parent)
    children: Category[];

    @OneToMany(() => Product, (product) => product.category, { cascade: true })
    products: Product[];
}