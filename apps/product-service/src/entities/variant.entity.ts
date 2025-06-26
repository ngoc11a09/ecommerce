import { UUID } from "crypto";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('variant')
@Unique(['productId', 'sku'])
export class Variant {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @Column({ type: 'uuid' })
    productId: string;

    @Column({ unique: true })
    sku: string;

    @Column()
    price: number;

    @Column()
    stock: number;

    // @ManyToOne(() => Product, (product) => product.variants)
    // @JoinColumn({ name: 'productId' })
    // product: Product;
}