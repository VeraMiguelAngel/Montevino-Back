import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Reservations } from "../../reservations/entities/reservation.entity";

@Entity({ name: "PEDIDOS" })
export class Pedidos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    quantity: number;

    @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 2 
    })
    price: number;

    @Column()
    menuItemId: number;

    @ManyToOne(() => Reservations, (reservation) => reservation.pedidos)
    reservation: Reservations;
}
