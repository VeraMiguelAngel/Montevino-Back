import { Category } from 'src/modules/categories/entities/category.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Bebidas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  ingredientes: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  description: string;

  @Column({ nullable: true })
    imageUrl: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  stock: number;

  @ManyToOne(() => Category, (category) => category.bebidas)
  category: Category;
}