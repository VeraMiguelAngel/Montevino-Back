import { Bebidas } from "src/modules/bebidas/entities/bebidas.entity";
import { Platos } from "src/modules/platos/entities/platos.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'categories' })

export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
        type: "varchar",
        length: 50,
        nullable: false,
        unique: true,
    })
    name: string;

  @OneToMany(() => Platos, plato => plato.category)
  platos: Platos[];

  @OneToMany(() => Bebidas, bebida => bebida.category)
  bebidas: Bebidas[];
}
