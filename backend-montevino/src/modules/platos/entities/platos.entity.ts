import { Category } from 'src/modules/categories/entities/category.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TipoProducto } from '../dto/create-platos.dto';

@Entity({ name: 'platos' })

export class Platos {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
        type: "varchar",
        length: 50,
        unique: true,
    })
    name: string;
    
  @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false,
    })
    price: number;
    
  @Column({
      type: "text",
      nullable: false,
    })
    ingredientes: string;

  @Column({
        type: "text",
        nullable: false,
    })
    description: string;
    
  @Column({ nullable: true })
  imageUrl: string;

  @Column({
        type: "int",
        nullable: false,
    })
    stock: number;


  @ManyToOne(() => Category, (category) => category.platos)
    @JoinColumn({ name: 'category_id' })
    category: Category;

  @Column({
      type: 'enum',
      enum: TipoProducto,
      default: TipoProducto.PLATOS,
    })
    type: TipoProducto;

}