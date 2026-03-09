import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { reservationStatus } from '../reservation-status.enum';
import { Users } from 'src/modules/users/entities/user.entity';
import { Pedidos } from 'src/modules/pedidos/entities/pedido.entity';

@Entity({
  name: 'RESERVATIONS',
})
export class Reservations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reservationDate: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  peopleCount: number;

  @Column()
  extraTime: string;

  @Column()
  extraTimePrice: string;

  @Column()
  totalPrice: string;

  @Column({
    type: 'enum',
    enum: reservationStatus,
    default: reservationStatus.CONFIRMADA,
  })
  status: reservationStatus;

  @ManyToOne(() => Users, (user) => user.reservations)
  user: Users;

  @OneToMany(() => Pedidos, (pedido) => pedido.reservation)
  pedidos: Pedidos[];
}
